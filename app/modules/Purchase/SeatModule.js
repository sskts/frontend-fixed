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
const sasaki = require("@motionpicture/sskts-api-nodejs-client");
const debug = require("debug");
const fs = require("fs-extra");
const HTTPStatus = require("http-status");
const seatForm = require("../../forms/Purchase/SeatForm");
const AuthModel_1 = require("../../models/Auth/AuthModel");
const PurchaseModel_1 = require("../../models/Purchase/PurchaseModel");
const ErrorUtilModule_1 = require("../Util/ErrorUtilModule");
const UtilModule = require("../Util/UtilModule");
const log = debug('SSKTS:Purchase.SeatModule');
/**
 * 座席選択
 * @memberof Purchase.SeatModule
 * @function render
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
function render(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.session === undefined)
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
            if (purchaseModel.isExpired())
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Expire);
            if (!purchaseModel.accessAuth(PurchaseModel_1.PurchaseModel.SEAT_STATE)) {
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Access);
            }
            res.locals.reserveSeats = (purchaseModel.seatReservationAuthorization !== null)
                ? JSON.stringify(purchaseModel.seatReservationAuthorization) //仮予約中
                : null;
            res.locals.error = null;
            res.locals.reserveError = null;
            res.locals.purchaseModel = purchaseModel;
            res.locals.step = PurchaseModel_1.PurchaseModel.SEAT_STATE;
            res.render('purchase/seat', { layout: 'layouts/purchase/layout' });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.render = render;
/**
 * パフォーマンス変更
 * @memberof Purchase.SeatModule
 * @function performanceChange
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
function performanceChange(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.session === undefined)
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            const authModel = new AuthModel_1.AuthModel(req.session.auth);
            const options = {
                endpoint: process.env.SSKTS_API_ENDPOINT,
                auth: authModel.create()
            };
            const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
            if (purchaseModel.isExpired())
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Expire);
            // イベント情報取得
            purchaseModel.individualScreeningEvent = yield sasaki.service.event(options).findIndividualScreeningEvent({
                identifier: req.query.performanceId
            });
            purchaseModel.save(req.session);
            res.json({
                err: null,
                result: {
                    individualScreeningEvent: purchaseModel.individualScreeningEvent
                }
            });
        }
        catch (err) {
            res.json({
                err: err.message,
                result: null
            });
        }
    });
}
exports.performanceChange = performanceChange;
/**
 * 座席決定
 * @memberof Purchase.SeatModule
 * @function seatSelect
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
// tslint:disable-next-line:max-func-body-length
function seatSelect(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.session === undefined)
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
            if (purchaseModel.transaction === null
                || purchaseModel.individualScreeningEvent === null)
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            if (purchaseModel.isExpired())
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Expire);
            //取引id確認
            if (req.body.transactionId !== purchaseModel.transaction.id)
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            const authModel = new AuthModel_1.AuthModel(req.session.auth);
            const options = {
                endpoint: process.env.SSKTS_API_ENDPOINT,
                auth: authModel.create()
            };
            //バリデーション
            seatForm.seatSelect(req);
            const validationResult = yield req.getValidationResult();
            if (!validationResult.isEmpty()) {
                res.locals.reserveSeats = req.body.seats;
                res.locals.error = validationResult.mapped();
                res.locals.reserveError = null;
                res.locals.purchaseModel = purchaseModel;
                res.locals.step = PurchaseModel_1.PurchaseModel.SEAT_STATE;
                res.render('purchase/seat', { layout: 'layouts/purchase/layout' });
                return;
            }
            const selectSeats = JSON.parse(req.body.seats).listTmpReserve;
            //予約中
            if (purchaseModel.seatReservationAuthorization !== null) {
                const cancelSeatReservationAuthorizationIn = {
                    transactionId: purchaseModel.transaction.id,
                    actionId: purchaseModel.seatReservationAuthorization.id
                };
                purchaseModel.seatReservationAuthorization = null;
                purchaseModel.save(req.session);
                yield sasaki.service.transaction.placeOrder(options)
                    .cancelSeatReservationAuthorization(cancelSeatReservationAuthorizationIn);
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
                log('コアAPI券種取得');
            }
            if (purchaseModel.salesTickets.length === 0)
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            const createSeatReservationAuthorizationArgs = {
                transactionId: purchaseModel.transaction.id,
                eventIdentifier: purchaseModel.individualScreeningEvent.identifier,
                offers: selectSeats.map((seat) => {
                    const salesTicket = purchaseModel.salesTickets[0];
                    return {
                        seatSection: seat.seatSection,
                        seatNumber: seat.seatNum,
                        ticketInfo: {
                            ticketCode: salesTicket.ticketCode,
                            mvtkAppPrice: 0,
                            ticketCount: 1,
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
            };
            purchaseModel.seatReservationAuthorization = yield sasaki.service.transaction.placeOrder(options)
                .createSeatReservationAuthorization(createSeatReservationAuthorizationArgs);
            log('SSKTSオーソリ追加');
            purchaseModel.orderCount = 0;
            log('GMOオーソリカウント初期化');
            purchaseModel.reserveTickets = [];
            log('選択チケット初期化');
            //セッション更新
            purchaseModel.save(req.session);
            // ムビチケセッション削除
            delete req.session.mvtk;
            //券種選択へ
            res.redirect('/purchase/ticket');
            return;
        }
        catch (err) {
            if (err.hasOwnProperty('errors')
                && (Number(err.code) === HTTPStatus.CONFLICT || Number(err.code) === HTTPStatus.SERVICE_UNAVAILABLE)) {
                const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
                res.locals.reserveSeats = null;
                res.locals.error = null;
                res.locals.reserveError = err.code;
                res.locals.purchaseModel = purchaseModel;
                res.locals.step = PurchaseModel_1.PurchaseModel.SEAT_STATE;
                res.render('purchase/seat', { layout: 'layouts/purchase/layout' });
                return;
            }
            next(err);
        }
    });
}
exports.seatSelect = seatSelect;
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
                throw ErrorUtilModule_1.ErrorType.Validation;
            const theaterCode = `00${req.body.theaterCode}`.slice(UtilModule.DIGITS['02']);
            const screenCode = `000${req.body.screenCode}`.slice(UtilModule.DIGITS['03']);
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
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Validation);
            if (req.session === undefined)
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
            //コアAPI券種取得
            purchaseModel.salesTickets = yield COA.services.reserve.salesTicket({
                theaterCode: req.body.theaterCode,
                dateJouei: req.body.dateJouei,
                titleCode: req.body.titleCode,
                titleBranchNum: req.body.titleBranchNum,
                timeBegin: req.body.timeBegin
                // flgMember: coa.services.reserve.FlgMember.NonMember
            });
            log('コアAPI券種取得');
            purchaseModel.save(req.session);
            res.json({ err: null });
        }
        catch (err) {
            res.json({ err: err.message });
        }
    });
}
exports.saveSalesTickets = saveSalesTickets;
