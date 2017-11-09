"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * パフォーマンス一覧
 * @namespace Purchase.PerformancesModule
 */
const sasaki = require("@motionpicture/sskts-api-nodejs-client");
const debug = require("debug");
const HTTPStatus = require("http-status");
const moment = require("moment");
const AuthModel_1 = require("../../models/Auth/AuthModel");
const PurchaseModel_1 = require("../../models/Purchase/PurchaseModel");
const ErrorUtilModule_1 = require("../Util/ErrorUtilModule");
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
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            const authModel = new AuthModel_1.AuthModel(req.session.auth);
            const options = {
                endpoint: process.env.SSKTS_API_ENDPOINT,
                auth: authModel.create()
            };
            const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
            if (purchaseModel.seatReservationAuthorization !== null
                && purchaseModel.transaction !== null
                && !purchaseModel.isExpired()) {
                yield sasaki.service.transaction.placeOrder(options)
                    .cancelSeatReservationAuthorization({
                    transactionId: purchaseModel.transaction.id,
                    actionId: purchaseModel.seatReservationAuthorization.id
                });
                log('仮予約削除');
            }
            if (process.env.VIEW_TYPE === 'fixed') {
                // セッション削除
                delete req.session.purchase;
                delete req.session.mvtk;
                delete req.session.complete;
                delete req.session.auth;
            }
            if (process.env.VIEW_TYPE === undefined) {
                res.locals.movieTheaters = yield sasaki.service.organization(options).searchMovieTheaters();
                log(res.locals.movieTheaters);
            }
            res.locals.step = PurchaseModel_1.PurchaseModel.PERFORMANCE_STATE;
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
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            const authModel = new AuthModel_1.AuthModel(req.session.auth);
            const options = {
                endpoint: process.env.SSKTS_API_ENDPOINT,
                auth: authModel.create()
            };
            const individualScreeningEvents = yield sasaki.service.event(options).searchIndividualScreeningEvent({
                theater: req.query.theater,
                day: moment(req.query.day).format('YYYYMMDD')
            });
            log('上映イベント検索');
            if (req.query.callback === undefined) {
                res.json({ error: null, result: individualScreeningEvents });
            }
            else {
                res.jsonp({ error: null, result: individualScreeningEvents });
            }
        }
        catch (err) {
            if (req.query.callback === undefined) {
                res.json({ error: err, result: null });
            }
            else {
                res.jsonp({ error: err, result: null });
            }
        }
    });
}
exports.getPerformances = getPerformances;
/**
 * スケジュールリスト取得
 * @memberof Purchase.PerformancesModule
 * @function getSchedule
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
function getSchedule(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.session === undefined
                || req.query.beginDate === undefined
                || req.query.endDate === undefined)
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            const authModel = new AuthModel_1.AuthModel(req.session.auth);
            const options = {
                endpoint: process.env.SSKTS_API_ENDPOINT,
                auth: authModel.create()
            };
            const diff = moment(req.query.endDate).diff(moment(req.query.beginDate), 'days');
            const limitDays = 100;
            if (diff > limitDays) {
                throw new Error('It exceeds the upper limit');
            }
            const schedule = [];
            const movieTheaters = yield sasaki.service.organization(options).searchMovieTheaters();
            for (const theater of movieTheaters) {
                schedule.push({
                    theater: theater,
                    schedule: []
                });
                const theaterCode = theater.location.branchCode;
                for (let i = 0; i < diff; i += 1) {
                    const date = moment(req.query.beginDate).add(i, 'days').format('YYYYMMDD');
                    const individualScreeningEvents = yield sasaki.service.event(options).searchIndividualScreeningEvent({
                        theater: theaterCode,
                        day: date
                    });
                    const theaterSchedule = schedule.find((targetSchedule) => {
                        return (targetSchedule.theater.branchCode === theater.branchCode);
                    });
                    if (theaterSchedule !== undefined) {
                        theaterSchedule.schedule.push({
                            date: date,
                            individualScreeningEvents: individualScreeningEvents
                        });
                    }
                }
            }
            if (req.query.callback === undefined) {
                res.json({ error: null, result: schedule });
            }
            else {
                res.jsonp({ error: null, result: schedule });
            }
        }
        catch (err) {
            if (req.query.callback === undefined) {
                res.json({ error: err, result: null });
            }
            else {
                res.jsonp({ error: err, result: null });
            }
        }
    });
}
exports.getSchedule = getSchedule;
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
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            const authModel = new AuthModel_1.AuthModel(req.session.auth);
            const options = {
                endpoint: process.env.SSKTS_API_ENDPOINT,
                auth: authModel.create()
            };
            const movieTheaters = yield sasaki.service.organization(options).searchMovieTheaters();
            log('劇場検索');
            if (req.query.callback === undefined) {
                res.json({ error: null, result: movieTheaters });
            }
            else {
                res.jsonp({ error: null, result: movieTheaters });
            }
        }
        catch (err) {
            if (req.query.callback === undefined) {
                res.json({ error: err, result: null });
            }
            else {
                res.jsonp({ error: err, result: null });
            }
        }
    });
}
exports.getMovieTheaters = getMovieTheaters;
