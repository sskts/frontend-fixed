/**
 * 購入座席選択
 * @namespace Purchase.SeatModule
 */

import * as COA from '@motionpicture/coa-service';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as fs from 'fs-extra';
import * as MP from '../../../libs/MP/sskts-api';
import * as seatForm from '../../forms/Purchase/SeatForm';
import { PurchaseModel } from '../../models/Purchase/PurchaseModel';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';
import * as UtilModule from '../Util/UtilModule';
const log = debug('SSKTS:Purchase.SeatModule');

/**
 * 座席選択
 * @memberof Purchase.SeatModule
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
        if (!purchaseModel.accessAuth(PurchaseModel.SEAT_STATE)) {
            throw ErrorUtilModule.ERROR_ACCESS;
        }
        if (req.params.id === undefined) throw ErrorUtilModule.ERROR_ACCESS;
        if (purchaseModel.transaction === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.seller === null) throw ErrorUtilModule.ERROR_PROPERTY;

        res.locals.individualScreeningEvent = purchaseModel.individualScreeningEvent;
        res.locals.reserveSeats = (purchaseModel.seatReservationAuthorization !== null)
            ? JSON.stringify(purchaseModel.seatReservationAuthorization) //仮予約中
            : null;
        res.locals.transactionId = purchaseModel.transaction.id;
        res.locals.error = null;
        res.locals.portalTheaterSite = purchaseModel.seller.sameAs;
        res.locals.step = PurchaseModel.SEAT_STATE;
        //セッション更新
        req.session.purchase = purchaseModel.toSession();
        res.render('purchase/seat', { layout: 'layouts/purchase/layout' });
    } catch (err) {
        const error = (err instanceof Error)
            ? new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message)
            : new ErrorUtilModule.CustomError(err, undefined);
        next(error);
    }
}

/**
 * 選択座席
 * @interface ReserveSeats
 */
interface ISelectSeats {
    seatNum: string;
    seatSection: string;
}

/**
 * 座席決定
 * @memberof Purchase.SeatModule
 * @function select
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
export async function select(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (req.session === undefined) throw ErrorUtilModule.ERROR_PROPERTY;
        if (req.session.purchase === undefined) throw ErrorUtilModule.ERROR_EXPIRE;
        const purchaseModel = new PurchaseModel(req.session.purchase);
        if (purchaseModel.isExpired()) throw ErrorUtilModule.ERROR_EXPIRE;
        if (purchaseModel.transaction === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (req.params.id === undefined) throw ErrorUtilModule.ERROR_ACCESS;
        //取引id確認
        if (req.body.transactionId !== purchaseModel.transaction.id) throw ErrorUtilModule.ERROR_ACCESS;
        if (purchaseModel.seller === null) throw ErrorUtilModule.ERROR_PROPERTY;

        //バリデーション
        seatForm.seatSelect(req);
        const validationResult = await req.getValidationResult();
        if (!validationResult.isEmpty()) {
            res.locals.transactionId = purchaseModel.transaction;
            res.locals.individualScreeningEvent = purchaseModel.individualScreeningEvent;
            res.locals.reserveSeats = req.body.seats;
            res.locals.error = validationResult.mapped();
            res.locals.portalTheaterSite = purchaseModel.seller.sameAs;
            res.locals.step = PurchaseModel.SEAT_STATE;
            res.render('purchase/seat', { layout: 'layouts/purchase/layout' });

            return;
        }
        const selectSeats: ISelectSeats[] = JSON.parse(req.body.seats).listTmpReserve;
        await reserve(req, selectSeats, purchaseModel);
        //セッション更新
        req.session.purchase = purchaseModel.toSession();
        // ムビチケセッション削除
        delete req.session.mvtk;
        //券種選択へ
        res.redirect('/purchase/ticket');

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
 * 座席仮予約
 * @memberof Purchase.SeatModule
 * @function reserve
 * @param {Request} req
 * @param {ReserveSeats[]} reserveSeats
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {Promise<void>}
 */
