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
 * @memberof Fixed.FixedModule
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
 * @memberof Fixed.FixedModule
 * @function setting
 * @param {Response} res
 * @returns {Promise<void>}
 */
function setting(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            res.locals.theaters = yield MP.services.theater.getTheaters({
                accessToken: yield UtilModule.getAccessToken(req)
            });
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
 * @memberof Fixed.FixedModule
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
 * @memberof Fixed.FixedModule
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
                const transactionId = yield MP.services.transaction.makeInquiry({
                    accessToken: yield UtilModule.getAccessToken(req),
                    inquiryTheater: req.body.theaterCode,
                    inquiryId: Number(req.body.reserveNum),
                    inquiryPass: req.body.telNum // 電話番号
                });
                // const transactionId = await MP.services.transaction.findByInquiryKey({
                //     theaterCode: req.body.theaterCode, // 施設コード
                //     reserveNum: Number(req.body.reserveNum), // 座席チケット購入番号
                //     tel: req.body.telNum // 電話番号
                // });
                if (transactionId === null)
                    throw ErrorUtilModule.ERROR_PROPERTY;
                log('MP取引Id取得', transactionId);
                let stateReserve = yield COA.services.reserve.stateReserve({
                    theaterCode: req.body.theaterCode,
                    reserveNum: req.body.reserveNum,
                    telNum: req.body.telNum // 電話番号
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
                        theaterCode: req.body.theaterCode,
                        reserveNum: req.body.reserveNum,
                        telNum: req.body.telNum // 電話番号
                    });
                    log('COA照会情報取得', stateReserve);
                    if (stateReserve === null)
                        throw ErrorUtilModule.ERROR_PROPERTY;
                }
                const performanceId = UtilModule.getPerformanceId({
                    theaterCode: req.body.theaterCode,
                    day: stateReserve.dateJouei,
                    titleCode: stateReserve.titleCode,
                    titleBranchNum: stateReserve.titleBranchNum,
                    screenCode: stateReserve.screenCode,
                    timeBegin: stateReserve.timeBegin
                });
                log('パフォーマンスID取得', performanceId);
                const performance = yield MP.services.performance.getPerformance({
                    accessToken: yield UtilModule.getAccessToken(req),
                    performanceId: performanceId
                });
                if (performance === null)
                    throw ErrorUtilModule.ERROR_PROPERTY;
                log('MPパフォーマンス取得');
                // 印刷用
                const reservations = stateReserve.listTicket.map((ticket) => {
                    return {
                        reserveNo: req.body.reserveNum,
                        filmNameJa: performance.attributes.film.name.ja,
                        filmNameEn: performance.attributes.film.name.en,
                        theaterName: performance.attributes.theater.name.ja,
                        screenName: performance.attributes.screen.name.ja,
                        performanceDay: moment(performance.attributes.day).format('YYYY/MM/DD'),
                        performanceStartTime: `${UtilModule.timeFormat(performance.attributes.timeStart)}`,
                        seatCode: ticket.seatNum,
                        ticketName: (ticket.addGlasses > 0)
                            ? `${ticket.ticketName}${req.__('common.glasses')}`
                            : ticket.ticketName,
                        ticketSalePrice: ticket.ticketPrice,
                        qrStr: ticket.seatQrcode
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
