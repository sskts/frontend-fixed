/**
 * 購入券種選択
 * @namespace Purchase.TicketModule
 */
import * as MVTK from '@motionpicture/mvtk-service';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as moment from 'moment';
import * as MP from '../../../libs/MP';
import TicketForm from '../../forms/Purchase/TicketForm';
import * as PurchaseSession from '../../models/Purchase/PurchaseModel';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';
import * as UtilModule from '../Util/UtilModule';
import * as MvtkUtilModule from './Mvtk/MvtkUtilModule';
const log = debug('SSKTS:Purchase.TicketModule');

/**
 * 券種選択
 * @memberOf Purchase.TicketModule
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
export async function index(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (req.session === undefined) throw ErrorUtilModule.ERROR_PROPERTY;
        if (req.session.purchase === undefined) throw ErrorUtilModule.ERROR_EXPIRE;
        const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
        if (purchaseModel.isExpired()) throw ErrorUtilModule.ERROR_EXPIRE;
        if (!purchaseModel.accessAuth(PurchaseSession.PurchaseModel.TICKET_STATE)) throw ErrorUtilModule.ERROR_ACCESS;
        if (purchaseModel.performance === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.transactionMP === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.performanceCOA === null) throw ErrorUtilModule.ERROR_PROPERTY;

        //券種取得
        const salesTicketsResult = await getSalesTickets(req, purchaseModel);
        const performance = purchaseModel.performance;
        const flgMvtkUse = purchaseModel.performanceCOA.flgMvtkUse;
        const dateMvtkBegin = purchaseModel.performanceCOA.dateMvtkBegin;
        const dateToday = moment().format('YYYYMMDD');
        res.locals.error = '';
        res.locals.mvtkFlg = (flgMvtkUse === '1' && dateMvtkBegin !== undefined && Number(dateMvtkBegin) <= Number(dateToday));
        res.locals.tickets = salesTicketsResult;
        res.locals.mvtkLength = (purchaseModel.mvtk === null) ? 0 : purchaseModel.mvtk.length;
        res.locals.performance = performance;
        res.locals.reserveSeats = purchaseModel.reserveSeats;
        res.locals.reserveTickets = purchaseModel.reserveTickets;
        res.locals.transactionId = purchaseModel.transactionMP.id;
        res.locals.kbnJoueihousiki = purchaseModel.performanceCOA.kbnJoueihousiki;
        res.locals.step = PurchaseSession.PurchaseModel.TICKET_STATE;
        //セッション更新
        req.session.purchase = purchaseModel.toSession();
        //券種選択表示
        res.render('purchase/ticket', { layout: 'layouts/purchase/layout' });
        return;
    } catch (err) {
        const error = (err instanceof Error)
            ? new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message)
            : new ErrorUtilModule.CustomError(err, undefined);
        next(error);
        return;
    }
}

/**
 * 券種決定
 * @memberOf Purchase.TicketModule
 * @function select
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
// tslint:disable-next-line:cyclomatic-complexity
// tslint:disable-next-line:max-func-body-length
export async function select(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (req.session === undefined) {
        next(new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_PROPERTY, undefined));
        return;
    }
    try {
        if (req.session.purchase === undefined) throw ErrorUtilModule.ERROR_EXPIRE;
        const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
        if (purchaseModel.isExpired()) throw ErrorUtilModule.ERROR_EXPIRE;
        if (purchaseModel.transactionMP === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.performance === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.reserveSeats === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.reserveTickets === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.authorizationCOA === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.performanceCOA === null) throw ErrorUtilModule.ERROR_PROPERTY;

        //取引id確認
        if (req.body.transaction_id !== purchaseModel.transactionMP.id) throw ErrorUtilModule.ERROR_ACCESS;
        //バリデーション
        TicketForm(req);
        const validationResult = await req.getValidationResult();
        if (validationResult.isEmpty()) {
            const reserveTickets: MP.IReserveTicket[] = JSON.parse(req.body.reserve_tickets);
            purchaseModel.reserveTickets = await ticketValidation(req, res, purchaseModel, reserveTickets);
            log('券種検証');
            // COAオーソリ削除
            await MP.removeCOAAuthorization({
                transactionId: purchaseModel.transactionMP.id,
                coaAuthorizationId: purchaseModel.authorizationCOA.id
            });
            log('MPCOAオーソリ削除');
            //COAオーソリ追加
            purchaseModel.authorizationCOA = await MP.addCOAAuthorization({
                transaction: purchaseModel.transactionMP,
                reserveSeatsTemporarilyResult: purchaseModel.reserveSeats,
                salesTicketResults: purchaseModel.reserveTickets,
                performance: purchaseModel.performance,
                performanceCOA: purchaseModel.performanceCOA,
                price: purchaseModel.getPrice()
            });
            log('MPCOAオーソリ追加', purchaseModel.authorizationCOA);
            if (purchaseModel.authorizationMvtk !== null) {
                // ムビチケオーソリ削除
                await MP.removeMvtkAuthorization({
                    transactionId: purchaseModel.transactionMP.id,
                    mvtkAuthorizationId: purchaseModel.authorizationMvtk.id
                });
                log('MPムビチケオーソリ削除');
            }
            if (purchaseModel.mvtk !== null && purchaseModel.isReserveMvtkTicket()) {
                // 購入管理番号情報
                const mvtk = MvtkUtilModule.createMvtkInfo(purchaseModel.reserveTickets, purchaseModel.mvtk);
                const mvtkTickets = mvtk.tickets;
                const mvtkSeats = mvtk.seats;
                log('購入管理番号情報', mvtkTickets);
                if (mvtkTickets.length === 0 || mvtkSeats.length === 0) throw ErrorUtilModule.ERROR_ACCESS;
                const mvtkFilmCode = MvtkUtilModule.getfilmCode(
                    purchaseModel.performanceCOA.titleCode,
                    purchaseModel.performanceCOA.titleBranchNum);
                // 興行会社ユーザー座席予約番号(予約番号)
                const startDate = {
                    day: `${moment(purchaseModel.performance.attributes.day).format('YYYY/MM/DD')}`,
                    time: `${UtilModule.timeFormat(purchaseModel.performance.attributes.time_start)}:00`
                };
                purchaseModel.authorizationMvtk = await MP.addMvtkauthorization({
                    transaction: purchaseModel.transactionMP, // 取引情報
                    amount: purchaseModel.getMvtkPrice(), // 合計金額
                    kgygishCd: MvtkUtilModule.COMPANY_CODE, // 興行会社コード
                    yykDvcTyp: MVTK.SeatInfoSyncUtilities.RESERVED_DEVICE_TYPE_ENTERTAINER_SITE_PC, // 予約デバイス区分
                    trkshFlg: MVTK.SeatInfoSyncUtilities.DELETE_FLAG_FALSE, // 取消フラグ
                    // tslint:disable-next-line:max-line-length
                    kgygishSstmZskyykNo: `${purchaseModel.performance.attributes.day}${purchaseModel.reserveSeats.tmp_reserve_num}`, // 興行会社システム座席予約番号
                    kgygishUsrZskyykNo: String(purchaseModel.reserveSeats.tmp_reserve_num), // 興行会社ユーザー座席予約番号
                    jeiDt: `${startDate.day} ${startDate.time}`, // 上映日時
                    kijYmd: startDate.day, // 計上年月日
                    stCd: MvtkUtilModule.getSiteCode(purchaseModel.performance.attributes.theater.id), // サイトコード
                    screnCd: purchaseModel.performanceCOA.screenCode, // スクリーンコード
                    knyknrNoInfo: mvtkTickets, // 購入管理番号情報
                    zskInfo: mvtkSeats, // 座席情報（itemArray）
                    skhnCd: mvtkFilmCode // 作品コード
                });
                log('MPムビチケオーソリ追加');
            }
            req.session.purchase = purchaseModel.toSession();
            log('セッション更新');
            res.redirect('/purchase/input');
            return;
        } else {
            throw ErrorUtilModule.ERROR_ACCESS;
        }
    } catch (err) {
        if (err === ErrorUtilModule.ERROR_VALIDATION) {
            if (req.session.purchase === undefined) throw ErrorUtilModule.ERROR_EXPIRE;
            const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
            if (purchaseModel.transactionMP === null) throw ErrorUtilModule.ERROR_PROPERTY;
            if (purchaseModel.performanceCOA === null) throw ErrorUtilModule.ERROR_PROPERTY;
            const salesTicketsResult = await getSalesTickets(req, purchaseModel);
            const performance = purchaseModel.performance;
            const flgMvtkUse = purchaseModel.performanceCOA.flgMvtkUse;
            const dateMvtkBegin = purchaseModel.performanceCOA.dateMvtkBegin;
            res.locals.mvtkFlg = (flgMvtkUse === '1' && dateMvtkBegin < moment().format('YYYYMMDD')) ? true : false;
            res.locals.mvtkLength = (purchaseModel.mvtk === null) ? 0 : purchaseModel.mvtk.length;
            res.locals.tickets = salesTicketsResult;
            res.locals.performance = performance;
            res.locals.reserveSeats = purchaseModel.reserveSeats;
            res.locals.reserveTickets = JSON.parse(req.body.reserve_tickets);
            res.locals.transactionId = purchaseModel.transactionMP.id;
            res.locals.kbnJoueihousiki = purchaseModel.performanceCOA.kbnJoueihousiki;
            res.locals.step = PurchaseSession.PurchaseModel.TICKET_STATE;
            res.render('purchase/ticket', { layout: 'layouts/purchase/layout' });
            return;
        }
        const error = (err instanceof Error)
            ? new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message)
            : new ErrorUtilModule.CustomError(err, undefined);
        next(error);
        return;
    }
}

/**
 * ムビチケ券種情報
 */
