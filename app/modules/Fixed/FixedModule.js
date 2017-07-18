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
 * 照会
 * @namespace Fixed.FixedModule
 */
const COA = require("@motionpicture/coa-service");
const debug = require("debug");
const moment = require("moment");
const MP = require("../../../libs/MP");
const LoginForm_1 = require("../../forms/Inquiry/LoginForm");
const ErrorUtilModule = require("../Util/ErrorUtilModule");
const UtilModule = require("../Util/UtilModule");
const log = debug('SSKTS:Fixed.FixedModule');
/**
 * 券売機TOPページ表示
 * @memberof FixedModule
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
function index(_, res) {
    return __awaiter(this, void 0, void 0, function* () {
        res.locals.ticketingSite = process.env.TICKETING_SITE_URL;
        res.render('index/index');
        log('券売機TOPページ表示');
    });
}
exports.index = index;
/**
 * 券売機設定ページ表示
 * @memberof FixedModule
 * @function setting
 * @param {Response} res
 * @returns {Promise<void>}
 */
function setting(_, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            res.locals.theaters = yield MP.getTheaters();
            res.render('setting/index');
        }
        catch (err) {
            next(new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message));
        }
    });
}
exports.setting = setting;
/**
 * 利用停止ページ表示
 * @memberof FixedModule
 * @function stop
 * @param {Response} res
 * @returns {void}
 */
function stop(_, res) {
    res.render('stop/index');
}
exports.stop = stop;
/**
 * 照会情報取得
 * @function getInquiryData
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
function getInquiryData(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.session === undefined)
                throw ErrorUtilModule.ERROR_PROPERTY;
            LoginForm_1.default(req);
            const validationResult = yield req.getValidationResult();
            if (validationResult.isEmpty()) {
                const transactionId = yield MP.makeInquiry({
                    inquiry_theater: req.body.theater_code,
                    inquiry_id: Number(req.body.reserve_num),
                    inquiry_pass: req.body.tel_num // 電話番号
                });
                if (transactionId === null)
                    throw ErrorUtilModule.ERROR_PROPERTY;
                log('MP取引Id取得', transactionId);
                let stateReserve = yield COA.services.reserve.stateReserve({
                    theater_code: req.body.theater_code,
                    reserve_num: req.body.reserve_num,
                    tel_num: req.body.tel_num // 電話番号
                });
                log('COA照会情報取得', stateReserve);
                if (stateReserve === null) {
                    // 本予約して照会情報取得
                    if (req.session.fixed === undefined)
                        throw ErrorUtilModule.ERROR_PROPERTY;
                    if (req.session.fixed.updateReserveIn === undefined)
                        throw ErrorUtilModule.ERROR_PROPERTY;
                    const updReserve = yield COA.services.reserve.updReserve(req.session.fixed.updateReserveIn);
                    log('COA本予約', updReserve);
                    stateReserve = yield COA.services.reserve.stateReserve({
                        theater_code: req.body.theater_code,
                        reserve_num: req.body.reserve_num,
                        tel_num: req.body.tel_num // 電話番号
                    });
                    log('COA照会情報取得', stateReserve);
                    if (stateReserve === null)
                        throw ErrorUtilModule.ERROR_PROPERTY;
                }
                const performanceId = UtilModule.getPerformanceId({
                    theaterCode: req.body.theater_code,
                    day: stateReserve.date_jouei,
                    titleCode: stateReserve.title_code,
                    titleBranchNum: stateReserve.title_branch_num,
                    screenCode: stateReserve.screen_code,
                    timeBegin: stateReserve.time_begin
                });
                log('パフォーマンスID取得', performanceId);
                const performance = yield MP.getPerformance(performanceId);
                if (performance === null)
                    throw ErrorUtilModule.ERROR_PROPERTY;
                log('MPパフォーマンス取得');
                // 印刷用
                const reservations = stateReserve.list_ticket.map((ticket) => {
                    return {
                        reserve_no: req.body.reserve_num,
                        film_name_ja: performance.attributes.film.name.ja,
                        film_name_en: performance.attributes.film.name.en,
                        theater_name: performance.attributes.theater.name.ja,
                        screen_name: performance.attributes.screen.name.ja,
                        performance_day: moment(performance.attributes.day).format('YYYY/MM/DD'),
                        performance_start_time: `${UtilModule.timeFormat(performance.attributes.time_start)}`,
                        seat_code: ticket.seat_num,
                        ticket_name: (ticket.add_glasses > 0)
                            ? `${ticket.ticket_name}${req.__('common.glasses')}`
                            : ticket.ticket_name,
                        ticket_sale_price: ticket.ticket_price,
                        qr_str: ticket.seat_qrcode
                    };
                });
                delete req.session.fixed;
                res.json({ result: reservations });
                return;
            }
            res.json({ result: null });
        }
        catch (err) {
            res.json({ result: null });
        }
    });
}
exports.getInquiryData = getInquiryData;
