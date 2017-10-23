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
 * 購入券種選択
 * @namespace Purchase.TicketModule
 */
const sasaki = require("@motionpicture/sskts-api-nodejs-client");
const debug = require("debug");
const HTTPStatus = require("http-status");
const TicketForm_1 = require("../../forms/Purchase/TicketForm");
const AuthModel_1 = require("../../models/Auth/AuthModel");
const PurchaseModel_1 = require("../../models/Purchase/PurchaseModel");
const ErrorModule_1 = require("../Error/ErrorModule");
const ErrorUtilModule_1 = require("../Util/ErrorUtilModule");
const InputModule = require("./InputModule");
const log = debug('SSKTS:Purchase.TicketModule');
/**
 * 券種選択
 * @memberof Purchase.TicketModule
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
            const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
            const authModel = new AuthModel_1.AuthModel(req.session.auth);
            const options = {
                endpoint: process.env.SSKTS_API_ENDPOINT,
                auth: authModel.create()
            };
            if (purchaseModel.individualScreeningEvent === null)
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            if (purchaseModel.isExpired())
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Expire);
            if (!purchaseModel.accessAuth(PurchaseModel_1.PurchaseModel.TICKET_STATE)) {
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Access);
            }
            if (authModel.isMember()) {
                if (purchaseModel.profile === null) {
                    const contacts = yield sasaki.service.person(options).getContacts({
                        personId: 'me'
                    });
                    log('会員情報取得', contacts);
                    purchaseModel.profile = {
                        familyName: contacts.familyName,
                        givenName: contacts.givenName,
                        email: contacts.email,
                        emailConfirm: contacts.email,
                        telephone: contacts.telephone.replace(/\-/g, '')
                    };
                }
                if (purchaseModel.creditCards.length === 0) {
                    const creditCards = yield sasaki.service.person(options).findCreditCards({
                        personId: 'me'
                    });
                    log('会員クレジット情報取得', purchaseModel.creditCards);
                    purchaseModel.creditCards = creditCards.filter((creditCard) => {
                        // GMO定数へ変更
                        return (creditCard.deleteFlag === '0');
                    });
                }
            }
            //券種取得
            res.locals.error = '';
            res.locals.salesTickets = purchaseModel.getSalesTickets();
            res.locals.purchaseModel = purchaseModel;
            res.locals.step = PurchaseModel_1.PurchaseModel.TICKET_STATE;
            //セッション更新
            purchaseModel.save(req.session);
            //券種選択表示
            res.render('purchase/ticket', { layout: 'layouts/purchase/layout' });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.render = render;
/**
 * 券種決定
 * @memberof Purchase.TicketModule
 * @function ticketSelect
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
// tslint:disable-next-line:max-func-body-length cyclomatic-complexity
function ticketSelect(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.session === undefined) {
            next(new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property));
            return;
        }
        try {
            const authModel = new AuthModel_1.AuthModel(req.session.auth);
            const options = {
                endpoint: process.env.SSKTS_API_ENDPOINT,
                auth: authModel.create()
            };
            const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
            if (purchaseModel.isExpired())
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Expire);
            if (purchaseModel.transaction === null
                || purchaseModel.individualScreeningEvent === null
                || purchaseModel.seatReservationAuthorization === null
                || req.body.transactionId !== purchaseModel.transaction.id) {
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            }
            //バリデーション
            TicketForm_1.default(req);
            const validationResult = yield req.getValidationResult();
            if (validationResult.isEmpty()) {
                const selectTickets = JSON.parse(req.body.reserveTickets);
                purchaseModel.reserveTickets = convertToReserveTickets(req, purchaseModel, selectTickets);
                log('券種変換');
                ticketValidation(purchaseModel);
                log('券種検証');
                //COAオーソリ追加
                const changeSeatReservationOffersArgs = {
                    transactionId: purchaseModel.transaction.id,
                    actionId: purchaseModel.seatReservationAuthorization.id,
                    eventIdentifier: purchaseModel.individualScreeningEvent.identifier,
                    offers: purchaseModel.reserveTickets.map((reserveTicket) => {
                        return {
                            seatSection: reserveTicket.section,
                            seatNumber: reserveTicket.seatCode,
                            ticketInfo: {
                                ticketCode: reserveTicket.ticketCode,
                                mvtkAppPrice: reserveTicket.mvtkAppPrice,
                                ticketCount: 1,
                                addGlasses: reserveTicket.addPriceGlasses,
                                kbnEisyahousiki: reserveTicket.kbnEisyahousiki,
                                mvtkNum: reserveTicket.mvtkNum,
                                mvtkKbnDenshiken: reserveTicket.mvtkKbnDenshiken,
                                mvtkKbnMaeuriken: reserveTicket.mvtkKbnMaeuriken,
                                mvtkKbnKensyu: reserveTicket.mvtkKbnKensyu,
                                mvtkSalesPrice: reserveTicket.mvtkSalesPrice
                            }
                        };
                    })
                };
                purchaseModel.seatReservationAuthorization = yield sasaki.service.transaction.placeOrder(options)
                    .changeSeatReservationOffers(changeSeatReservationOffersArgs);
                if (purchaseModel.seatReservationAuthorization === null) {
                    throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
                }
                log('SSKTSCOA仮予約更新');
                if (purchaseModel.mvtkAuthorization !== null) {
                    yield sasaki.service.transaction.placeOrder(options).cancelMvtkAuthorization({
                        transactionId: purchaseModel.transaction.id,
                        actionId: purchaseModel.mvtkAuthorization.id
                    });
                    log('SSKTSムビチケオーソリ削除');
                }
                if (purchaseModel.mvtk.length > 0 && purchaseModel.isReserveMvtkTicket()) {
                    // 購入管理番号情報
                    const mvtkSeatInfoSync = purchaseModel.getMvtkSeatInfoSync();
                    log('購入管理番号情報', mvtkSeatInfoSync);
                    if (mvtkSeatInfoSync === null)
                        throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
                    const createMvtkAuthorizationArgs = {
                        transactionId: purchaseModel.transaction.id,
                        mvtk: {
                            price: purchaseModel.getMvtkPrice(),
                            transactionId: purchaseModel.transaction.id,
                            seatInfoSyncIn: mvtkSeatInfoSync
                        }
                    };
                    log('SSKTSムビチケオーソリ追加IN', createMvtkAuthorizationArgs);
                    log('seatInfoSyncIn.knyknrNoInfo', createMvtkAuthorizationArgs.mvtk.seatInfoSyncIn.knyknrNoInfo[0]);
                    purchaseModel.mvtkAuthorization = yield sasaki.service.transaction.placeOrder(options)
                        .createMvtkAuthorization(createMvtkAuthorizationArgs);
                    log('SSKTSムビチケオーソリ追加', purchaseModel.mvtkAuthorization);
                }
                purchaseModel.save(req.session);
                log('セッション更新');
                if (authModel.isMember() && purchaseModel.getReserveAmount() === 0) {
                    // 情報入力スキップ
                    yield InputModule.purchaserInformationRegistrationOfMember(req, res, next);
                }
                else {
                    res.redirect('/purchase/input');
                }
            }
            else {
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            }
        }
        catch (err) {
            if (err.code === HTTPStatus.BAD_REQUEST
                && err.errorType === ErrorUtilModule_1.ErrorType.Validation) {
                // 割引条件エラー
                const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
                purchaseModel.reserveTickets = JSON.parse(req.body.reserveTickets);
                res.locals.error = err.message;
                res.locals.salesTickets = purchaseModel.getSalesTickets();
                res.locals.purchaseModel = purchaseModel;
                res.locals.step = PurchaseModel_1.PurchaseModel.TICKET_STATE;
                res.render('purchase/ticket', { layout: 'layouts/purchase/layout' });
                return;
            }
            else if (err.code === HTTPStatus.BAD_REQUEST
                && err.errors
                && err.errors.filter((error) => error.reason === 'Argument').length > 0) {
                // 割引条件エラー
                const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
                purchaseModel.reserveTickets = JSON.parse(req.body.reserveTickets);
                const errors = err.errors.map((error) => {
                    const index = Number(error.argumentName.split('.')[1]);
                    return purchaseModel.reserveTickets[index].ticketCode;
                });
                res.locals.error = JSON.stringify(errors);
                res.locals.salesTickets = purchaseModel.getSalesTickets();
                res.locals.purchaseModel = purchaseModel;
                res.locals.step = PurchaseModel_1.PurchaseModel.TICKET_STATE;
                res.render('purchase/ticket', { layout: 'layouts/purchase/layout' });
                return;
            }
            else if (err.code === HTTPStatus.NOT_FOUND
                && err.errors
                && err.errors.find((error) => error.entityName.indexOf('offers') > -1) !== undefined) {
                // 券種が存在しない
                ErrorModule_1.deleteSession(req.session);
                const status = err.code;
                res.locals.message = req.__('purchase.ticket.notFound');
                res.locals.error = err;
                res.status(status).render('error/error');
                return;
            }
            next(err);
        }
    });
}
exports.ticketSelect = ticketSelect;
/**
 * 券種変換
 * @memberof Purchase.TicketModule
 * @function convertToReserveTickets
 * @param {Request} req
 * @param {PurchaseModel} purchaseModel
 * @param {ISelectTicket[]} rselectTickets
 * @returns {void}
 */
