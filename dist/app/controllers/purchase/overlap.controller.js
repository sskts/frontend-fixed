"use strict";
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
/**
 * 重複予約
 * @namespace Purchase.OverlapModule
 */
const sasaki = require("@motionpicture/sskts-api-nodejs-client");
const debug = require("debug");
const HTTPStatus = require("http-status");
const functions_1 = require("../../functions");
const models_1 = require("../../models");
const log = debug('SSKTS:Purchase.OverlapModule');
/**
 * 仮予約重複
 * @memberof Purchase.OverlapModule
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
            const options = functions_1.getApiOption(req);
            const purchaseModel = new models_1.PurchaseModel(req.session.purchase);
            if (req.params.id === undefined)
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
            if (purchaseModel.screeningEvent === null)
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
            // イベント情報取得
            const screeningEvent = yield new sasaki.service.Event(options).findScreeningEventById({
                id: req.params.id
            });
            log('イベント情報取得', screeningEvent);
            res.locals.after = screeningEvent;
            res.locals.before = purchaseModel.screeningEvent;
            res.render('purchase/overlap');
        }
        catch (err) {
            next(err);
        }
    });
}
exports.render = render;
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
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
            const options = functions_1.getApiOption(req);
            const purchaseModel = new models_1.PurchaseModel(req.session.purchase);
            if (purchaseModel.transaction !== null
                && purchaseModel.seatReservationAuthorization !== null
                && !purchaseModel.isExpired()) {
                try {
                    // COA仮予約削除
                    yield new sasaki.service.transaction.PlaceOrder(options).cancelSeatReservationAuthorization({
                        id: purchaseModel.seatReservationAuthorization.id,
                        purpose: {
                            id: purchaseModel.transaction.id,
                            typeOf: purchaseModel.transaction.typeOf
                        }
                    });
                    log('COA仮予約削除');
                }
                catch (err) {
                    log('COA仮予約削除失敗', err);
                }
            }
            //購入スタートへ
            delete req.session.purchase;
            let url;
            let params;
            params = `id=${req.body.performanceId}`;
            url = `${process.env.ENTRANCE_SERVER_URL}/purchase/index.html?${params}`;
            res.redirect(url);
        }
        catch (err) {
            next(err);
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
        next(new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property));
        return;
    }
    //座席選択へ
    res.redirect(`/purchase/seat/${req.body.performanceId}/`);
    return;
}
exports.prevReserve = prevReserve;
