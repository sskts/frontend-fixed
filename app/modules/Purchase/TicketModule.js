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
const TicketForm_1 = require("../../forms/Purchase/TicketForm");
const AuthModel_1 = require("../../models/Auth/AuthModel");
const PurchaseModel_1 = require("../../models/Purchase/PurchaseModel");
const ErrorUtilModule = require("../Util/ErrorUtilModule");
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
                throw ErrorUtilModule.ErrorType.Property;
            const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
            const authModel = new AuthModel_1.AuthModel(req.session.auth);
            const options = {
                endpoint: process.env.SSKTS_API_ENDPOINT,
                auth: authModel.create()
            };
            if (purchaseModel.individualScreeningEvent === null)
                throw ErrorUtilModule.ErrorType.Property;
            if (purchaseModel.isExpired())
                throw ErrorUtilModule.ErrorType.Expire;
            if (!purchaseModel.accessAuth(PurchaseModel_1.PurchaseModel.TICKET_STATE))
                throw ErrorUtilModule.ErrorType.Access;
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
            res.locals.salesTickets = purchaseModel.getSalesTickets(req);
            res.locals.purchaseModel = purchaseModel;
            res.locals.step = PurchaseModel_1.PurchaseModel.TICKET_STATE;
            //セッション更新
            purchaseModel.save(req.session);
            //券種選択表示
            res.render('purchase/ticket', { layout: 'layouts/purchase/layout' });
            return;
        }
        catch (err) {
            const error = (err instanceof Error) ? err : new ErrorUtilModule.AppError(err, undefined);
            next(error);
            return;
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
// tslint:disable-next-line:max-func-body-length
function ticketSelect(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.session === undefined) {
            next(new ErrorUtilModule.AppError(ErrorUtilModule.ErrorType.Property, undefined));
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
                throw ErrorUtilModule.ErrorType.Expire;
            if (purchaseModel.transaction === null
                || purchaseModel.individualScreeningEvent === null
                || purchaseModel.seatReservationAuthorization === null)
                throw ErrorUtilModule.ErrorType.Property;
            //取引id確認
            if (req.body.transactionId !== purchaseModel.transaction.id)
                throw ErrorUtilModule.ErrorType.Access;
            //バリデーション
            TicketForm_1.default(req);
            const validationResult = yield req.getValidationResult();
            if (validationResult.isEmpty()) {
                const selectTickets = JSON.parse(req.body.reserveTickets);
                purchaseModel.reserveTickets = yield ticketValidation(req, res, purchaseModel, selectTickets);
                log('券種検証');
                // COAオーソリ削除
                yield sasaki.service.transaction.placeOrder(options).cancelSeatReservationAuthorization({
                    transactionId: purchaseModel.transaction.id,
                    authorizationId: purchaseModel.seatReservationAuthorization.id
                });
                log('SSKTSCOAオーソリ削除');
                //COAオーソリ追加
                const createSeatReservationAuthorizationArgs = {
                    transactionId: purchaseModel.transaction.id,
                    eventIdentifier: purchaseModel.individualScreeningEvent.identifier,
                    offers: purchaseModel.reserveTickets.map((reserveTicket) => {
                        return {
                            seatSection: reserveTicket.section,
                            seatNumber: reserveTicket.seatCode,
                            ticketInfo: {
                                ticketCode: reserveTicket.ticketCode,
                                ticketName: reserveTicket.ticketName,
                                ticketNameEng: reserveTicket.ticketNameEng,
                                ticketNameKana: reserveTicket.ticketNameKana,
                                stdPrice: reserveTicket.stdPrice,
                                addPrice: reserveTicket.addPrice,
                                disPrice: reserveTicket.disPrice,
                                salePrice: reserveTicket.salePrice,
                                mvtkAppPrice: reserveTicket.mvtkAppPrice,
                                ticketCount: 1,
                                seatNum: reserveTicket.seatCode,
                                addGlasses: reserveTicket.addPriceGlasses,
                                kbnEisyahousiki: reserveTicket.kbnEisyahousiki,
                                mvtkNum: reserveTicket.mvtkNum,
                                mvtkKbnDenshiken: reserveTicket.mvtkKbnDenshiken,
                                mvtkKbnMaeuriken: reserveTicket.mvtkKbnKensyu,
                                mvtkKbnKensyu: reserveTicket.mvtkKbnKensyu,
                                mvtkSalesPrice: reserveTicket.mvtkSalesPrice
                            }
                        };
                    })
                };
                log('SSKTSCOAオーソリ追加IN', createSeatReservationAuthorizationArgs.offers[0]);
                purchaseModel.seatReservationAuthorization = yield sasaki.service.transaction.placeOrder(options)
                    .createSeatReservationAuthorization(createSeatReservationAuthorizationArgs);
                if (purchaseModel.seatReservationAuthorization === null)
                    throw ErrorUtilModule.ErrorType.Property;
                log('SSKTSCOAオーソリ追加', purchaseModel.seatReservationAuthorization);
                if (purchaseModel.mvtkAuthorization !== null) {
                    yield sasaki.service.transaction.placeOrder(options).cancelMvtkAuthorization({
                        transactionId: purchaseModel.transaction.id,
                        authorizationId: purchaseModel.mvtkAuthorization.id
                    });
                    log('SSKTSムビチケオーソリ削除');
                }
                if (purchaseModel.mvtk.length > 0 && purchaseModel.isReserveMvtkTicket()) {
                    // 購入管理番号情報
                    const mvtkSeatInfoSync = purchaseModel.getMvtkSeatInfoSync();
                    log('購入管理番号情報', mvtkSeatInfoSync);
                    if (mvtkSeatInfoSync === null)
                        throw ErrorUtilModule.ErrorType.Access;
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
                throw ErrorUtilModule.ErrorType.Access;
            }
        }
        catch (err) {
            if (err === ErrorUtilModule.ErrorType.Validation) {
                const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
                if (purchaseModel.individualScreeningEvent === null)
                    throw ErrorUtilModule.ErrorType.Property;
                res.locals.error = '';
                res.locals.salesTickets = purchaseModel.getSalesTickets(req);
                res.locals.purchaseModel = purchaseModel;
                res.locals.step = PurchaseModel_1.PurchaseModel.TICKET_STATE;
                res.render('purchase/ticket', { layout: 'layouts/purchase/layout' });
                return;
            }
            const error = (err instanceof Error) ? err : new ErrorUtilModule.AppError(err, undefined);
            next(error);
        }
    });
}
exports.ticketSelect = ticketSelect;
/**
 * 券種検証
 * @memberof Purchase.TicketModule
 * @function ticketValidation
 * @param {Request} req
 * @param {PurchaseModel} purchaseModel
 * @param {ISelectTicket[]} rselectTickets
 * @returns {Promise<void>}
 */
