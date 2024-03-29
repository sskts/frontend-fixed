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
exports.topRender = exports.createPrintReservations = exports.getInquiryData = exports.stopRender = exports.settingRender = void 0;
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
            if (req.session === undefined) {
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
            }
            const options = yield (0, functions_1.getApiOption)(req);
            const searchResult = yield new req.cinerino.service.Seller(options).search({});
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
 */
function getInquiryData(req, res) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.session === undefined) {
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
            }
            const options = yield (0, functions_1.getApiOption)(req);
            (0, forms_1.inquiryLoginForm)(req);
            const validationResult = yield req.getValidationResult();
            if (validationResult.isEmpty()) {
                const inquiryModel = new models_1.InquiryModel();
                const searchResult = yield new req.cinerino.service.Seller(options).search({
                    branchCode: { $eq: req.body.theaterCode },
                });
                const seller = searchResult.data[0];
                inquiryModel.seller = seller;
                if ((seller === null || seller === void 0 ? void 0 : seller.id) === undefined ||
                    ((_a = seller === null || seller === void 0 ? void 0 : seller.location) === null || _a === void 0 ? void 0 : _a.branchCode) === undefined) {
                    throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
                }
                inquiryModel.login = {
                    reserveNum: req.body.reserveNum,
                    telephone: req.body.telephone,
                };
                const orderService = new req.cinerino.service.Order(Object.assign(Object.assign({}, options), { seller: { id: seller.id } }));
                const findByOrderInquiryKey4ssktsResult = yield orderService.findByOrderInquiryKey4sskts({
                    telephone: inquiryModel.login.telephone,
                    confirmationNumber: inquiryModel.login.reserveNum,
                    theaterCode: seller.location.branchCode,
                });
                const order = Array.isArray(findByOrderInquiryKey4ssktsResult)
                    ? findByOrderInquiryKey4ssktsResult[0]
                    : findByOrderInquiryKey4ssktsResult;
                const acceptedOffers = yield orderService.searchAcceptedOffersByConfirmationNumber({
                    confirmationNumber: order.confirmationNumber,
                    orderNumber: order.orderNumber,
                });
                if (acceptedOffers.length === 0) {
                    throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
                }
                inquiryModel.order = order;
                inquiryModel.acceptedOffers = acceptedOffers;
                log('オーダーOut', inquiryModel.order);
                if (inquiryModel.order === undefined) {
                    throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
                }
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
    const { seller, order, acceptedOffers } = inquiryModel;
    if (order === undefined ||
        acceptedOffers === undefined ||
        acceptedOffers.length === 0 ||
        (seller === null || seller === void 0 ? void 0 : seller.location) === undefined) {
        throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
    }
    const theaterName = typeof seller.location.name === 'string'
        ? seller.location.name
        : seller.location.name === undefined ||
            seller.location.name.ja === undefined
            ? ''
            : seller.location.name.ja;
    return acceptedOffers.map((offer) => {
        const itemOffered = offer.itemOffered;
        if (itemOffered.typeOf !==
            cinerinoService.factory.reservationType.EventReservation ||
            itemOffered.reservationFor.superEvent.workPerformed === undefined ||
            itemOffered.reservationFor.location === undefined ||
            itemOffered.reservationFor.location.name === undefined ||
            itemOffered.reservedTicket.ticketToken === undefined ||
            itemOffered.reservedTicket.coaTicketInfo === undefined ||
            itemOffered.reservationFor.coaInfo === undefined) {
            throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
        }
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
            performanceStartTime: (0, functions_1.timeFormat)(moment(itemOffered.reservationFor.startDate).toDate(), itemOffered.reservationFor.coaInfo.dateJouei),
            seatCode: itemOffered.reservedTicket.coaTicketInfo.seatNum,
            ticketName: itemOffered.reservedTicket.coaTicketInfo.ticketName,
            ticketSalePrice: itemOffered.reservedTicket.coaTicketInfo.salePrice,
            qrStr: itemOffered.reservedTicket.ticketToken,
        };
    });
}
exports.createPrintReservations = createPrintReservations;
// tslint:disable-next-line:variable-name
function topRender(_req, res, next) {
    try {
        res.render('index/index');
    }
    catch (err) {
        next(err);
    }
}
exports.topRender = topRender;
