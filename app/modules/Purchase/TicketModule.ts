/**
 * 購入券種選択
 * @namespace Purchase.TicketModule
 */
import * as MVTK from '@motionpicture/mvtk-service';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as moment from 'moment';
import * as MP from '../../../libs/MP/sskts-api';
import TicketForm from '../../forms/Purchase/TicketForm';
import { IReserveTicket, PurchaseModel } from '../../models/Purchase/PurchaseModel';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';
import * as UtilModule from '../Util/UtilModule';
import * as MvtkUtilModule from './Mvtk/MvtkUtilModule';
const log = debug('SSKTS:Purchase.TicketModule');

/**
 * 券種選択
 * @memberof Purchase.TicketModule
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
        const purchaseModel = new PurchaseModel(req.session.purchase);
        if (purchaseModel.isExpired()) throw ErrorUtilModule.ERROR_EXPIRE;
        if (!purchaseModel.accessAuth(PurchaseModel.TICKET_STATE)) throw ErrorUtilModule.ERROR_ACCESS;
        if (purchaseModel.individualScreeningEvent === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.transaction === null) throw ErrorUtilModule.ERROR_PROPERTY;

        //券種取得
        const salesTicketsResult = await getSalesTickets(req, purchaseModel);
        const individualScreeningEvent = purchaseModel.individualScreeningEvent;
        const today = moment().format('YYYYMMDD');
        res.locals.error = '';
        res.locals.mvtkFlg = (individualScreeningEvent.superEvent.coaInfo.flgMvtkUse === '1'
            && individualScreeningEvent.superEvent.coaInfo.dateMvtkBegin !== undefined
            && Number(individualScreeningEvent.superEvent.coaInfo.dateMvtkBegin) <= Number(today));
        res.locals.tickets = salesTicketsResult;
        res.locals.mvtkLength = (purchaseModel.mvtk === null) ? 0 : purchaseModel.mvtk.length;
        res.locals.performance = performance;
        res.locals.seatReservationAuthorization = purchaseModel.seatReservationAuthorization;
        res.locals.reserveTickets = purchaseModel.reserveTickets;
        res.locals.transactionId = purchaseModel.transaction.id;
        res.locals.kbnJoueihousiki = individualScreeningEvent.superEvent.coaInfo.kbnJoueihousiki;
        res.locals.step = PurchaseModel.TICKET_STATE;
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
 * 選択チケット
 * @interface ISelectTicket
 */
export interface ISelectTicket {
    /**
     * 座席セクション
     */
    section: string;
    /**
     * 座席番号
     */
    seatCode: string;
    /**
     * チケットコード
     */
    ticketCode: string;
    /**
     * チケット名
     */
    ticketName: string;
    /**
     * 販売単価
     */
    salePrice: number;
    /**
     * メガネ有り無し
     */
    glasses: boolean;
    /**
     * メガネ加算単価
     */
    addPriceGlasses: number;
    /**
     * ムビチケ購入番号
     */
    mvtkNum: string;
}

