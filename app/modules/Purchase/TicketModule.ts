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

        //券種取得
        const today = moment().format('YYYYMMDD');
        res.locals.error = '';
        res.locals.mvtkFlg = (purchaseModel.individualScreeningEvent.superEvent.coaInfo.flgMvtkUse === '1'
            && purchaseModel.individualScreeningEvent.superEvent.coaInfo.dateMvtkBegin !== undefined
            && Number(purchaseModel.individualScreeningEvent.superEvent.coaInfo.dateMvtkBegin) <= Number(today));
        res.locals.salesTickets = purchaseModel.getSalesTickets(req);
        res.locals.purchaseModel = purchaseModel;
        res.locals.step = PurchaseModel.TICKET_STATE;
        //セッション更新
        purchaseModel.save(req.session);
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
            await MP.service.transaction.placeOrder.cancelSeatReservationAuthorization({
                auth: await UtilModule.createAuth(req),
                transactionId: purchaseModel.transaction.id,
                authorizationId: purchaseModel.seatReservationAuthorization.id
            });

            log('MPCOAオーソリ削除');
            //COAオーソリ追加
            const createSeatReservationAuthorizationArgs = {
                auth: await UtilModule.createAuth(req),
                transactionId: purchaseModel.transaction.id,
                eventIdentifier: purchaseModel.individualScreeningEvent.identifier,
                offers: (<IReserveTicket[]>purchaseModel.reserveTickets).map((reserveTicket) => {
                    return {
                        seatSection: reserveTicket.section,
                        seatNumber: reserveTicket.seatCode,
                        ticket: {
                            ticketCode: reserveTicket.ticketCode,
                            stdPrice: reserveTicket.stdPrice,
                            addPrice: reserveTicket.addPrice,
                            disPrice: reserveTicket.disPrice,
                            salePrice: reserveTicket.salePrice,
                            mvtkAppPrice: reserveTicket.mvtkAppPrice,
                            ticketCount: 1,
                            seatNum: reserveTicket.seatCode,
                            addGlasses: reserveTicket.addPriceGlasses,
                            kbnEisyahousiki: reserveTicket.kbnEisyahousiki,
                            mvtkNum: reserveTicket.mvtkNum,
                            mvtkKbnDenshiken: reserveTicket.mvtkKbnDenshiken,
                            mvtkKbnMaeuriken: reserveTicket.mvtkKbnKensyu,
                            mvtkKbnKensyu: reserveTicket.mvtkKbnKensyu,
                            mvtkSalesPrice: reserveTicket.mvtkSalesPrice
                        }
                    };
                })
            };
            log('MPCOAオーソリ追加IN', createSeatReservationAuthorizationArgs.offers[0]);
            purchaseModel.seatReservationAuthorization = await MP.service.transaction.placeOrder
                .createSeatReservationAuthorization(createSeatReservationAuthorizationArgs);
            log('MPCOAオーソリ追加', purchaseModel.seatReservationAuthorization);
            if (purchaseModel.mvtkAuthorization !== null) {
                // ムビチケオーソリ削除
                log('MPムビチケオーソリ削除');
            }
            if (purchaseModel.mvtk.length > 0 && purchaseModel.isReserveMvtkTicket()) {
                // 購入管理番号情報
                const mvtk = MvtkUtilModule.createMvtkInfo(purchaseModel.reserveTickets, purchaseModel.mvtk);
                const mvtkTickets = mvtk.tickets;
                const mvtkSeats = mvtk.seats;
                log('購入管理番号情報', mvtkTickets);
                if (mvtkTickets.length === 0 || mvtkSeats.length === 0) throw ErrorUtilModule.ERROR_ACCESS;
                const mvtkFilmCode = MvtkUtilModule.getfilmCode(
                    purchaseModel.individualScreeningEvent.coaInfo.titleCode,
                    purchaseModel.individualScreeningEvent.coaInfo.titleBranchNum
                );
                // 興行会社ユーザー座席予約番号(予約番号)
                const startDate = {
                    day: `${moment(purchaseModel.individualScreeningEvent.coaInfo.dateJouei).format('YYYY/MM/DD')}`,
                    time: `${UtilModule.timeFormat(purchaseModel.individualScreeningEvent.coaInfo.timeBegin)}:00`
                };
                purchaseModel.mvtkAuthorization = await MP.service.transaction.placeOrder.createMvtkAuthorization({
                    auth: await UtilModule.createAuth(req),
                    transactionId: purchaseModel.transaction.id, // 取引情報
                    mvtk: {
                        price: purchaseModel.getMvtkPrice(), // 合計金額
                        kgygish_cd: MvtkUtilModule.COMPANY_CODE, // 興行会社コード
                        yyk_dvc_typ: MVTK.SeatInfoSyncUtilities.RESERVED_DEVICE_TYPE_ENTERTAINER_SITE_PC, // 予約デバイス区分
                        trksh_flg: MVTK.SeatInfoSyncUtilities.DELETE_FLAG_FALSE, // 取消フラグ
                        // tslint:disable-next-line:max-line-length
                        kgygish_sstm_zskyyk_no: `${purchaseModel.individualScreeningEvent.coaInfo.dateJouei}${purchaseModel.seatReservationAuthorization.tmpReserveNum}`, // 興行会社システム座席予約番号
                        kgygish_usr_zskyyk_no: String(purchaseModel.seatReservationAuthorization.tmpReserveNum), // 興行会社ユーザー座席予約番号
                        jei_dt: `${startDate.day} ${startDate.time}`, // 上映日時
                        kij_ymd: startDate.day, // 計上年月日
                        st_cd: MvtkUtilModule.getSiteCode(purchaseModel.individualScreeningEvent.coaInfo.theaterCode), // サイトコード
                        scren_cd: purchaseModel.individualScreeningEvent.coaInfo.screenCode, // スクリーンコード
                        knyknr_no_info: mvtkTickets, // 購入管理番号情報
                        zsk_info: mvtkSeats, // 座席情報（itemArray）
                        skhn_cd: mvtkFilmCode // 作品コード
                    }

                });
                log('MPムビチケオーソリ追加');
            }
            purchaseModel.save(req.session);
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
            const today = moment().format('YYYYMMDD');
            res.locals.error = '';
            res.locals.mvtkFlg = (purchaseModel.individualScreeningEvent.superEvent.coaInfo.flgMvtkUse === '1'
                && purchaseModel.individualScreeningEvent.superEvent.coaInfo.dateMvtkBegin !== undefined
                && Number(purchaseModel.individualScreeningEvent.superEvent.coaInfo.dateMvtkBegin) <= Number(today));
            res.locals.salesTickets = purchaseModel.getSalesTickets(req);
            res.locals.purchaseModel = purchaseModel;
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