export interface ISalesTicket {
    /**
     * チケットコード
     */
    ticket_code: string;
    /**
     * チケット名
     */
    ticket_name: string;
    /**
     * チケット名(カナ)
     */
    ticket_name_kana: string;
    /**
     * チケット名(英)
     */
    ticket_name_eng: string;
    /**
     * 標準単価
     */
    std_price: number;
    /**
     * 加算単価
     */
    add_price: number;
    /**
     * 販売単価
     */
    sale_price: number;
    /**
     * チケット備考
     */
    ticket_note: string;
    /**
     * メガネ単価
     */
    add_price_glasses: number;
    /**
     * ムビチケ購入番号
     */
    mvtk_num: string;
    /**
     * メガネ有り無し
     */
    glasses: boolean;
}

/**
 * 券種リスト取得
 * @memberOf Purchase.TicketModule
 * @function getSalesTickets
 * @param {Request} req
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {Promise<SalesTicket[]>}
 */
async function getSalesTickets(
    req: Request,
    purchaseModel: PurchaseSession.PurchaseModel
): Promise<ISalesTicket[]> {
    if (purchaseModel.performance === null) throw ErrorUtilModule.ERROR_PROPERTY;
    if (purchaseModel.performanceCOA === null) throw ErrorUtilModule.ERROR_PROPERTY;
    if (purchaseModel.salesTicketsCOA === null) throw ErrorUtilModule.ERROR_PROPERTY;

    const result: ISalesTicket[] = [];

    for (const ticket of purchaseModel.salesTicketsCOA) {
        result.push({
            ticket_code: ticket.ticket_code, // チケットコード
            ticket_name: ticket.ticket_name, // チケット名
            ticket_name_kana: ticket.ticket_name_kana, // チケット名(カナ)
            ticket_name_eng: ticket.ticket_name_eng, // チケット名(英)
            std_price: ticket.std_price, // 標準単価
            add_price: ticket.add_price, // 加算単価
            sale_price: ticket.sale_price, // 販売単価
            ticket_note: ticket.ticket_note, // チケット備考
            add_price_glasses: 0, // メガネ単価
            mvtk_num: '', // ムビチケ購入番号
            glasses: false // メガネ有無
        });

        if (ticket.add_glasses > 0) {
            result.push({
                ticket_code: ticket.ticket_code, // チケットコード
                ticket_name: `${ticket.ticket_name}${req.__('common.glasses')}`, // チケット名
                ticket_name_kana: ticket.ticket_name_kana, // チケット名(カナ)
                ticket_name_eng: ticket.ticket_name_eng, // チケット名(英)
                std_price: ticket.std_price, // 標準単価
                add_price: ticket.add_price, // 加算単価
                sale_price: (<number>ticket.sale_price) + (<number>ticket.add_glasses), // 販売単価
                ticket_note: ticket.ticket_note, // チケット備考
                add_price_glasses: ticket.add_glasses, // メガネ単価
                mvtk_num: '', // ムビチケ購入番号
                glasses: true // メガネ有無
            });
        }
    }

    if (purchaseModel.mvtk === null) return result;
    // ムビチケ情報からチケット情報へ変換
    const mvtkTickets: ISalesTicket[] = [];
    for (const mvtk of purchaseModel.mvtk) {
        for (let i = 0; i < Number(mvtk.ykknInfo.ykknKnshbtsmiNum); i += 1) {
            mvtkTickets.push({
                ticket_code: mvtk.ticket.ticket_code, // チケットコード
                ticket_name: mvtk.ticket.ticket_name, // チケット名
                ticket_name_kana: mvtk.ticket.ticket_name_kana, // チケット名(カナ)
                ticket_name_eng: mvtk.ticket.ticket_name_eng, // チケット名(英)
                std_price: 0, // 標準単価
                add_price: mvtk.ticket.add_price, // 加算単価
                sale_price: mvtk.ticket.add_price, // 販売単価
                ticket_note: req.__('common.mvtk_code') + mvtk.code, // チケット備考
                add_price_glasses: mvtk.ticket.add_price_glasses, // メガネ単価
                mvtk_num: mvtk.code, // ムビチケ購入番号
                glasses: false  // メガネ有無
            });

            if (mvtk.ticket.add_price_glasses > 0) {
                mvtkTickets.push({
                    ticket_code: mvtk.ticket.ticket_code, // チケットコード
                    ticket_name: `${mvtk.ticket.ticket_name}${req.__('common.glasses')}`, // チケット名
                    ticket_name_kana: mvtk.ticket.ticket_name_kana, // チケット名(カナ)
                    ticket_name_eng: mvtk.ticket.ticket_name_eng, // チケット名(英)
                    std_price: 0, // 標準単価
                    add_price: mvtk.ticket.add_price, // 加算単価
                    sale_price: (<number>mvtk.ticket.add_price) + (<number>mvtk.ticket.add_price_glasses), // 販売単価
                    ticket_note: req.__('common.mvtk_code') + mvtk.code, // チケット備考
                    add_price_glasses: mvtk.ticket.add_price_glasses, // メガネ単価
                    mvtk_num: mvtk.code, // ムビチケ購入番号
                    glasses: true  // メガネ有無
                });
            }
        }
    }
    log('券種', mvtkTickets.concat(result));
    return mvtkTickets.concat(result);
}

