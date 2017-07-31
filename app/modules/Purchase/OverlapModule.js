"use strict";
/**
 * 重複予約
 * @namespace Purchase.OverlapModule
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
const debug = require("debug");
const MP = require("../../../libs/MP/sskts-api");
const PurchaseModel_1 = require("../../models/Purchase/PurchaseModel");
const ErrorUtilModule = require("../Util/ErrorUtilModule");
const UtilModule = require("../Util/UtilModule");
const log = debug('SSKTS:Purchase.OverlapModule');
/**
 * 仮予約重複
 * @memberof Purchase.OverlapModule
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
            const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
            if (req.params.id === undefined)
                throw ErrorUtilModule.ERROR_ACCESS;
            if (purchaseModel.individualScreeningEvent === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            // イベント情報取得
            const individualScreeningEvent = yield MP.service.event.findIndividualScreeningEvent({
                auth: yield UtilModule.createAuth(req),
                identifier: req.body.performanceId
            });
            log('イベント情報取得', individualScreeningEvent);
            res.locals.individualScreeningEvent = {
                after: individualScreeningEvent,
                before: purchaseModel.individualScreeningEvent
            };
            res.render('purchase/overlap');
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
exports.index = index;
/**
 * 新規予約へ
 * @memberof Purchase.OverlapModule
 * @function newReserve
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
function newReserve(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.session === undefined)
                throw ErrorUtilModule.ERROR_PROPERTY;
            const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
            if (purchaseModel.individualScreeningEvent === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (purchaseModel.transaction === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (purchaseModel.seatReservationAuthorization === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            // COA仮予約削除
            yield MP.service.transaction.placeOrder.cancelSeatReservationAuthorization({
                auth: yield UtilModule.createAuth(req),
                transactionId: purchaseModel.transaction.id,
                authorizationId: purchaseModel.seatReservationAuthorization.id
            });
            log('COA仮予約削除');
            //購入スタートへ
            delete req.session.purchase;
            res.redirect(`/purchase?id=${req.body.performanceId}`);
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
exports.newReserve = newReserve;
/**
 * 前回の予約へ
 * @memberof Purchase.OverlapModule
 * @function prevReserve
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
function prevReserve(req, res, next) {
    if (req.session === undefined) {
        next(new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_PROPERTY, undefined));
        return;
    }
    //座席選択へ
    res.redirect(`/purchase/seat/${req.body.performanceId}/`);
    return;
}
exports.prevReserve = prevReserve;