// tslint:disable-next-line:cyclomatic-complexity
// tslint:disable-next-line:max-func-body-length
function ticketValidation(req, res, purchaseModel, selectTickets) {
    return __awaiter(this, void 0, void 0, function* () {
        if (purchaseModel.salesTickets === null)
            throw ErrorUtilModule.ErrorType.Property;
        const result = [];
        //コアAPI券種取得
        const salesTickets = purchaseModel.salesTickets;
        for (const ticket of selectTickets) {
            if (ticket.mvtkNum !== '') {
                // ムビチケ
                if (purchaseModel.mvtk === null)
                    throw ErrorUtilModule.ErrorType.Property;
                const mvtkTicket = purchaseModel.mvtk.find((value) => {
                    return (value.code === ticket.mvtkNum && value.ticket.ticketCode === ticket.ticketCode);
                });
                if (mvtkTicket === undefined)
                    throw ErrorUtilModule.ErrorType.Access;
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
                    mvtkSalesPrice: Number(mvtkTicket.ykknInfo.knshknhmbiUnip) // ムビチケ販売単価
                };
                result.push(reserveTicket);
            }
            else {
                // 通常券種
                const salesTicket = salesTickets.find((value) => {
                    return (value.ticketCode === ticket.ticketCode);
                });
                if (salesTicket === undefined)
                    throw ErrorUtilModule.ErrorType.Access;
                // 制限単位、人数制限判定
                const mismatchTickets = [];
                const sameTickets = selectTickets.filter((value) => {
                    return (value.ticketCode === salesTicket.ticketCode);
                });
                if (sameTickets.length === 0)
                    throw ErrorUtilModule.ErrorType.Access;
                if (salesTicket.limitUnit === '001') {
                    if (sameTickets.length % salesTicket.limitCount !== 0) {
                        if (mismatchTickets.indexOf(ticket.ticketCode) === -1) {
                            mismatchTickets.push(ticket.ticketCode);
                        }
                    }
                }
                else if (salesTicket.limitUnit === '002') {
                    if (sameTickets.length < salesTicket.limitCount) {
                        if (mismatchTickets.indexOf(ticket.ticketCode) === -1) {
                            mismatchTickets.push(ticket.ticketCode);
                        }
                    }
                }
                if (mismatchTickets.length > 0) {
                    res.locals.error = JSON.stringify(mismatchTickets);
                    throw ErrorUtilModule.ErrorType.Validation;
                }
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
                    mvtkSalesPrice: 0 // ムビチケ販売単価
                });
            }
        }
        return result;
    });
}