/**
 * 券種検証
 * @memberOf Purchase.TicketModule
 * @function ticketValidation
 * @param {Request} req
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @param {PurchaseSession.ReserveTicket[]} reserveTickets
 * @returns {Promise<void>}
 */
// tslint:disable-next-line:cyclomatic-complexity
// tslint:disable-next-line:max-func-body-length
async function ticketValidation(
    req: Request,
    res: Response,
    purchaseModel: PurchaseSession.PurchaseModel,
    reserveTickets: MP.IReserveTicket[]
): Promise<MP.IReserveTicket[]> {
    if (purchaseModel.performance === null) throw ErrorUtilModule.ERROR_PROPERTY;
    if (purchaseModel.performanceCOA === null) throw ErrorUtilModule.ERROR_PROPERTY;
    if (purchaseModel.salesTicketsCOA === null) throw ErrorUtilModule.ERROR_PROPERTY;

    const result: MP.IReserveTicket[] = [];
    //コアAPI券種取得
    const salesTickets = purchaseModel.salesTicketsCOA;

    for (const ticket of reserveTickets) {
        if (ticket.mvtk_num !== '') {
            // ムビチケ
            if (purchaseModel.mvtk === null) throw ErrorUtilModule.ERROR_PROPERTY;
            const mvtkTicket = purchaseModel.mvtk.find((value) => {
                return (value.code === ticket.mvtk_num && value.ticket.ticket_code === ticket.ticket_code);
            });
            if (mvtkTicket === undefined) throw ErrorUtilModule.ERROR_ACCESS;
            result.push({
                section: ticket.section, // 座席セクション
                seat_code: ticket.seat_code, // 座席番号
                ticket_code: mvtkTicket.ticket.ticket_code, // チケットコード
                ticket_name: (ticket.glasses)
                    ? `${mvtkTicket.ticket.ticket_name}${req.__('common.glasses')}`
                    : mvtkTicket.ticket.ticket_name, // チケット名
                ticket_name_eng: mvtkTicket.ticket.ticket_name_eng, // チケット名（英）
                ticket_name_kana: mvtkTicket.ticket.ticket_name_kana, // チケット名（カナ）
                std_price: 0, // 標準単価
                add_price: mvtkTicket.ticket.add_price, // 加算単価
                dis_price: 0, // 割引額
                sale_price: (ticket.glasses)
                    ? (<number>mvtkTicket.ticket.add_price) + (<number>mvtkTicket.ticket.add_price_glasses)
                    : mvtkTicket.ticket.add_price, // 販売単価
                add_price_glasses: (ticket.glasses)
                    ? mvtkTicket.ticket.add_price_glasses
                    : 0, // メガネ単価
                glasses: ticket.glasses, // メガネ有り無し
                mvtk_app_price: Number(mvtkTicket.ykknInfo.kijUnip), // ムビチケ計上単価
                kbn_eisyahousiki: mvtkTicket.ykknInfo.eishhshkTyp, // ムビチケ映写方式区分
                mvtk_num: mvtkTicket.code, // ムビチケ購入管理番号
                mvtk_kbn_denshiken: mvtkTicket.ykknInfo.dnshKmTyp, // ムビチケ電子券区分
                mvtk_kbn_maeuriken: mvtkTicket.ykknInfo.znkkkytsknGkjknTyp, // ムビチケ前売券区分
                mvtk_kbn_kensyu: mvtkTicket.ykknInfo.ykknshTyp, // ムビチケ券種区分
                mvtk_sales_price: Number(mvtkTicket.ykknInfo.knshknhmbiUnip) // ムビチケ販売単価
            });
        } else {
            // 通常券種
            const salesTicket = salesTickets.find((value) => {
                return (value.ticket_code === ticket.ticket_code);
            });
            if (salesTicket === undefined) throw ErrorUtilModule.ERROR_ACCESS;
            // 制限単位、人数制限判定
            const mismatchTickets: string[] = [];
            const sameTickets = reserveTickets.filter((value) => {
                return (value.ticket_code === salesTicket.ticket_code);
            });
            if (sameTickets.length === 0) throw ErrorUtilModule.ERROR_ACCESS;
            if (salesTicket.limit_unit === '001') {
                if (sameTickets.length % salesTicket.limit_count !== 0) {
                    if (mismatchTickets.indexOf(ticket.ticket_code) === -1) {
                        mismatchTickets.push(ticket.ticket_code);
                    }
                }
            } else if (salesTicket.limit_unit === '002') {
                if (sameTickets.length < salesTicket.limit_count) {
                    if (mismatchTickets.indexOf(ticket.ticket_code) === -1) {
                        mismatchTickets.push(ticket.ticket_code);
                    }
                }
            }

            if (mismatchTickets.length > 0) {
                res.locals.error = JSON.stringify(mismatchTickets);
                throw ErrorUtilModule.ERROR_VALIDATION;
            }

            result.push({
                section: ticket.section, // 座席セクション
                seat_code: ticket.seat_code, // 座席番号
                ticket_code: salesTicket.ticket_code, // チケットコード
                ticket_name: (ticket.glasses)
                    ? `${salesTicket.ticket_name}${req.__('common.glasses')}`
                    : salesTicket.ticket_name, // チケット名
                ticket_name_eng: salesTicket.ticket_name_eng, // チケット名（英）
                ticket_name_kana: salesTicket.ticket_name_kana, // チケット名（カナ）
                std_price: salesTicket.std_price, // 標準単価
                add_price: salesTicket.add_price, // 加算単価
                dis_price: 0, // 割引額
                sale_price: (ticket.glasses)
                    ? (<number>salesTicket.sale_price) + (<number>salesTicket.add_glasses)
                    : salesTicket.sale_price, // 販売単価
                add_price_glasses: (ticket.glasses)
                    ? salesTicket.add_glasses
                    : 0, // メガネ単価
                glasses: ticket.glasses, // メガネ有り無し
                mvtk_app_price: 0, // ムビチケ計上単価
                kbn_eisyahousiki: '00', // ムビチケ映写方式区分
                mvtk_num: '', // ムビチケ購入管理番号
                mvtk_kbn_denshiken: '00', // ムビチケ電子券区分
                mvtk_kbn_maeuriken: '00', // ムビチケ前売券区分
                mvtk_kbn_kensyu: '00', // ムビチケ券種区分
                mvtk_sales_price: 0 // ムビチケ販売単価
            });
        }
    }
    return result;
}