/**
 * 券種決定
 * @memberof Purchase.TicketModule
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
        const purchaseModel = new PurchaseModel(req.session.purchase);
        if (purchaseModel.isExpired()) throw ErrorUtilModule.ERROR_EXPIRE;
        if (purchaseModel.transaction === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.individualScreeningEvent === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.seatReservationAuthorization === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.reserveTickets === null) throw ErrorUtilModule.ERROR_PROPERTY;

        //取引id確認
        if (req.body.transactionId !== purchaseModel.transaction.id) throw ErrorUtilModule.ERROR_ACCESS;
        //バリデーション
        TicketForm(req);
        const validationResult = await req.getValidationResult();
        if (validationResult.isEmpty()) {
            const selectTickets: ISelectTicket[] = JSON.parse(req.body.reserveTickets);
            purchaseModel.reserveTickets = await ticketValidation(req, res, purchaseModel, selectTickets);
            log('券種検証');
            // COAオーソリ削除

            log('MPCOAオーソリ削除');
            //COAオーソリ追加
            purchaseModel.seatReservationAuthorization = await MP.service.transaction.placeOrder.createSeatReservationAuthorization({
                auth: await UtilModule.createAuth(req),
                transactionId: purchaseModel.transaction.id,
                eventIdentifier: purchaseModel.individualScreeningEvent.identifier,
                offers: purchaseModel.seatReservationAuthorization.result.listTmpReserve.map((seat: any) => {

                    return {
                        seatSection: seat.seatSection,
                        seatNumber: seat.seatNum,
                        ticket: reserveTickets.map((reserveTicket) => {
                            return {
                                ticketCode: reserveTicket.ticketCode,
                                stdPrice: reserveTicket.s,
                                addPrice: reserveTicket.,
                                disPrice: 0,
                                salePrice: salesTickets.salePrice,
                                mvtkAppPrice: 0,
                                ticketCount: 1,
                                seatNum: seat.seatNum,
                                addGlasses: 0,
                                kbnEisyahousiki: '00',
                                mvtkNum: '',
                                mvtkKbnDenshiken: '00',
                                mvtkKbnMaeuriken: '00',
                                mvtkKbnKensyu: '00',
                                mvtkSalesPrice: 0
                            }
                        })
                    };
                })
            });
            log('MPCOAオーソリ追加', purchaseModel.authorizationCOA);
            if (purchaseModel.authorizationMvtk !== null) {
                // ムビチケオーソリ削除
                await MP.services.transaction.removeAuthorization({
                    auth: await UtilModule.createAuth(req),
                    transactionId: purchaseModel.transaction.id,
                    authorizationId: purchaseModel.authorizationMvtk.id
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
                    time: `${UtilModule.timeFormat(purchaseModel.performance.attributes.timeStart)}:00`
                };
                purchaseModel.authorizationMvtk = await MP.services.transaction.addMvtkauthorization({
                    auth: await UtilModule.createAuth(req),
                    transaction: purchaseModel.transaction, // 取引情報
                    amount: purchaseModel.getMvtkPrice(), // 合計金額
                    kgygishCd: MvtkUtilModule.COMPANY_CODE, // 興行会社コード
                    yykDvcTyp: MVTK.SeatInfoSyncUtilities.RESERVED_DEVICE_TYPE_ENTERTAINER_SITE_PC, // 予約デバイス区分
                    trkshFlg: MVTK.SeatInfoSyncUtilities.DELETE_FLAG_FALSE, // 取消フラグ
                    // tslint:disable-next-line:max-line-length
                    kgygishSstmZskyykNo: `${purchaseModel.performance.attributes.day}${purchaseModel.reserveSeats.tmpReserveNum}`, // 興行会社システム座席予約番号
                    kgygishUsrZskyykNo: String(purchaseModel.reserveSeats.tmpReserveNum), // 興行会社ユーザー座席予約番号
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
            const purchaseModel = new PurchaseModel(req.session.purchase);
            if (purchaseModel.transaction === null) throw ErrorUtilModule.ERROR_PROPERTY;
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
            res.locals.reserveTickets = JSON.parse(req.body.reserveTickets);
            res.locals.transactionId = purchaseModel.transaction.id;
            res.locals.kbnJoueihousiki = purchaseModel.performanceCOA.kbnJoueihousiki;
            res.locals.step = PurchaseModel.TICKET_STATE;
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
 * 券種
 * @interface ISalesTicket
 */
interface ISalesTicket {
    /**
     * チケットコード
     */
    ticketCode: string;
    /**
     * チケット名
     */
    ticketName: string;
    /**
     * チケット名(カナ)
     */
    ticketNameKana: string;
    /**
     * チケット名(英)
     */
    ticketNameEng: string;
    /**
     * 標準単価
     */
    stdPrice: number;
    /**
     * 加算単価
     */
    addPrice: number;
    /**
     * 販売単価
     */
    salePrice: number;
    /**
     * チケット備考
     */
    ticketNote: string;
    /**
     * メガネ単価
     */
    addPriceGlasses: number;
    /**
     * ムビチケ購入番号
     */
    mvtkNum: string;
    /**
     * メガネ有無
     */
    glasses: boolean;
}

/**
 * 券種リスト取得
 * @memberof Purchase.TicketModule
 * @function getSalesTickets
 * @param {Request} req
 * @param {PurchaseModel} purchaseModel
 * @returns {Promise<ISalesTicket[]>}
 */
