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
const sasaki = require("@motionpicture/sskts-api-nodejs-client");
const debug = require("debug");
const HTTPStatus = require("http-status");
const moment = require("moment");
const LoginForm_1 = require("../../forms/Inquiry/LoginForm");
const AuthModel_1 = require("../../models/Auth/AuthModel");
const InquiryModel_1 = require("../../models/Inquiry/InquiryModel");
const ErrorUtilModule_1 = require("../Util/ErrorUtilModule");
const UtilModule = require("../Util/UtilModule");
const log = debug('SSKTS:Fixed.FixedModule');
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
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
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
            next(err);
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
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
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
                if (inquiryModel.movieTheaterOrganization === null)
                    throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
                inquiryModel.login = {
                    reserveNum: req.body.reserveNum,
                    telephone: req.body.telephone
                };
                inquiryModel.order = yield sasaki.service.order(options).findByOrderInquiryKey({
                    telephone: inquiryModel.login.telephone,
                    confirmationNumber: Number(inquiryModel.login.reserveNum),
                    theaterCode: inquiryModel.movieTheaterOrganization.location.branchCode
                });
                log('オーダーIn', {
                    telephone: inquiryModel.login.telephone,
                    confirmationNumber: Number(inquiryModel.login.reserveNum),
                    theaterCode: inquiryModel.movieTheaterOrganization.location.branchCode
                });
                log('オーダーOut', inquiryModel.order);
                if (inquiryModel.order === null)
                    throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
                // 印刷用
                const reservations = createPrintReservations(inquiryModel);
                res.json({ result: reservations });
                return;
            }
            res.json({ result: null });
        }
        catch (err) {
            log('オーダーerr', err);
            res.json({ result: null });
        }
    });
}
exports.getInquiryData = getInquiryData;
/**
 * 印刷用予約情報生成
 * @function createPrintReservations
 * @param {Request} req
 * @param {InquiryModel} inquiryModel
 * @returns {IReservation[]}
 */
function createPrintReservations(inquiryModel) {
    if (inquiryModel.order === null
        || inquiryModel.movieTheaterOrganization === null)
        throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
    const reserveNo = inquiryModel.order.confirmationNumber;
    const theaterName = inquiryModel.movieTheaterOrganization.location.name.ja;
    return inquiryModel.order.acceptedOffers.map((offer) => {
        if (offer.itemOffered.reservationFor.workPerformed === undefined
            || offer.itemOffered.reservationFor.location === undefined
            || offer.itemOffered.reservationFor.location.name === undefined)
            throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
        return {
            reserveNo: reserveNo,
            filmNameJa: offer.itemOffered.reservationFor.workPerformed.name,
            filmNameEn: '',
            theaterName: theaterName,
            screenName: offer.itemOffered.reservationFor.location.name.ja,
            performanceDay: moment(offer.itemOffered.reservationFor.startDate).format('YYYY/MM/DD'),
            performanceStartTime: UtilModule.timeFormat(offer.itemOffered.reservationFor.startDate, offer.itemOffered.reservationFor.coaInfo.dateJouei),
            seatCode: offer.itemOffered.reservedTicket.coaTicketInfo.seatNum,
            ticketName: offer.itemOffered.reservedTicket.coaTicketInfo.ticketName,
            ticketSalePrice: offer.itemOffered.reservedTicket.coaTicketInfo.salePrice,
            qrStr: offer.itemOffered.reservedTicket.ticketToken
        };
    });
}
exports.createPrintReservations = createPrintReservations;
