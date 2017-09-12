"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * 照会
 * @namespace Fixed.FixedModule
 */
const COA = require("@motionpicture/coa-service");
const sasaki = require("@motionpicture/sasaki-api-nodejs");
const debug = require("debug");
const moment = require("moment");
const LoginForm_1 = require("../../forms/Inquiry/LoginForm");
const AuthModel_1 = require("../../models/Auth/AuthModel");
const InquiryModel_1 = require("../../models/Inquiry/InquiryModel");
const ErrorUtilModule = require("../Util/ErrorUtilModule");
const UtilModule = require("../Util/UtilModule");
const log = debug('SSKTS:Fixed.FixedModule');
/**
 * 券売機TOPページ表示
 * @memberof Fixed.FixedModule
 * @function render
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
function render(_, res) {
    return __awaiter(this, void 0, void 0, function* () {
        res.locals.ticketingSite = process.env.TICKETING_SITE_URL;
        res.render('index/index');
        log('券売機TOPページ表示');
    });
}
exports.render = render;
/**
 * 券売機設定ページ表示
 * @memberof Fixed.FixedModule
 * @function settingRender
 * @param {Response} res
 * @returns {Promise<void>}
 */
function settingRender(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.session === undefined)
                throw ErrorUtilModule.ErrorType.Property;
            const authModel = new AuthModel_1.AuthModel();
            const options = {
                endpoint: process.env.SSKTS_API_ENDPOINT,
                auth: authModel.create()
            };
            const movieTheaters = yield sasaki.service.organization(options).searchMovieTheaters();
            log('movieTheaters: ', movieTheaters);
            res.locals.movieTheaters = movieTheaters;
            res.render('setting/index');
        }
        catch (err) {
            next(new ErrorUtilModule.CustomError(ErrorUtilModule.ErrorType.ExternalModule, err.message));
        }
    });
}
exports.settingRender = settingRender;
/**
 * 利用停止ページ表示
 * @memberof Fixed.FixedModule
 * @function stopRender
 * @param {Response} res
 * @returns {void}
 */
function stopRender(_, res) {
    res.render('stop/index');
}
exports.stopRender = stopRender;
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
                throw ErrorUtilModule.ErrorType.Property;
            const authModel = new AuthModel_1.AuthModel(req.session.auth);
            const options = {
                endpoint: process.env.SSKTS_API_ENDPOINT,
                auth: authModel.create()
            };
            LoginForm_1.default(req);
            const validationResult = yield req.getValidationResult();
            if (validationResult.isEmpty()) {
                const inquiryModel = new InquiryModel_1.InquiryModel();
                inquiryModel.movieTheaterOrganization = yield sasaki.service.organization(options).findMovieTheaterByBranchCode({
                    branchCode: req.body.theaterCode
                });
                log('劇場のショップを検索', inquiryModel.movieTheaterOrganization);
                if (inquiryModel.movieTheaterOrganization === null)
                    throw ErrorUtilModule.ErrorType.Property;
                inquiryModel.login = {
                    reserveNum: req.body.reserveNum,
                    telephone: req.body.telephone
                };
                inquiryModel.order = yield sasaki.service.order(options).findByOrderInquiryKey({
                    telephone: inquiryModel.login.telephone,
                    confirmationNumber: Number(inquiryModel.login.reserveNum),
                    theaterCode: inquiryModel.movieTheaterOrganization.location.branchCode
                });
                if (inquiryModel.order === null) {
                    // 本予約して照会情報取得
                    if (req.session.fixed === undefined)
                        throw ErrorUtilModule.ErrorType.Property;
                    if (req.session.fixed.updateReserveIn === undefined)
                        throw ErrorUtilModule.ErrorType.Property;
                    const updReserve = yield COA.services.reserve.updReserve(req.session.fixed.updateReserveIn);
                    log('COA本予約', updReserve);
                    inquiryModel.order = yield sasaki.service.order(options).findByOrderInquiryKey({
                        telephone: inquiryModel.login.telephone,
                        confirmationNumber: Number(inquiryModel.login.reserveNum),
                        theaterCode: inquiryModel.movieTheaterOrganization.location.branchCode
                    });
                    log('COA照会情報取得', inquiryModel.order);
                    if (inquiryModel.order === null)
                        throw ErrorUtilModule.ErrorType.Property;
                }
                // 印刷用
                const order = inquiryModel.order;
                const reservations = inquiryModel.order.acceptedOffers.map((offer) => {
                    if (offer.itemOffered.reservationFor.workPerformed === undefined)
                        throw ErrorUtilModule.ErrorType.Property;
                    if (offer.itemOffered.reservationFor.location === undefined)
                        throw ErrorUtilModule.ErrorType.Property;
                    if (offer.itemOffered.reservationFor.location.name === undefined)
                        throw ErrorUtilModule.ErrorType.Property;
                    if (inquiryModel.movieTheaterOrganization === null)
                        throw ErrorUtilModule.ErrorType.Property;
                    return {
                        reserveNo: order.orderInquiryKey.confirmationNumber,
                        filmNameJa: offer.itemOffered.reservationFor.workPerformed.name,
                        filmNameEn: '',
                        theaterName: inquiryModel.movieTheaterOrganization.location.name.ja,
                        screenName: offer.itemOffered.reservationFor.location.name.ja,
                        performanceDay: moment(offer.itemOffered.reservationFor.startDate).format('YYYY/MM/DD'),
                        performanceStartTime: UtilModule.timeFormat(offer.itemOffered.reservationFor.startDate, offer.itemOffered.reservationFor.coaInfo.dateJouei),
                        seatCode: offer.itemOffered.reservedTicket.coaTicketInfo.seatNum,
                        ticketName: (offer.itemOffered.reservedTicket.coaTicketInfo.addGlasses > 0)
                            ? `${offer.itemOffered.reservedTicket.coaTicketInfo.ticketName}${req.__('common.glasses')}`
                            : offer.itemOffered.reservedTicket.coaTicketInfo.ticketName,
                        ticketSalePrice: offer.itemOffered.reservedTicket.coaTicketInfo.salePrice,
                        qrStr: offer.itemOffered.reservedTicket.ticketToken
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