function convertToReserveTickets(req, purchaseModel, selectTickets) {
    if (purchaseModel.salesTickets === null)
        throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
    const result = [];
    //コアAPI券種取得
    const salesTickets = purchaseModel.salesTickets;
    for (const ticket of selectTickets) {
        if (ticket.mvtkNum !== '') {
            // ムビチケ
            if (purchaseModel.mvtk === null)
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            const mvtkTicket = purchaseModel.mvtk.find((value) => {
                return (value.code === ticket.mvtkNum && value.ticket.ticketCode === ticket.ticketCode);
            });
            if (mvtkTicket === undefined)
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            const reserveTicket = {
                section: ticket.section,
                seatCode: ticket.seatCode,
                ticketCode: mvtkTicket.ticket.ticketCode,
                ticketName: (ticket.glasses)
                    ? `${mvtkTicket.ticket.ticketName}${req.__('common.glasses')}`
                    : mvtkTicket.ticket.ticketName,
                ticketNameEng: mvtkTicket.ticket.ticketNameEng,
                ticketNameKana: mvtkTicket.ticket.ticketNameKana,
                stdPrice: 0,
                addPrice: mvtkTicket.ticket.addPrice,
                disPrice: 0,
                salePrice: (ticket.glasses)
                    ? mvtkTicket.ticket.addPrice + mvtkTicket.ticket.addPriceGlasses
                    : mvtkTicket.ticket.addPrice,
                ticketNote: '',
                addPriceGlasses: (ticket.glasses)
                    ? mvtkTicket.ticket.addPriceGlasses
                    : 0,
                glasses: ticket.glasses,
                mvtkAppPrice: Number(mvtkTicket.ykknInfo.kijUnip),
                kbnEisyahousiki: mvtkTicket.ykknInfo.eishhshkTyp,
                mvtkNum: mvtkTicket.code,
                mvtkKbnDenshiken: mvtkTicket.ykknInfo.dnshKmTyp,
                mvtkKbnMaeuriken: mvtkTicket.ykknInfo.znkkkytsknGkjknTyp,
                mvtkKbnKensyu: mvtkTicket.ykknInfo.ykknshTyp,
                mvtkSalesPrice: Number(mvtkTicket.ykknInfo.knshknhmbiUnip),
                limitUnit: '001',
                limitCount: 1
            };
            result.push(reserveTicket);
        }
        else {
            // 通常券種
            const salesTicket = salesTickets.find((value) => {
                return (value.ticketCode === ticket.ticketCode);
            });
            if (salesTicket === undefined)
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            result.push({
                section: ticket.section,
                seatCode: ticket.seatCode,
                ticketCode: salesTicket.ticketCode,
                ticketName: (ticket.glasses)
                    ? `${salesTicket.ticketName}${req.__('common.glasses')}`
                    : salesTicket.ticketName,
                ticketNameEng: salesTicket.ticketNameEng,
                ticketNameKana: salesTicket.ticketNameKana,
                stdPrice: salesTicket.stdPrice,
                addPrice: salesTicket.addPrice,
                disPrice: 0,
                salePrice: (ticket.glasses)
                    ? salesTicket.salePrice + salesTicket.addGlasses
                    : salesTicket.salePrice,
                ticketNote: salesTicket.ticketNote,
                addPriceGlasses: (ticket.glasses)
                    ? salesTicket.addGlasses
                    : 0,
                glasses: ticket.glasses,
                mvtkAppPrice: 0,
                kbnEisyahousiki: '00',
                mvtkNum: '',
                mvtkKbnDenshiken: '00',
                mvtkKbnMaeuriken: '00',
                mvtkKbnKensyu: '00',
                mvtkSalesPrice: 0,
                limitUnit: salesTicket.limitUnit,
                limitCount: salesTicket.limitCount
            });
        }
    }
    return result;
}
/**
 * 券種検証
 * @function ticketValidation
 * @param {PurchaseModel} purchaseModel
 */
function ticketValidation(purchaseModel) {
    // 制限単位、人数制限判定
    const result = [];
    if (purchaseModel.reserveTickets.length === 0)
        throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
    purchaseModel.reserveTickets.forEach((reserveTicket) => {
        if (reserveTicket.limitUnit === '001') {
            const unitLimitTickets = purchaseModel.reserveTickets.filter((ticket) => {
                return (ticket.limitUnit === '001' && ticket.limitCount === reserveTicket.limitCount);
            });
            if (unitLimitTickets.length % reserveTicket.limitCount !== 0) {
                result.push(reserveTicket.ticketCode);
            }
        }
    });
    if (result.length > 0) {
        throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Validation, JSON.stringify(result));
    }
}
