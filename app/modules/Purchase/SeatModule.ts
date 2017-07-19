/**
 * 購入座席選択
 * @namespace Purchase.SeatModule
 */

import * as COA from '@motionpicture/coa-service';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as fs from 'fs-extra';
import * as MP from '../../../libs/MP';
import * as seatForm from '../../forms/Purchase/SeatForm';
import * as PurchaseSession from '../../models/Purchase/PurchaseModel';
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
        const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
        if (purchaseModel.isExpired()) throw ErrorUtilModule.ERROR_EXPIRE;
        if (!purchaseModel.accessAuth(PurchaseSession.PurchaseModel.SEAT_STATE)) {
            throw ErrorUtilModule.ERROR_ACCESS;
        }
        if (req.params.id === undefined) throw ErrorUtilModule.ERROR_ACCESS;
        if (purchaseModel.transactionMP === null) throw ErrorUtilModule.ERROR_PROPERTY;
        purchaseModel.performance = await MP.services.performance.getPerformance({
            accessToken: await UtilModule.getAccessToken(req),
            performanceId: req.params.id
        });
        log('パフォーマンス取得');

        purchaseModel.theater = await MP.services.theater.getTheater({
            accessToken: await UtilModule.getAccessToken(req),
            theaterId: purchaseModel.performance.attributes.theater.id
        });
        log('劇場詳細取得');
        if (purchaseModel.theater === null) throw ErrorUtilModule.ERROR_PROPERTY;
        const website = purchaseModel.theater.attributes.websites.find((value) => {
            return (value.group === 'PORTAL');
        });

        const screen = await MP.services.screen.getScreen({
            accessToken: await UtilModule.getAccessToken(req),
            screenId: purchaseModel.performance.attributes.screen.id
        });
        log('スクリーン取得');
        const film = await MP.services.film.getFilm({
            accessToken: await UtilModule.getAccessToken(req),
            filmId: purchaseModel.performance.attributes.film.id
        });
        log('作品取得');

        purchaseModel.performanceCOA = {
            theaterCode: purchaseModel.theater.id,
            screenCode: screen.attributes.coaScreenCode,
            titleCode: film.attributes.coaTitleCode,
            titleBranchNum: film.attributes.coaTitleBranchNum,
            flgMvtkUse: film.attributes.flgMvtkUse,
            dateMvtkBegin: film.attributes.dateMvtkBegin,
            kbnJoueihousiki: film.attributes.kbnJoueihousiki
        };
        log('COAパフォーマンス取得');

        res.locals.performance = purchaseModel.performance;
        res.locals.performanceCOA = purchaseModel.performanceCOA;
        res.locals.reserveSeats = (purchaseModel.reserveSeats !== null)
            ? JSON.stringify(purchaseModel.reserveSeats) //仮予約中
            : null;
        res.locals.transactionId = purchaseModel.transactionMP.id;
        res.locals.error = null;
        res.locals.portalTheaterSite = (website !== undefined) ? website.url : process.env.PORTAL_SITE_URL;
        res.locals.step = PurchaseSession.PurchaseModel.SEAT_STATE;
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
        const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
        if (purchaseModel.isExpired()) throw ErrorUtilModule.ERROR_EXPIRE;
        if (purchaseModel.transactionMP === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (req.params.id === undefined) throw ErrorUtilModule.ERROR_ACCESS;
        //取引id確認
        if (req.body.transactionId !== purchaseModel.transactionMP.id) throw ErrorUtilModule.ERROR_ACCESS;
        if (purchaseModel.theater === null) throw ErrorUtilModule.ERROR_PROPERTY;
        const website = purchaseModel.theater.attributes.websites.find((value) => {
            return (value.group === 'PORTAL');
        });
        //バリデーション
        seatForm.seatSelect(req);
        const validationResult = await req.getValidationResult();
        if (!validationResult.isEmpty()) {
            res.locals.transactionId = purchaseModel.transactionMP;
            res.locals.performance = purchaseModel.performance;
            res.locals.reserveSeats = req.body.seats;
            res.locals.error = validationResult.mapped();
            res.locals.portalTheaterSite = (website !== undefined) ? website.url : process.env.PORTAL_SITE_URL;
            res.locals.step = PurchaseSession.PurchaseModel.SEAT_STATE;
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
async function reserve(req: Request, selectSeats: ISelectSeats[], purchaseModel: PurchaseSession.PurchaseModel): Promise<void> {
    if (purchaseModel.performance === null) throw ErrorUtilModule.ERROR_PROPERTY;
    if (purchaseModel.transactionMP === null) throw ErrorUtilModule.ERROR_PROPERTY;
    if (purchaseModel.performanceCOA === null) throw ErrorUtilModule.ERROR_PROPERTY;
    const performance = purchaseModel.performance;

    //予約中
    if (purchaseModel.reserveSeats !== null) {
        if (purchaseModel.authorizationCOA === null) throw ErrorUtilModule.ERROR_PROPERTY;
        const reserveSeats = purchaseModel.reserveSeats;
        //COA仮予約削除
        await COA.services.reserve.delTmpReserve({
            theaterCode: performance.attributes.theater.id,
            dateJouei: performance.attributes.day,
            titleCode: purchaseModel.performanceCOA.titleCode,
            titleBranchNum: purchaseModel.performanceCOA.titleBranchNum,
            timeBegin: performance.attributes.timeStart,
            tmpReserveNum: reserveSeats.tmpReserveNum
        });
        log('COA仮予約削除');
        // COAオーソリ削除
        await MP.services.transaction.removeAuthorization({
            accessToken: await UtilModule.getAccessToken(req),
            transactionId: purchaseModel.transactionMP.id,
            authorizationId: purchaseModel.authorizationCOA.id
        });
        log('MPCOAオーソリ削除');
    }

    log('11111111111111', selectSeats[0]);

    //COA仮予約
    purchaseModel.reserveSeats = await COA.services.reserve.updTmpReserveSeat({
        theaterCode: performance.attributes.theater.id,
        dateJouei: performance.attributes.day,
        titleCode: purchaseModel.performanceCOA.titleCode,
        titleBranchNum: purchaseModel.performanceCOA.titleBranchNum,
        timeBegin: performance.attributes.timeStart,
        // cnt_reserve_seat: number,
        screenCode: purchaseModel.performanceCOA.screenCode,
        listSeat: selectSeats
    });
    log('COA仮予約', purchaseModel.reserveSeats);

    if (purchaseModel.salesTicketsCOA === null) {
        //コアAPI券種取得
        purchaseModel.salesTicketsCOA = await COA.services.reserve.salesTicket({
            theaterCode: purchaseModel.performance.attributes.theater.id,
            dateJouei: purchaseModel.performance.attributes.day,
            titleCode: purchaseModel.performanceCOA.titleCode,
            titleBranchNum: purchaseModel.performanceCOA.titleBranchNum,
            timeBegin: purchaseModel.performance.attributes.timeStart
            // flg_member: COA.services.reserve.FlgMember.NonMember
        });
        log('コアAPI券種取得', purchaseModel.salesTicketsCOA);
    }

    //コアAPI券種取得
    const salesTickets = purchaseModel.salesTicketsCOA;

    purchaseModel.reserveTickets = [];
    //予約チケット作成
    const tmpReserveTickets = purchaseModel.reserveSeats.listTmpReserve.map((tmpReserve): MP.services.transaction.IReserveTicket => {
        return {
            section: tmpReserve.seatSection,
            seatCode: tmpReserve.seatNum,
            ticketCode: salesTickets[0].ticketCode,
            ticketName: salesTickets[0].ticketName,
            ticketNameEng: salesTickets[0].ticketNameEng,
            ticketNameKana: salesTickets[0].ticketNameKana,
            stdPrice: salesTickets[0].stdPrice,
            addPrice: salesTickets[0].addPrice,
            disPrice: 0,
            salePrice: salesTickets[0].salePrice,
            addPriceGlasses: 0,
            glasses: false,
            mvtkAppPrice: 0,
            kbnEisyahousiki: '00', // ムビチケ映写方式区分
            mvtkNum: '', // ムビチケ購入管理番号
            mvtkKbnDenshiken: '00', // ムビチケ電子券区分
            mvtkKbnMaeuriken: '00', // ムビチケ前売券区分
            mvtkKbnKensyu: '00', // ムビチケ券種区分
            mvtkSalesPrice: 0 // ムビチケ販売単価
        };
    });
    let price = 0;
    for (const tmpReserveTicket of tmpReserveTickets) {
        price += tmpReserveTicket.salePrice;
    }
    //COAオーソリ追加
    const coaAuthorizationResult = await MP.services.transaction.addCOAAuthorization({
        accessToken: await UtilModule.getAccessToken(req),
        transaction: purchaseModel.transactionMP,
        reserveSeatsTemporarilyResult: purchaseModel.reserveSeats,
        salesTicketResults: tmpReserveTickets,
        performance: performance,
        theaterCode: purchaseModel.performanceCOA.theaterCode,
        titleCode: purchaseModel.performanceCOA.titleCode,
        titleBranchNum: purchaseModel.performanceCOA.titleBranchNum,
        screenCode: purchaseModel.performanceCOA.screenCode,
        price: price
    });
    log('MPCOAオーソリ追加', coaAuthorizationResult);
    purchaseModel.authorizationCOA = coaAuthorizationResult;
    purchaseModel.authorizationCountGMO = 0;
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
        const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
        if (purchaseModel.salesTicketsCOA === null) {
            //コアAPI券種取得
            purchaseModel.salesTicketsCOA = await COA.services.reserve.salesTicket({
                theaterCode: req.body.theaterCode,
                dateJouei: req.body.dateJouei,
                titleCode: req.body.titleCode,
                titleBranchNum: req.body.titleBranchNum,
                timeBegin: req.body.timeBegin
                // flgMember: coa.services.reserve.FlgMember.NonMember
            });
            log('コアAPI券種取得', purchaseModel.salesTicketsCOA);
            req.session.purchase = purchaseModel.toSession();
            res.json({ err: null });
        } else {
            res.json({ err: null });
        }
    } catch (err) {
        res.json({ err: err });
    }
}