// tslint:disable-next-line:max-func-body-length
async function reserve(req: Request, selectSeats: ISelectSeats[], purchaseModel: PurchaseModel): Promise<void> {
    if (purchaseModel.individualScreeningEvent === null) throw ErrorUtilModule.ERROR_PROPERTY;
    if (purchaseModel.transaction === null) throw ErrorUtilModule.ERROR_PROPERTY;

    //予約中
    if (purchaseModel.seatReservationAuthorization !== null) {
        // TODO 仮予約削除

        log('仮予約削除');
    }

    if (purchaseModel.salesTickets === null) {
        //コアAPI券種取得
        const salesTicketResult = await COA.services.reserve.salesTicket({
            theaterCode: purchaseModel.individualScreeningEvent.coaInfo.theaterCode,
            dateJouei: purchaseModel.individualScreeningEvent.coaInfo.dateJouei,
            titleCode: purchaseModel.individualScreeningEvent.coaInfo.titleCode,
            titleBranchNum: purchaseModel.individualScreeningEvent.coaInfo.titleBranchNum,
            timeBegin: purchaseModel.individualScreeningEvent.coaInfo.timeBegin
        });
        purchaseModel.salesTickets = salesTicketResult;
        log('コアAPI券種取得', purchaseModel.salesTickets);
    }

    purchaseModel.seatReservationAuthorization = await MP.service.transaction.placeOrder.createSeatReservationAuthorization({
        auth: await UtilModule.createAuth(req),
        transactionId: purchaseModel.transaction.id,
        eventIdentifier: purchaseModel.individualScreeningEvent.identifier,
        offers: selectSeats.map((seat) => {
            const salesTickets = (<COA.services.reserve.ISalesTicketResult[]>purchaseModel.salesTickets)[0];

            return {
                seatSection: seat.seatSection,
                seatNumber: seat.seatNum,
                ticket: {
                    ticketCode: salesTickets.ticketCode,
                    stdPrice: salesTickets.stdPrice,
                    addPrice: salesTickets.addPrice,
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
            };
        })
    });
    log('MPオーソリ追加', purchaseModel.seatReservationAuthorization);
    purchaseModel.orderCount = 0;
    log('GMOオーソリカウント初期化');
}

/**
 * スクリーン状態取得
 * @memberof Purchase.SeatModule
 * @function getScreenStateReserve
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
export async function getScreenStateReserve(req: Request, res: Response): Promise<void> {
    try {
        //バリデーション
        seatForm.screenStateReserve(req);
        const validationResult = await req.getValidationResult();
        if (!validationResult.isEmpty()) throw ErrorUtilModule.ERROR_VALIDATION;
        const theaterCode = `00${req.body.theaterCode}`.slice(UtilModule.DIGITS_02);
        const screenCode = `000${req.body.screenCode}`.slice(UtilModule.DIGITS_03);
        const screen = await fs.readJSON(`./app/theaters/${theaterCode}/${screenCode}.json`);
        const setting = await fs.readJSON('./app/theaters/setting.json');
        const state = await COA.services.reserve.stateReserveSeat({
            theaterCode: req.body.theaterCode, // 施設コード
            dateJouei: req.body.dateJouei, // 上映日
            titleCode: req.body.titleCode, // 作品コード
            titleBranchNum: req.body.titleBranchNum, // 作品枝番
            timeBegin: req.body.timeBegin, // 上映時刻
            screenCode: req.body.screenCode // スクリーンコード
        });
        res.json({
            err: null,
            result: {
                screen: screen,
                setting: setting,
                state: state
            }
        });
    } catch (err) {
        res.json({ err: err, result: null });
    }
}

/**
 * 券種情報をセションへ保存
 * @memberof Purchase.SeatModule
 * @function getSalesTickets
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
export async function saveSalesTickets(req: Request, res: Response): Promise<void> {
    try {
        //バリデーション
        seatForm.salesTickets(req);
        const validationResult = await req.getValidationResult();
        if (!validationResult.isEmpty()) throw ErrorUtilModule.ERROR_VALIDATION;
        if (req.session === undefined) throw ErrorUtilModule.ERROR_PROPERTY;
        if (req.session.purchase === undefined) throw ErrorUtilModule.ERROR_EXPIRE;
        const purchaseModel = new PurchaseModel(req.session.purchase);
        if (purchaseModel.salesTickets === null) {
            //コアAPI券種取得
            purchaseModel.salesTickets = await COA.services.reserve.salesTicket({
                theaterCode: req.body.theaterCode,
                dateJouei: req.body.dateJouei,
                titleCode: req.body.titleCode,
                titleBranchNum: req.body.titleBranchNum,
                timeBegin: req.body.timeBegin
                // flgMember: coa.services.reserve.FlgMember.NonMember
            });
            log('コアAPI券種取得', purchaseModel.salesTickets);
            req.session.purchase = purchaseModel.toSession();
            res.json({ err: null });
        } else {
            res.json({ err: null });
        }
    } catch (err) {
        res.json({ err: err });
    }
}
