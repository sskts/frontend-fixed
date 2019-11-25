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
 * パフォーマンス一覧
 * @namespace Purchase.PerformancesModule
 */
const cinerinoService = require("@cinerino/api-nodejs-client");
const debug = require("debug");
const HTTPStatus = require("http-status");
const moment = require("moment");
const functions_1 = require("../../functions");
const models_1 = require("../../models");
const log = debug('SSKTS:Purchase.PerformancesModule');
/**
 * パフォーマンス一覧表示
 * @memberof Purchase.PerformancesModule
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
            if (purchaseModel.seatReservationAuthorization !== undefined
                && purchaseModel.transaction !== undefined
                && !purchaseModel.isExpired()) {
                try {
                    yield new cinerinoService.service.transaction.PlaceOrder4sskts(options).cancelSeatReservationAuthorization({
                        id: purchaseModel.seatReservationAuthorization.id,
                        purpose: {
                            id: purchaseModel.transaction.id,
                            typeOf: purchaseModel.transaction.typeOf
                        }
                    });
                    log('仮予約削除');
                }
                catch (err) {
                    log('仮予約削除失敗', err);
                }
            }
            // セッション削除
            delete req.session.purchase;
            delete req.session.mvtk;
            delete req.session.complete;
            delete req.session.auth;
            // if (process.env.VIEW_TYPE === undefined) {
            //     const searchResult = await new cinerinoService.service.Seller(options).search({});
            //     res.locals.sellers = searchResult.data;
            //     log('劇場検索');
            // }
            res.locals.step = models_1.PurchaseModel.PERFORMANCE_STATE;
            res.locals.entranceServerUrl = process.env.ENTRANCE_SERVER_URL;
            res.render('purchase/performances', { layout: 'layouts/purchase/layout' });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.render = render;
/**
 * パフォーマンスリスト取得
 * @memberof Purchase.PerformancesModule
 * @function getPerformances
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
function getPerformances(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.session === undefined
                || req.query.theater === undefined
                || req.query.day === undefined)
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
            const options = functions_1.getApiOption(req);
            const limit = 100;
            let page = 1;
            let roop = true;
            let screeningEvents = [];
            while (roop) {
                const screeningEventsResult = yield new cinerinoService.service.Event(options).search({
                    page,
                    limit,
                    typeOf: cinerinoService.factory.chevre.eventType.ScreeningEvent,
                    superEvent: {
                        locationBranchCodes: [req.query.theater]
                    },
                    startFrom: moment(req.query.day).toDate(),
                    startThrough: moment(req.query.day).add(1, 'day').toDate()
                });
                screeningEvents = screeningEvents.concat(screeningEventsResult.data);
                const lastPage = Math.ceil(screeningEventsResult.totalCount / limit);
                page += 1;
                roop = !(page > lastPage);
            }
            log('上映イベント検索');
            res.json({ result: screeningEvents });
        }
        catch (err) {
            if (err.code !== undefined) {
                res.status(err.code);
            }
            else {
                res.status(httpStatus.BAD_REQUEST);
            }
            res.json({ error: err });
        }
    });
}
exports.getPerformances = getPerformances;
/**
 * 劇場一覧検索
 * @memberof Purchase.PerformancesModule
 * @function getMovieTheaters
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
function getMovieTheaters(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.session === undefined)
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
            const options = functions_1.getApiOption(req);
            const searchResult = yield new cinerinoService.service.Seller(options).search({});
            const sellers = searchResult.data;
            log('劇場検索');
            res.json({ result: sellers });
        }
        catch (err) {
            if (err.code !== undefined) {
                res.status(err.code);
            }
            else {
                res.status(httpStatus.BAD_REQUEST);
            }
            res.json({ error: err });
        }
    });
}
exports.getMovieTheaters = getMovieTheaters;
