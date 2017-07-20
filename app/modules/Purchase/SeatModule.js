"use strict";
/**
 * 購入座席選択
 * @namespace Purchase.SeatModule
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const COA = require("@motionpicture/coa-service");
const debug = require("debug");
const fs = require("fs-extra");
const MP = require("../../../libs/MP");
const seatForm = require("../../forms/Purchase/SeatForm");
const PurchaseSession = require("../../models/Purchase/PurchaseModel");
const ErrorUtilModule = require("../Util/ErrorUtilModule");
const UtilModule = require("../Util/UtilModule");
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
function index(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.session === undefined)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (req.session.purchase === undefined)
                throw ErrorUtilModule.ERROR_EXPIRE;
            const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
            if (purchaseModel.isExpired())
                throw ErrorUtilModule.ERROR_EXPIRE;
            if (!purchaseModel.accessAuth(PurchaseSession.PurchaseModel.SEAT_STATE)) {
                throw ErrorUtilModule.ERROR_ACCESS;
            }
            if (req.params.id === undefined)
                throw ErrorUtilModule.ERROR_ACCESS;
            if (purchaseModel.transactionMP === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            purchaseModel.performance = yield MP.services.performance.getPerformance({
                accessToken: yield UtilModule.getAccessToken(req),
                performanceId: req.params.id
            });
            log('パフォーマンス取得');
            purchaseModel.theater = yield MP.services.theater.getTheater({
                accessToken: yield UtilModule.getAccessToken(req),
                theaterId: purchaseModel.performance.attributes.theater.id
            });
            log('劇場詳細取得');
            if (purchaseModel.theater === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            const website = purchaseModel.theater.attributes.websites.find((value) => {
                return (value.group === 'PORTAL');
            });
            const screen = yield MP.services.screen.getScreen({
                accessToken: yield UtilModule.getAccessToken(req),
                screenId: purchaseModel.performance.attributes.screen.id
            });
            log('スクリーン取得');
            const film = yield MP.services.film.getFilm({
                accessToken: yield UtilModule.getAccessToken(req),
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
        }
        catch (err) {
            const error = (err instanceof Error)
                ? new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message)
                : new ErrorUtilModule.CustomError(err, undefined);
            next(error);
        }
    });
}
exports.index = index;
/**
 * 座席決定
 * @memberof Purchase.SeatModule
 * @function select
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
function select(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.session === undefined)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (req.session.purchase === undefined)
                throw ErrorUtilModule.ERROR_EXPIRE;
            const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
            if (purchaseModel.isExpired())
                throw ErrorUtilModule.ERROR_EXPIRE;
            if (purchaseModel.transactionMP === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (req.params.id === undefined)
                throw ErrorUtilModule.ERROR_ACCESS;
            //取引id確認
            if (req.body.transactionId !== purchaseModel.transactionMP.id)
                throw ErrorUtilModule.ERROR_ACCESS;
            if (purchaseModel.theater === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            const website = purchaseModel.theater.attributes.websites.find((value) => {
                return (value.group === 'PORTAL');
            });
            //バリデーション
            seatForm.seatSelect(req);
            const validationResult = yield req.getValidationResult();
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
            const selectSeats = JSON.parse(req.body.seats).listTmpReserve;
            yield reserve(req, selectSeats, purchaseModel);
            //セッション更新
            req.session.purchase = purchaseModel.toSession();
            // ムビチケセッション削除
            delete req.session.mvtk;
            //券種選択へ
            res.redirect('/purchase/ticket');
            return;
        }
        catch (err) {
            const error = (err instanceof Error)
                ? new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message)
                : new ErrorUtilModule.CustomError(err, undefined);
            next(error);
            return;
        }
    });
}
exports.select = select;
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
function reserve(req, selectSeats, purchaseModel) {
    return __awaiter(this, void 0, void 0, function* () {
        if (purchaseModel.performance === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.transactionMP === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.performanceCOA === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        const performance = purchaseModel.performance;
        //予約中
        if (purchaseModel.reserveSeats !== null) {
            if (purchaseModel.authorizationCOA === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            const reserveSeats = purchaseModel.reserveSeats;
            //COA仮予約削除
            yield COA.services.reserve.delTmpReserve({
                theaterCode: performance.attributes.theater.id,
                dateJouei: performance.attributes.day,
                titleCode: purchaseModel.performanceCOA.titleCode,
                titleBranchNum: purchaseModel.performanceCOA.titleBranchNum,
                timeBegin: performance.attributes.timeStart,
                tmpReserveNum: reserveSeats.tmpReserveNum
            });
            log('COA仮予約削除');
            // COAオーソリ削除
            yield MP.services.transaction.removeAuthorization({
                accessToken: yield UtilModule.getAccessToken(req),
                transactionId: purchaseModel.transactionMP.id,
                authorizationId: purchaseModel.authorizationCOA.id
            });
            log('MPCOAオーソリ削除');
        }
        //COA仮予約
        purchaseModel.reserveSeats = yield COA.services.reserve.updTmpReserveSeat({
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
            purchaseModel.salesTicketsCOA = yield COA.services.reserve.salesTicket({
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
        const tmpReserveTickets = purchaseModel.reserveSeats.listTmpReserve.map((tmpReserve) => {
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
                kbnEisyahousiki: '00',
                mvtkNum: '',
                mvtkKbnDenshiken: '00',
                mvtkKbnMaeuriken: '00',
                mvtkKbnKensyu: '00',
                mvtkSalesPrice: 0 // ムビチケ販売単価
            };
        });
        let price = 0;
        for (const tmpReserveTicket of tmpReserveTickets) {
            price += tmpReserveTicket.salePrice;
        }
        //COAオーソリ追加
        const coaAuthorizationResult = yield MP.services.transaction.addCOAAuthorization({
            accessToken: yield UtilModule.getAccessToken(req),
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
    });
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
function getScreenStateReserve(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //バリデーション
            seatForm.screenStateReserve(req);
            const validationResult = yield req.getValidationResult();
            if (!validationResult.isEmpty())
                throw ErrorUtilModule.ERROR_VALIDATION;
            const theaterCode = `00${req.body.theaterCode}`.slice(UtilModule.DIGITS_02);
            const screenCode = `000${req.body.screenCode}`.slice(UtilModule.DIGITS_03);
            const screen = yield fs.readJSON(`./app/theaters/${theaterCode}/${screenCode}.json`);
            const setting = yield fs.readJSON('./app/theaters/setting.json');
            const state = yield COA.services.reserve.stateReserveSeat({
                theaterCode: req.body.theaterCode,
                dateJouei: req.body.dateJouei,
                titleCode: req.body.titleCode,
                titleBranchNum: req.body.titleBranchNum,
                timeBegin: req.body.timeBegin,
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
        }
        catch (err) {
            res.json({ err: err, result: null });
        }
    });
}
exports.getScreenStateReserve = getScreenStateReserve;
/**
 * 券種情報をセションへ保存
 * @memberof Purchase.SeatModule
 * @function getSalesTickets
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
function saveSalesTickets(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //バリデーション
            seatForm.salesTickets(req);
            const validationResult = yield req.getValidationResult();
            if (!validationResult.isEmpty())
                throw ErrorUtilModule.ERROR_VALIDATION;
            if (req.session === undefined)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (req.session.purchase === undefined)
                throw ErrorUtilModule.ERROR_EXPIRE;
            const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
            if (purchaseModel.salesTicketsCOA === null) {
                //コアAPI券種取得
                purchaseModel.salesTicketsCOA = yield COA.services.reserve.salesTicket({
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
            }
            else {
                res.json({ err: null });
            }
        }
        catch (err) {
            res.json({ err: err });
        }
    });
}
exports.saveSalesTickets = saveSalesTickets;
