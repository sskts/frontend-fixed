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
 * 照会
 * @namespace Fixed.FixedModule
 */
const sasaki = require("@motionpicture/sskts-api-nodejs-client");
const debug = require("debug");
const HTTPStatus = require("http-status");
const moment = require("moment");
const functions_1 = require("../../functions");
const forms_1 = require("../../functions/forms");
const models_1 = require("../../models");
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
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
            const options = functions_1.getApiOption(req);
            const searchResult = yield new sasaki.service.Seller(options).search({});
            const sellers = searchResult.data;
            log('sellers: ', sellers);
            res.locals.sellers = sellers;
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
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
            const options = functions_1.getApiOption(req);
            forms_1.inquiryLoginForm(req);
            const validationResult = yield req.getValidationResult();
            if (validationResult.isEmpty()) {
                const inquiryModel = new models_1.InquiryModel();
                const searchResult = yield new sasaki.service.Seller(options).search({
                    location: { branchCodes: [req.body.theaterCode] }
                });
                inquiryModel.seller = searchResult.data[0];
                if (inquiryModel.seller === undefined
                    || inquiryModel.seller.location === undefined
                    || inquiryModel.seller.location.branchCode === undefined) {
                    throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
                }
                inquiryModel.login = {
                    reserveNum: req.body.reserveNum,
                    telephone: req.body.telephone
                };
                inquiryModel.order = yield new sasaki.service.Order(options).findByOrderInquiryKey({
                    telephone: inquiryModel.login.telephone,
                    confirmationNumber: Number(inquiryModel.login.reserveNum),
                    theaterCode: inquiryModel.seller.location.branchCode
                });
                log('オーダーOut', inquiryModel.order);
                if (inquiryModel.order === null)
                    throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
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
        || inquiryModel.seller === undefined
        || inquiryModel.seller.location === undefined)
        throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
    const reserveNo = inquiryModel.order.confirmationNumber;
    const theaterName = inquiryModel.seller.location.name.ja;
    return inquiryModel.order.acceptedOffers.map((offer) => {
        if (offer.itemOffered.typeOf !== sasaki.factory.chevre.reservationType.EventReservation
            || offer.itemOffered.reservationFor.workPerformed === undefined
            || offer.itemOffered.reservationFor.location === undefined
            || offer.itemOffered.reservationFor.location.name === undefined
            || offer.itemOffered.reservedTicket.ticketToken === undefined
            || offer.itemOffered.reservedTicket.coaTicketInfo === undefined
            || offer.itemOffered.reservationFor.coaInfo === undefined)
            throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
        return {
            reserveNo: reserveNo,
            filmNameJa: offer.itemOffered.reservationFor.workPerformed.name,
            filmNameEn: '',
            theaterName: theaterName,
            screenName: offer.itemOffered.reservationFor.location.name.ja,
            performanceDay: moment(offer.itemOffered.reservationFor.startDate).format('YYYY/MM/DD'),
            performanceStartTime: functions_1.timeFormat(moment(offer.itemOffered.reservationFor.startDate).toDate(), offer.itemOffered.reservationFor.coaInfo.dateJouei),
            seatCode: offer.itemOffered.reservedTicket.coaTicketInfo.seatNum,
            ticketName: offer.itemOffered.reservedTicket.coaTicketInfo.ticketName,
            ticketSalePrice: offer.itemOffered.reservedTicket.coaTicketInfo.salePrice,
            qrStr: offer.itemOffered.reservedTicket.ticketToken
        };
    });
}
exports.createPrintReservations = createPrintReservations;
