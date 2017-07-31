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
const MP = require("../../../libs/MP/sskts-api");
const seatForm = require("../../forms/Purchase/SeatForm");
const PurchaseModel_1 = require("../../models/Purchase/PurchaseModel");
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
            const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
            if (purchaseModel.isExpired())
                throw ErrorUtilModule.ERROR_EXPIRE;
            if (!purchaseModel.accessAuth(PurchaseModel_1.PurchaseModel.SEAT_STATE)) {
                throw ErrorUtilModule.ERROR_ACCESS;
            }
            if (req.params.id === undefined)
                throw ErrorUtilModule.ERROR_ACCESS;
            res.locals.reserveSeats = (purchaseModel.seatReservationAuthorization !== null)
                ? JSON.stringify(purchaseModel.seatReservationAuthorization) //仮予約中
                : null;
            res.locals.error = null;
            res.locals.purchaseModel = purchaseModel;
            res.locals.step = PurchaseModel_1.PurchaseModel.SEAT_STATE;
            //セッション更新
            purchaseModel.save(req.session);
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
            const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
            if (purchaseModel.isExpired())
                throw ErrorUtilModule.ERROR_EXPIRE;
            if (req.params.id === undefined)
                throw ErrorUtilModule.ERROR_ACCESS;
            //取引id確認
            if (req.body.transactionId !== purchaseModel.transaction.id)
                throw ErrorUtilModule.ERROR_ACCESS;
            //バリデーション
            seatForm.seatSelect(req);
            const validationResult = yield req.getValidationResult();
            if (!validationResult.isEmpty()) {
                res.locals.reserveSeats = req.body.seats;
                res.locals.error = validationResult.mapped();
                res.locals.purchaseModel = purchaseModel;
                res.locals.step = PurchaseModel_1.PurchaseModel.SEAT_STATE;
                res.render('purchase/seat', { layout: 'layouts/purchase/layout' });
                return;
            }
            const selectSeats = JSON.parse(req.body.seats).listTmpReserve;
            yield reserve(req, selectSeats, purchaseModel);
            //セッション更新
            purchaseModel.save(req.session);
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
        if (purchaseModel.individualScreeningEvent === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.transaction === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        //予約中
        if (purchaseModel.seatReservationAuthorization !== null) {
            yield MP.service.transaction.placeOrder.cancelSeatReservationAuthorization({
                auth: yield UtilModule.createAuth(req),
                transactionId: purchaseModel.transaction.id,
                authorizationId: purchaseModel.seatReservationAuthorization.id
            });
            log('仮予約削除');
        }
        if (purchaseModel.salesTickets === null) {
            //コアAPI券種取得
            const salesTicketResult = yield COA.services.reserve.salesTicket({
                theaterCode: purchaseModel.individualScreeningEvent.coaInfo.theaterCode,
                dateJouei: purchaseModel.individualScreeningEvent.coaInfo.dateJouei,
                titleCode: purchaseModel.individualScreeningEvent.coaInfo.titleCode,
                titleBranchNum: purchaseModel.individualScreeningEvent.coaInfo.titleBranchNum,
                timeBegin: purchaseModel.individualScreeningEvent.coaInfo.timeBegin
            });
            purchaseModel.salesTickets = salesTicketResult;
            log('コアAPI券種取得', purchaseModel.salesTickets);
        }
        purchaseModel.seatReservationAuthorization = yield MP.service.transaction.placeOrder.createSeatReservationAuthorization({
            auth: yield UtilModule.createAuth(req),
            transactionId: purchaseModel.transaction.id,
            eventIdentifier: purchaseModel.individualScreeningEvent.identifier,
            offers: selectSeats.map((seat) => {
                const salesTickets = purchaseModel.salesTickets[0];
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
            const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
            if (purchaseModel.salesTickets === null) {
                //コアAPI券種取得
                purchaseModel.salesTickets = yield COA.services.reserve.salesTicket({
                    theaterCode: req.body.theaterCode,
                    dateJouei: req.body.dateJouei,
                    titleCode: req.body.titleCode,
                    titleBranchNum: req.body.titleBranchNum,
                    timeBegin: req.body.timeBegin
                    // flgMember: coa.services.reserve.FlgMember.NonMember
                });
                log('コアAPI券種取得', purchaseModel.salesTickets);
                purchaseModel.save(req.session);
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
