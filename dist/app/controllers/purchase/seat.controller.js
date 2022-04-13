"use strict";
/**
 * 購入座席選択
 * @namespace Purchase.SeatModule
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const cinerinoService = require("@cinerino/sdk");
const COA = require("@motionpicture/coa-service");
const debug = require("debug");
const fs = require("fs-extra");
const HTTPStatus = require("http-status");
const functions_1 = require("../../functions");
const forms_1 = require("../../functions/forms");
const models_1 = require("../../models");
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
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
            const purchaseModel = new models_1.PurchaseModel(req.session.purchase);
            if (purchaseModel.isExpired())
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Expire);
            if (!purchaseModel.accessAuth(models_1.PurchaseModel.SEAT_STATE)) {
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Access);
            }
            res.locals.reserveSeats = JSON.stringify(purchaseModel.reserveSeats);
            res.locals.error = undefined;
            res.locals.reserveError = undefined;
            res.locals.purchaseModel = purchaseModel;
            res.locals.step = models_1.PurchaseModel.SEAT_STATE;
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
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
            const options = functions_1.getApiOption(req);
            const purchaseModel = new models_1.PurchaseModel(req.session.purchase);
            if (purchaseModel.isExpired())
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Expire);
            // イベント情報取得
            purchaseModel.screeningEvent = yield new cinerinoService.service.Event(options).findById({
                id: req.query.performanceId
            });
            purchaseModel.save(req.session);
            res.json({
                err: undefined,
                result: {
                    screeningEvent: purchaseModel.screeningEvent
                }
            });
        }
        catch (err) {
            res.json({
                err: err.message,
                result: undefined
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
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
            const purchaseModel = new models_1.PurchaseModel(req.session.purchase);
            const { seller, screeningEvent, transaction } = purchaseModel;
            if (transaction === undefined
                || screeningEvent === undefined
                || screeningEvent.coaInfo === undefined
                || seller === undefined) {
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
            }
            if (purchaseModel.isExpired())
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Expire);
            //取引id確認
            if (req.body.transactionId !== transaction.id)
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
            const options = functions_1.getApiOption(req);
            //バリデーション
            forms_1.purchaseSeatSelectForm(req);
            const validationResult = yield req.getValidationResult();
            if (!validationResult.isEmpty()) {
                res.locals.reserveSeats = req.body.seats;
                res.locals.error = validationResult.mapped();
                res.locals.reserveError = undefined;
                res.locals.purchaseModel = purchaseModel;
                res.locals.step = models_1.PurchaseModel.SEAT_STATE;
                res.render('purchase/seat', { layout: 'layouts/purchase/layout' });
                return;
            }
            const selectSeats = JSON.parse(req.body.seats).listTmpReserve;
            //予約中
            if (purchaseModel.seatReservationAuthorization !== undefined) {
                yield new cinerinoService.service.transaction.PlaceOrder4sskts(options)
                    .cancelSeatReservationAuthorization({
                    id: purchaseModel.seatReservationAuthorization.id,
                    purpose: {
                        id: transaction.id,
                        typeOf: transaction.typeOf
                    }
                });
                purchaseModel.seatReservationAuthorization = undefined;
                purchaseModel.save(req.session);
                log('仮予約削除');
            }
            if (purchaseModel.salesTickets === undefined) {
                //コアAPI券種取得
                const salesTicketResult = yield COA.services.reserve.salesTicket({
                    theaterCode: screeningEvent.coaInfo.theaterCode,
                    dateJouei: screeningEvent.coaInfo.dateJouei,
                    titleCode: screeningEvent.coaInfo.titleCode,
                    titleBranchNum: screeningEvent.coaInfo.titleBranchNum,
                    timeBegin: screeningEvent.coaInfo.timeBegin
                });
                purchaseModel.salesTickets = salesTicketResult;
                log('コアAPI券種取得');
            }
            if (purchaseModel.salesTickets.length === 0)
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
            purchaseModel.seatReservationAuthorization = yield new cinerinoService.service.transaction.PlaceOrder4sskts(options)
                .createSeatReservationAuthorization({
                object: {
                    event: {
                        id: screeningEvent.id
                    },
                    acceptedOffer: selectSeats.map((seat) => {
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
                },
                purpose: {
                    id: transaction.id,
                    typeOf: transaction.typeOf
                }
            });
            purchaseModel.reserveSeats = selectSeats.map((seat) => {
                return {
                    seatSection: seat.seatSection,
                    seatNumber: seat.seatNum
                };
            });
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
            // tslint:disable-next-line:no-console
            console.error(err);
            if (err.hasOwnProperty('errors')
                && (Number(err.code) === HTTPStatus.CONFLICT || Number(err.code) === HTTPStatus.SERVICE_UNAVAILABLE)) {
                const purchaseModel = new models_1.PurchaseModel(req.session.purchase);
                res.locals.reserveSeats = undefined;
                res.locals.error = undefined;
                res.locals.reserveError = err.code;
                res.locals.purchaseModel = purchaseModel;
                res.locals.step = models_1.PurchaseModel.SEAT_STATE;
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
            // バリデーション
            forms_1.purchaseScreenStateReserveForm(req);
            const validationResult = yield req.getValidationResult();
            if (!validationResult.isEmpty())
                throw models_1.ErrorType.Validation;
            const theaterCode = `00${req.body.theaterCode}`.slice(functions_1.Digits['02']);
            const screenCode = `000${req.body.screenCode}`.slice(functions_1.Digits['03']);
            const screen = yield fs.readJSON(`${__dirname}/../../../../public/json/theaters/${theaterCode}/${screenCode}.json`);
            const setting = yield fs.readJSON(`${__dirname}/../../../../public/json/theaters/setting.json`);
            const state = yield COA.services.reserve.stateReserveSeat({
                theaterCode: req.body.theaterCode,
                dateJouei: req.body.dateJouei,
                titleCode: req.body.titleCode,
                titleBranchNum: req.body.titleBranchNum,
                timeBegin: req.body.timeBegin,
                screenCode: req.body.screenCode // スクリーンコード
            });
            res.json({
                err: undefined,
                result: {
                    screen: screen,
                    setting: setting,
                    state: state
                }
            });
        }
        catch (err) {
            res.json({ err: err, result: undefined });
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
            forms_1.purchaseSalesTicketsForm(req);
            const validationResult = yield req.getValidationResult();
            if (!validationResult.isEmpty())
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Validation);
            if (req.session === undefined)
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
            const purchaseModel = new models_1.PurchaseModel(req.session.purchase);
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
            res.json({ err: undefined });
        }
        catch (err) {
            res.json({ err: err.message });
        }
    });
}
exports.saveSalesTickets = saveSalesTickets;
