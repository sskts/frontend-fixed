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
const MP = require("../../../libs/MP/sskts-api");
const LoginForm_1 = require("../../forms/Inquiry/LoginForm");
const InquiryModel_1 = require("../../models/Inquiry/InquiryModel");
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
            if (req.session === undefined)
                throw ErrorUtilModule.ERROR_PROPERTY;
            const movieTheaters = yield MP.service.organization.searchMovieTheaters({
                auth: yield UtilModule.createAuth(req.session.auth)
            });
            log('movieTheaters: ', movieTheaters);
            res.locals.movieTheaters = movieTheaters;
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
                const inquiryModel = new InquiryModel_1.InquiryModel();
                inquiryModel.movieTheaterOrganization = yield MP.service.organization.findMovieTheaterByBranchCode({
                    auth: yield UtilModule.createAuth(req.session.auth),
                    branchCode: req.body.theaterCode
                });
                log('劇場のショップを検索', inquiryModel.movieTheaterOrganization);
                if (inquiryModel.movieTheaterOrganization === null)
                    throw ErrorUtilModule.ERROR_PROPERTY;
                inquiryModel.login = {
                    reserveNum: req.body.reserveNum,
                    telephone: req.body.telephone
                };
                inquiryModel.order = yield MP.service.order.findByOrderInquiryKey({
                    auth: yield UtilModule.createAuth(req.session.auth),
                    orderInquiryKey: {
                        telephone: inquiryModel.login.telephone,
                        orderNumber: Number(inquiryModel.login.reserveNum),
                        theaterCode: inquiryModel.movieTheaterOrganization.location.branchCode
                    }
                });
                if (inquiryModel.order === null) {
                    // 本予約して照会情報取得
                    if (req.session.fixed === undefined)
                        throw ErrorUtilModule.ERROR_PROPERTY;
                    if (req.session.fixed.updateReserveIn === undefined)
                        throw ErrorUtilModule.ERROR_PROPERTY;
                    const updReserve = yield COA.services.reserve.updReserve(req.session.fixed.updateReserveIn);
                    log('COA本予約', updReserve);
                    inquiryModel.order = yield MP.service.order.findByOrderInquiryKey({
                        auth: yield UtilModule.createAuth(req.session.auth),
                        orderInquiryKey: {
                            telephone: inquiryModel.login.telephone,
                            orderNumber: Number(inquiryModel.login.reserveNum),
                            theaterCode: inquiryModel.movieTheaterOrganization.location.branchCode
                        }
                    });
                    log('COA照会情報取得', inquiryModel.order);
                    if (inquiryModel.order === null)
                        throw ErrorUtilModule.ERROR_PROPERTY;
                }
                // 印刷用
                const order = inquiryModel.order;
                const reservations = inquiryModel.order.acceptedOffers.map((offer) => {
                    if (offer.reservationFor.workPerformed === undefined)
                        throw ErrorUtilModule.ERROR_PROPERTY;
                    if (offer.reservationFor.location === undefined)
                        throw ErrorUtilModule.ERROR_PROPERTY;
                    if (offer.reservationFor.location.name === undefined)
                        throw ErrorUtilModule.ERROR_PROPERTY;
                    if (inquiryModel.movieTheaterOrganization === null)
                        throw ErrorUtilModule.ERROR_PROPERTY;
                    return {
                        reserveNo: order.orderInquiryKey.orderNumber,
                        filmNameJa: offer.reservationFor.workPerformed.name,
                        filmNameEn: '',
                        theaterName: inquiryModel.movieTheaterOrganization.location.name.ja,
                        screenName: offer.reservationFor.location.name.ja,
                        performanceDay: moment(offer.reservationFor.startDate).format('YYYY/MM/DD'),
                        performanceStartTime: inquiryModel.getScreeningTime(offer).start,
                        seatCode: offer.reservedTicket.coaTicketInfo.seatNum,
                        ticketName: (offer.reservedTicket.coaTicketInfo.addGlasses > 0)
                            ? `${offer.reservedTicket.coaTicketInfo.ticketCode}${req.__('common.glasses')}`
                            : offer.reservedTicket.coaTicketInfo.ticketCode,
                        ticketSalePrice: offer.reservedTicket.coaTicketInfo.salePrice,
                        qrStr: offer.reservedTicket.ticketToken
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
