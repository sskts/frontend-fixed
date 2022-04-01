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
 * 購入確認
 * @namespace Purchase.ConfirmModule
 */
const cinerinoService = require("@cinerino/sdk");
const debug = require("debug");
const HTTPStatus = require("http-status");
const functions_1 = require("../../functions");
const models_1 = require("../../models");
const log = debug('SSKTS:Purchase.ConfirmModule');
/**
 * 購入者内容確認
 * @memberof Purchase.ConfirmModule
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
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
            const purchaseModel = new models_1.PurchaseModel(req.session.purchase);
            if (purchaseModel.isExpired())
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Expire);
            if (!purchaseModel.accessAuth(models_1.PurchaseModel.CONFIRM_STATE)) {
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Access);
            }
            //購入者内容確認表示
            res.locals.updateReserve = undefined;
            res.locals.error = undefined;
            res.locals.purchaseModel = purchaseModel;
            res.locals.step = models_1.PurchaseModel.CONFIRM_STATE;
            //セッション更新
            purchaseModel.save(req.session);
            res.render('purchase/confirm', { layout: 'layouts/purchase/layout' });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.render = render;
/**
 *  予約情報からムビチケ情報作成
 */
function createMovieTicketsFromAuthorizeSeatReservation(params) {
    const results = [];
    const authorizeSeatReservation = params.authorizeSeatReservation;
    const checkMovieTicketAction = params.checkMovieTicketAction;
    const seller = params.seller;
    if (checkMovieTicketAction.result === undefined) {
        return [];
    }
    const movieTickets = checkMovieTicketAction.result.movieTickets;
    authorizeSeatReservation.object.acceptedOffer.forEach((o) => {
        const findReservation = movieTickets.find((m) => {
            return m.identifier === o.ticketInfo.mvtkNum && m.serviceType === o.ticketInfo.mvtkKbnKensyu;
        });
        if (findReservation === undefined) {
            return;
        }
        results.push({
            typeOf: findReservation.typeOf,
            identifier: findReservation.identifier,
            accessCode: findReservation.accessCode,
            serviceType: findReservation.serviceType,
            serviceOutput: Object.assign(Object.assign({}, findReservation.serviceOutput), { reservedTicket: Object.assign(Object.assign({}, findReservation.serviceOutput.reservedTicket), { ticketedSeat: Object.assign(Object.assign({}, findReservation.serviceOutput.reservedTicket.ticketedSeat), { seatNumber: o.seatNumber, seatSection: o.seatSection }) }) }),
            project: seller.project
        });
    });
    return results;
}
exports.createMovieTicketsFromAuthorizeSeatReservation = createMovieTicketsFromAuthorizeSeatReservation;
/**
 * 購入確定
 * @memberof Purchase.ConfirmModule
 * @function purchase
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 * @description フロー(本予約成功、本予約失敗、購入期限切れ)
 */
// tslint:disable-next-line:max-func-body-length
function purchase(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const purchaseResult = {
            mvtk: undefined,
            order: undefined,
            mail: undefined,
            cognito: undefined,
            complete: undefined
        };
        try {
            if (req.session === undefined)
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
            const options = functions_1.getApiOption(req);
            const purchaseModel = new models_1.PurchaseModel(req.session.purchase);
            const transaction = purchaseModel.transaction;
            const seller = purchaseModel.seller;
            const seatReservationAuthorization = purchaseModel.seatReservationAuthorization;
            if (transaction === undefined
                || req.body.transactionId !== transaction.id
                || seller === undefined
                || seatReservationAuthorization === undefined) {
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
            }
            //購入期限切れ
            if (purchaseModel.isExpired()) {
                delete req.session.purchase;
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Expire);
            }
            const mvtkTickets = purchaseModel.reserveTickets.filter((ticket) => {
                return (ticket.mvtkNum !== '');
            });
            const checkMovieTicketAction = purchaseModel.checkMovieTicketAction;
            // ムビチケ使用
            if (purchaseModel.mvtk !== undefined
                && mvtkTickets.length > 0
                && checkMovieTicketAction !== undefined) {
                const movieTickets = createMovieTicketsFromAuthorizeSeatReservation({
                    authorizeSeatReservation: seatReservationAuthorization,
                    seller,
                    checkMovieTicketAction
                });
                const identifiers = [];
                movieTickets.forEach((m) => {
                    const findResult = identifiers.find((i) => i === m.identifier);
                    if (findResult !== undefined) {
                        return;
                    }
                    identifiers.push(m.identifier);
                });
                const paymentServices = (yield new cinerinoService.service.Product(options).search({
                    typeOf: {
                        $eq: cinerinoService.factory.service.paymentService.PaymentServiceType
                            .MovieTicket
                    }
                })).data;
                const paymentService = paymentServices.filter((p) => {
                    if (p.provider === undefined) {
                        return false;
                    }
                    const findResult = p.provider.find((provider) => provider.id === seller.id);
                    return findResult !== undefined;
                })[0];
                if (paymentService === undefined ||
                    paymentService.serviceType === undefined ||
                    paymentService.id === undefined) {
                    throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
                }
                for (const identifier of identifiers) {
                    yield new cinerinoService.service.Payment(options).authorizeMovieTicket({
                        object: {
                            typeOf: cinerinoService.factory.action.authorize.paymentMethod.any.ResultType.Payment,
                            amount: 0,
                            movieTickets: movieTickets.filter((m) => m.identifier === identifier),
                            paymentMethod: movieTickets[0].typeOf,
                            issuedThrough: {
                                id: paymentService.id
                            }
                        },
                        purpose: transaction
                    });
                }
                log('Mvtk payment');
            }
            purchaseResult.order = yield new cinerinoService.service.transaction.PlaceOrder4sskts(options)
                .confirm({
                id: transaction.id,
                sendEmailMessage: false
            });
            log('Order confirmation');
            //購入情報をセッションへ
            const complete = {
                transaction: purchaseModel.transaction,
                screeningEvent: purchaseModel.screeningEvent,
                profile: purchaseModel.profile,
                seatReservationAuthorization: purchaseModel.seatReservationAuthorization,
                reserveTickets: purchaseModel.reserveTickets
            };
            req.session.complete = complete;
            purchaseResult.complete = complete;
            // 購入セッション削除
            delete req.session.purchase;
            // 購入完了情報を返す
            res.json({ result: purchaseResult });
        }
        catch (err) {
            log('purchase error', err);
            if (err.code !== undefined) {
                res.status(err.code);
            }
            else {
                res.status(httpStatus.BAD_REQUEST);
            }
            res.json({ error: err });
        }
    });
}
exports.purchase = purchase;
/**
 * 完了情報取得
 * @memberof Purchase.ConfirmModule
 * @function getCompleteData
 * @param {Request} req
 * @param {Response} res
 * @returns {void}
 */
function getCompleteData(req, res) {
    try {
        if (req.session === undefined)
            throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
        if (req.session.complete === undefined)
            throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Expire);
        res.json({ result: req.session.complete });
    }
    catch (err) {
        log('getCompleteData error', err);
        if (err.code !== undefined) {
            res.status(err.code);
        }
        else {
            res.status(httpStatus.BAD_REQUEST);
        }
        res.json({ error: err });
    }
}
exports.getCompleteData = getCompleteData;
