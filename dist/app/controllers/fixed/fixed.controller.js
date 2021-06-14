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
const cinerinoService = require("@cinerino/sdk");
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
            const searchResult = yield new cinerinoService.service.Seller(options).search({});
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
                const searchResult = yield new cinerinoService.service.Seller(options).search({
                    branchCode: { $eq: req.body.theaterCode }
                });
                inquiryModel.seller = searchResult.data[0];
                if (inquiryModel.seller === undefined ||
                    inquiryModel.seller.location === undefined ||
                    inquiryModel.seller.location.branchCode === undefined) {
                    throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
                }
                inquiryModel.login = {
                    reserveNum: req.body.reserveNum,
                    telephone: req.body.telephone
                };
                const findResult = yield new cinerinoService.service.Order(options).findByOrderInquiryKey4sskts({
                    telephone: inquiryModel.login.telephone,
                    confirmationNumber: inquiryModel.login.reserveNum,
                    theaterCode: inquiryModel.seller.location.branchCode
                });
                inquiryModel.order = Array.isArray(findResult)
                    ? findResult[0]
                    : findResult;
                log('オーダーOut', inquiryModel.order);
                if (inquiryModel.order === undefined)
                    throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
                // 印刷用
                const reservations = createPrintReservations(inquiryModel);
                res.json({ result: reservations });
                return;
            }
            res.json({ result: [] });
        }
        catch (err) {
            log('オーダーerr', err);
            res.json({ result: [] });
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
    if (inquiryModel.order === undefined ||
        inquiryModel.seller === undefined ||
        inquiryModel.seller.location === undefined) {
        throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
    }
    const theaterName = typeof inquiryModel.seller.location.name === 'string'
        ? inquiryModel.seller.location.name
        : inquiryModel.seller.location.name === undefined ||
            inquiryModel.seller.location.name.ja === undefined
            ? ''
            : inquiryModel.seller.location.name.ja;
    return inquiryModel.order.acceptedOffers.map((offer) => {
        const itemOffered = offer.itemOffered;
        if (itemOffered.typeOf !==
            cinerinoService.factory.chevre.reservationType
                .EventReservation ||
            itemOffered.reservationFor.workPerformed === undefined ||
            itemOffered.reservationFor.location === undefined ||
            itemOffered.reservationFor.location.name === undefined ||
            itemOffered.reservedTicket.ticketToken === undefined ||
            itemOffered.reservedTicket.coaTicketInfo === undefined ||
            itemOffered.reservationFor.coaInfo === undefined)
            throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
        return {
            reserveNo: itemOffered.reservationNumber,
            filmNameJa: itemOffered.reservationFor.name.ja === undefined
                ? ''
                : itemOffered.reservationFor.name.ja,
            filmNameEn: '',
            theaterName: theaterName,
            screenName: itemOffered.reservationFor.location.name === undefined ||
                itemOffered.reservationFor.location.name.ja === undefined
                ? ''
                : itemOffered.reservationFor.location.name.ja,
            performanceDay: moment(itemOffered.reservationFor.startDate).format('YYYY/MM/DD'),
            performanceStartTime: functions_1.timeFormat(moment(itemOffered.reservationFor.startDate).toDate(), itemOffered.reservationFor.coaInfo.dateJouei),
            seatCode: itemOffered.reservedTicket.coaTicketInfo.seatNum,
            ticketName: itemOffered.reservedTicket.coaTicketInfo.ticketName,
            ticketSalePrice: itemOffered.reservedTicket.coaTicketInfo.salePrice,
            qrStr: itemOffered.reservedTicket.ticketToken
        };
    });
}
exports.createPrintReservations = createPrintReservations;