async function getSalesTickets(
    req: Request,
    purchaseModel: PurchaseModel
): Promise<ISalesTicket[]> {
    if (purchaseModel.individualScreeningEvent === null) throw ErrorUtilModule.ERROR_PROPERTY;
    if (purchaseModel.salesTickets === null) throw ErrorUtilModule.ERROR_PROPERTY;

    const result: ISalesTicket[] = [];

    for (const ticket of purchaseModel.salesTickets) {
        result.push({
            ticketCode: ticket.ticketCode, // チケットコード
            ticketName: ticket.ticketName, // チケット名
            ticketNameKana: ticket.ticketNameKana, // チケット名(カナ)
            ticketNameEng: ticket.ticketNameEng, // チケット名(英)
            stdPrice: ticket.stdPrice, // 標準単価
            addPrice: ticket.addPrice, // 加算単価
            salePrice: ticket.salePrice, // 販売単価
            ticketNote: ticket.ticketNote, // チケット備考
            addPriceGlasses: 0, // メガネ単価
            mvtkNum: '', // ムビチケ購入番号
            glasses: false // メガネ有無
        });

        if (ticket.addGlasses > 0) {
            result.push({
                ticketCode: ticket.ticketCode, // チケットコード
                ticketName: `${ticket.ticketName}${req.__('common.glasses')}`, // チケット名
                ticketNameKana: ticket.ticketNameKana, // チケット名(カナ)
                ticketNameEng: ticket.ticketNameEng, // チケット名(英)
                stdPrice: ticket.stdPrice, // 標準単価
                addPrice: ticket.addPrice, // 加算単価
                salePrice: (<number>ticket.salePrice) + (<number>ticket.addGlasses), // 販売単価
                ticketNote: ticket.ticketNote, // チケット備考
                addPriceGlasses: ticket.addGlasses, // メガネ単価
                mvtkNum: '', // ムビチケ購入番号
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
                ticketCode: mvtk.ticket.ticketCode, // チケットコード
                ticketName: mvtk.ticket.ticketName, // チケット名
                ticketNameKana: mvtk.ticket.ticketNameKana, // チケット名(カナ)
                ticketNameEng: mvtk.ticket.ticketNameEng, // チケット名(英)
                stdPrice: 0, // 標準単価
                addPrice: mvtk.ticket.addPrice, // 加算単価
                salePrice: mvtk.ticket.addPrice, // 販売単価
                ticketNote: req.__('common.mvtkCode') + mvtk.code, // チケット備考
                addPriceGlasses: mvtk.ticket.addPriceGlasses, // メガネ単価
                mvtkNum: mvtk.code, // ムビチケ購入番号
                glasses: false  // メガネ有無
            });

            if (mvtk.ticket.addPriceGlasses > 0) {
                mvtkTickets.push({
                    ticketCode: mvtk.ticket.ticketCode, // チケットコード
                    ticketName: `${mvtk.ticket.ticketName}${req.__('common.glasses')}`, // チケット名
                    ticketNameKana: mvtk.ticket.ticketNameKana, // チケット名(カナ)
                    ticketNameEng: mvtk.ticket.ticketNameEng, // チケット名(英)
                    stdPrice: 0, // 標準単価
                    addPrice: mvtk.ticket.addPrice, // 加算単価
                    salePrice: (<number>mvtk.ticket.addPrice) + (<number>mvtk.ticket.addPriceGlasses), // 販売単価
                    ticketNote: req.__('common.mvtkCode') + mvtk.code, // チケット備考
                    addPriceGlasses: mvtk.ticket.addPriceGlasses, // メガネ単価
                    mvtkNum: mvtk.code, // ムビチケ購入番号
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
 * @memberof Purchase.TicketModule
 * @function ticketValidation
 * @param {Request} req
 * @param {PurchaseModel} purchaseModel
 * @param {ISelectTicket[]} rselectTickets
 * @returns {Promise<void>}
 */
// tslint:disable-next-line:cyclomatic-complexity
// tslint:disable-next-line:max-func-body-length
async function ticketValidation(
    req: Request,
    res: Response,
    purchaseModel: PurchaseModel,
    selectTickets: ISelectTicket[]
): Promise<IReserveTicket[]> {
    if (purchaseModel.individualScreeningEvent === null) throw ErrorUtilModule.ERROR_PROPERTY;
    if (purchaseModel.salesTickets === null) throw ErrorUtilModule.ERROR_PROPERTY;

    const result: IReserveTicket[] = [];
    //コアAPI券種取得
    const salesTickets = purchaseModel.salesTickets;

    for (const ticket of selectTickets) {
        if (ticket.mvtkNum !== '') {
            // ムビチケ
            if (purchaseModel.mvtk === null) throw ErrorUtilModule.ERROR_PROPERTY;
            const mvtkTicket = purchaseModel.mvtk.find((value) => {
                return (value.code === ticket.mvtkNum && value.ticket.ticketCode === ticket.ticketCode);
            });
            if (mvtkTicket === undefined) throw ErrorUtilModule.ERROR_ACCESS;
            const reserveTicket: IReserveTicket = {
                section: ticket.section,
                seatCode: ticket.seatCode,
                ticketCode: mvtkTicket.ticket.ticketCode, // チケットコード
                ticketName: (ticket.glasses)
                    ? `${mvtkTicket.ticket.ticketName}${req.__('common.glasses')}`
                    : mvtkTicket.ticket.ticketName, // チケット名
                ticketNameEng: mvtkTicket.ticket.ticketNameEng, // チケット名（英）
                ticketNameKana: mvtkTicket.ticket.ticketNameKana, // チケット名（カナ）
                stdPrice: 0, // 標準単価
                addPrice: mvtkTicket.ticket.addPrice, // 加算単価
                disPrice: 0, // 割引額
                salePrice: (ticket.glasses)
                    ? (<number>mvtkTicket.ticket.addPrice) + (<number>mvtkTicket.ticket.addPriceGlasses)
                    : mvtkTicket.ticket.addPrice, // 販売単価
                ticketNote: '',
                addPriceGlasses: (ticket.glasses)
                    ? mvtkTicket.ticket.addPriceGlasses
                    : 0, // メガネ単価
                glasses: ticket.glasses, // メガネ有り無し
                mvtkAppPrice: Number(mvtkTicket.ykknInfo.kijUnip), // ムビチケ計上単価
                kbnEisyahousiki: mvtkTicket.ykknInfo.eishhshkTyp, // ムビチケ映写方式区分
                mvtkNum: mvtkTicket.code, // ムビチケ購入管理番号
                mvtkKbnDenshiken: mvtkTicket.ykknInfo.dnshKmTyp, // ムビチケ電子券区分
                mvtkKbnMaeuriken: mvtkTicket.ykknInfo.znkkkytsknGkjknTyp, // ムビチケ前売券区分
                mvtkKbnKensyu: mvtkTicket.ykknInfo.ykknshTyp, // ムビチケ券種区分
                mvtkSalesPrice: Number(mvtkTicket.ykknInfo.knshknhmbiUnip) // ムビチケ販売単価
            };
            result.push(reserveTicket);
        } else {
            // 通常券種
            const salesTicket = salesTickets.find((value) => {
                return (value.ticketCode === ticket.ticketCode);
            });
            if (salesTicket === undefined) throw ErrorUtilModule.ERROR_ACCESS;
            // 制限単位、人数制限判定
            const mismatchTickets: string[] = [];
            const sameTickets = selectTickets.filter((value) => {
                return (value.ticketCode === salesTicket.ticketCode);
            });
            if (sameTickets.length === 0) throw ErrorUtilModule.ERROR_ACCESS;
            if (salesTicket.limitUnit === '001') {
                if (sameTickets.length % salesTicket.limitCount !== 0) {
                    if (mismatchTickets.indexOf(ticket.ticketCode) === -1) {
                        mismatchTickets.push(ticket.ticketCode);
                    }
                }
            } else if (salesTicket.limitUnit === '002') {
                if (sameTickets.length < salesTicket.limitCount) {
                    if (mismatchTickets.indexOf(ticket.ticketCode) === -1) {
                        mismatchTickets.push(ticket.ticketCode);
                    }
                }
            }

            if (mismatchTickets.length > 0) {
                res.locals.error = JSON.stringify(mismatchTickets);
                throw ErrorUtilModule.ERROR_VALIDATION;
            }

            result.push({
                section: ticket.section, // 座席セクション
                seatCode: ticket.seatCode, // 座席番号
                ticketCode: salesTicket.ticketCode, // チケットコード
                ticketName: (ticket.glasses)
                    ? `${salesTicket.ticketName}${req.__('common.glasses')}`
                    : salesTicket.ticketName, // チケット名
                ticketNameEng: salesTicket.ticketNameEng, // チケット名（英）
                ticketNameKana: salesTicket.ticketNameKana, // チケット名（カナ）
                stdPrice: salesTicket.stdPrice, // 標準単価
                addPrice: salesTicket.addPrice, // 加算単価
                disPrice: 0, // 割引額
                salePrice: (ticket.glasses)
                    ? (<number>salesTicket.salePrice) + (<number>salesTicket.addGlasses)
                    : salesTicket.salePrice, // 販売単価
                ticketNote: salesTicket.ticketNote,
                addPriceGlasses: (ticket.glasses)
                    ? salesTicket.addGlasses
                    : 0, // メガネ単価
                glasses: ticket.glasses, // メガネ有り無し
                mvtkAppPrice: 0, // ムビチケ計上単価
                kbnEisyahousiki: '00', // ムビチケ映写方式区分
                mvtkNum: '', // ムビチケ購入管理番号
                mvtkKbnDenshiken: '00', // ムビチケ電子券区分
                mvtkKbnMaeuriken: '00', // ムビチケ前売券区分
                mvtkKbnKensyu: '00', // ムビチケ券種区分
                mvtkSalesPrice: 0 // ムビチケ販売単価
            });
        }
    }

    return result;
}
