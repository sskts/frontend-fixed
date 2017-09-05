"use strict";
/**
 * 購入情報入力
 * @namespace Purchase.InputModule
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const GMO = require("@motionpicture/gmo-service");
const sasaki = require("@motionpicture/sasaki-api-nodejs");
const debug = require("debug");
const InputForm_1 = require("../../forms/Purchase/InputForm");
const logger_1 = require("../../middlewares/logger");
const AuthModel_1 = require("../../models/Auth/AuthModel");
const PurchaseModel_1 = require("../../models/Purchase/PurchaseModel");
const ErrorUtilModule = require("../Util/ErrorUtilModule");
const log = debug('SSKTS:Purchase.InputModule');
/**
 * 購入者情報入力
 * @memberof Purchase.InputModule
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
            if (req.session.purchase === undefined)
                throw ErrorUtilModule.ErrorType.Expire;
            const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
            const authModel = new AuthModel_1.AuthModel(req.session.auth);
            if (purchaseModel.isExpired())
                throw ErrorUtilModule.ErrorType.Expire;
            if (!purchaseModel.accessAuth(PurchaseModel_1.PurchaseModel.INPUT_STATE)) {
                throw ErrorUtilModule.ErrorType.Expire;
            }
            if (purchaseModel.transaction === null)
                throw ErrorUtilModule.ErrorType.Property;
            //購入者情報入力表示
            if (purchaseModel.profile !== null) {
                res.locals.input = purchaseModel.profile;
            }
            else {
                purchaseModel.profile = {
                    familyName: '',
                    givenName: '',
                    email: '',
                    emailConfirm: '',
                    telephone: ''
                };
            }
            purchaseModel.save(req.session);
            res.locals.error = null;
            res.locals.gmoError = null;
            res.locals.GMO_ENDPOINT = process.env.GMO_ENDPOINT;
            res.locals.purchaseModel = purchaseModel;
            res.locals.step = PurchaseModel_1.PurchaseModel.INPUT_STATE;
            if (authModel.isMember()) {
                res.render('purchase/member/input', { layout: 'layouts/purchase/layout' });
            }
            else {
                res.render('purchase/input', { layout: 'layouts/purchase/layout' });
            }
        }
        catch (err) {
            const error = (err instanceof Error)
                ? new ErrorUtilModule.CustomError(ErrorUtilModule.ErrorType.ExternalModule, err.message)
                : new ErrorUtilModule.CustomError(err, undefined);
            next(error);
        }
    });
}
exports.render = render;
/**
 * 購入者情報入力完了
 * @memberof Purchase.InputModule
 * @function purchaserInformationRegistration
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
function purchaserInformationRegistration(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.session === undefined) {
            next(new ErrorUtilModule.CustomError(ErrorUtilModule.ErrorType.Property, undefined));
            return;
        }
        const authModel = new AuthModel_1.AuthModel(req.session.auth);
        const options = {
            endpoint: process.env.SSKTS_API_ENDPOINT,
            auth: authModel.create()
        };
        const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
        try {
            if (req.session.purchase === undefined)
                throw ErrorUtilModule.ErrorType.Expire;
            if (purchaseModel.isExpired())
                throw ErrorUtilModule.ErrorType.Expire;
            if (purchaseModel.transaction === null)
                throw ErrorUtilModule.ErrorType.Property;
            if (purchaseModel.reserveTickets === null)
                throw ErrorUtilModule.ErrorType.Property;
            //取引id確認
            if (req.body.transactionId !== purchaseModel.transaction.id) {
                throw ErrorUtilModule.ErrorType.Access;
            }
            //バリデーション
            InputForm_1.default(req);
            const validationResult = yield req.getValidationResult();
            if (!validationResult.isEmpty()) {
                purchaseModel.profile = req.body;
                res.locals.error = validationResult.mapped();
                res.locals.gmoError = null;
                res.locals.GMO_ENDPOINT = process.env.GMO_ENDPOINT;
                res.locals.purchaseModel = purchaseModel;
                res.locals.step = PurchaseModel_1.PurchaseModel.INPUT_STATE;
                res.render('purchase/input', { layout: 'layouts/purchase/layout' });
                return;
            }
            // 入力情報をセッションへ
            purchaseModel.profile = {
                familyName: req.body.familyName,
                givenName: req.body.givenName,
                email: req.body.email,
                emailConfirm: req.body.emailConfirm,
                telephone: req.body.telephone
            };
            // クレジットカード処理
            yield creditCardProsess(req, purchaseModel);
            yield sasaki.service.transaction.placeOrder(options).setCustomerContact({
                transactionId: purchaseModel.transaction.id,
                contact: {
                    familyName: purchaseModel.profile.familyName,
                    givenName: purchaseModel.profile.givenName,
                    email: purchaseModel.profile.email,
                    telephone: purchaseModel.profile.telephone
                }
            });
            log('SSKTS購入者情報登録');
            // セッション更新
            purchaseModel.save(req.session);
            // 購入者内容確認へ
            res.redirect('/purchase/confirm');
        }
        catch (err) {
            if (err === ErrorUtilModule.ErrorType.Validation) {
                purchaseModel.profile = {
                    familyName: req.body.familyName,
                    givenName: req.body.givenName,
                    email: req.body.email,
                    emailConfirm: req.body.emailConfirm,
                    telephone: req.body.telephone
                };
                res.locals.error = { gmo: { parm: 'gmo', msg: req.__('common.error.gmo'), value: '' } };
                res.locals.GMO_ENDPOINT = process.env.GMO_ENDPOINT;
                res.locals.purchaseModel = purchaseModel;
                res.locals.step = PurchaseModel_1.PurchaseModel.INPUT_STATE;
                res.render('purchase/input', { layout: 'layouts/purchase/layout' });
                return;
            }
            const error = (err instanceof Error)
                ? new ErrorUtilModule.CustomError(ErrorUtilModule.ErrorType.ExternalModule, err.message)
                : new ErrorUtilModule.CustomError(err, undefined);
            next(error);
        }
    });
}
exports.purchaserInformationRegistration = purchaserInformationRegistration;
/**
 * 購入者情報入力完了(会員)
 * @memberof Purchase.InputModule
 * @function purchaserInformationRegistrationOfMember
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
function purchaserInformationRegistrationOfMember(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.session === undefined) {
            next(new ErrorUtilModule.CustomError(ErrorUtilModule.ErrorType.Property, undefined));
            return;
        }
        const authModel = new AuthModel_1.AuthModel(req.session.auth);
        const options = {
            endpoint: process.env.SSKTS_API_ENDPOINT,
            auth: authModel.create()
        };
        const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
        try {
            if (!authModel.isMember())
                throw ErrorUtilModule.ErrorType.Access;
            if (req.session.purchase === undefined)
                throw ErrorUtilModule.ErrorType.Expire;
            if (purchaseModel.isExpired())
                throw ErrorUtilModule.ErrorType.Expire;
            if (purchaseModel.transaction === null)
                throw ErrorUtilModule.ErrorType.Property;
            if (purchaseModel.reserveTickets === null)
                throw ErrorUtilModule.ErrorType.Property;
            if (purchaseModel.profile === null)
                throw ErrorUtilModule.ErrorType.Property;
            //取引id確認
            if (req.body.transactionId !== purchaseModel.transaction.id) {
                throw ErrorUtilModule.ErrorType.Access;
            }
            //バリデーション
            InputForm_1.default(req);
            const validationResult = yield req.getValidationResult();
            if (!validationResult.isEmpty()) {
                res.locals.error = validationResult.mapped();
                res.locals.gmoError = null;
                res.locals.GMO_ENDPOINT = process.env.GMO_ENDPOINT;
                res.locals.purchaseModel = purchaseModel;
                res.locals.step = PurchaseModel_1.PurchaseModel.INPUT_STATE;
                res.render('purchase/member/input', { layout: 'layouts/purchase/layout' });
                return;
            }
            const creditCardRegistration = req.body.creditCardRegistration;
            if (creditCardRegistration !== undefined && creditCardRegistration) {
                if (purchaseModel.creditCards.length > 0) {
                    // クレジットカード削除
                    yield sasaki.service.person(options).deleteCreditCard({
                        personId: 'me',
                        cardSeq: purchaseModel.creditCards[0].cardSeq
                    });
                }
                purchaseModel.gmo = JSON.parse(req.body.gmoTokenObject);
                // クレジットカード登録
                const card = yield sasaki.service.person(options).addCreditCard({
                    personId: 'me',
                    creditCard: {
                        token: purchaseModel.gmo.token
                    }
                });
                purchaseModel.creditCards.push(card);
                log('クレジットカード登録');
            }
            // クレジットカード処理
            yield creditCardProsess(req, purchaseModel);
            yield sasaki.service.transaction.placeOrder(options).setCustomerContact({
                transactionId: purchaseModel.transaction.id,
                contact: {
                    familyName: purchaseModel.profile.familyName,
                    givenName: purchaseModel.profile.givenName,
                    email: purchaseModel.profile.email,
                    telephone: purchaseModel.profile.telephone
                }
            });
            log('SSKTS購入者情報登録');
            // セッション更新
            purchaseModel.save(req.session);
            // 購入者内容確認へ
            res.redirect('/purchase/confirm');
        }
        catch (err) {
            if (err === ErrorUtilModule.ErrorType.Validation) {
                res.locals.error = { gmo: { parm: 'gmo', msg: req.__('common.error.gmo'), value: '' } };
                res.locals.GMO_ENDPOINT = process.env.GMO_ENDPOINT;
                res.locals.purchaseModel = purchaseModel;
                res.locals.step = PurchaseModel_1.PurchaseModel.INPUT_STATE;
                res.render('purchase/member/input', { layout: 'layouts/purchase/layout' });
                return;
            }
            const error = (err instanceof Error)
                ? new ErrorUtilModule.CustomError(ErrorUtilModule.ErrorType.ExternalModule, err.message)
                : new ErrorUtilModule.CustomError(err, undefined);
            next(error);
        }
    });
}
exports.purchaserInformationRegistrationOfMember = purchaserInformationRegistrationOfMember;
/**
 * クレジットカード処理
 * @function creditCardProsess
 * @param {Request} req
 * @param {PurchaseModel} purchaseModel
 */
function creditCardProsess(req, purchaseModel) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.session === undefined)
            throw ErrorUtilModule.ErrorType.Property;
        const authModel = new AuthModel_1.AuthModel(req.session.auth);
        const options = {
            endpoint: process.env.SSKTS_API_ENDPOINT,
            auth: authModel.create()
        };
        if (purchaseModel.transaction === null)
            throw ErrorUtilModule.ErrorType.Property;
        if (purchaseModel.creditCardAuthorization !== null) {
            const cancelCreditCardAuthorizationArgs = {
                transactionId: purchaseModel.transaction.id,
                authorizationId: purchaseModel.creditCardAuthorization.id
            };
            try {
                yield sasaki.service.transaction.placeOrder(options).cancelCreditCardAuthorization(cancelCreditCardAuthorizationArgs);
            }
            catch (err) {
                logger_1.default.error('SSKTS-APP:InputModule.submit cancelCreditCardAuthorization', `in: ${cancelCreditCardAuthorizationArgs}`, `err: ${err}`);
                throw ErrorUtilModule.ErrorType.Validation;
            }
            log('GMOオーソリ削除');
        }
        if (purchaseModel.getReserveAmount() > 0) {
            // クレジット決済
            purchaseModel.createOrderId();
            purchaseModel.save(req.session);
            let creditCard;
            if (purchaseModel.creditCards.length > 0) {
                // 登録されたクレジットカード
                if (purchaseModel.creditCards.length === 0)
                    throw ErrorUtilModule.ErrorType.Property;
                creditCard = {
                    memberId: 'me',
                    cardSeq: Number(purchaseModel.creditCards[0].cardSeq)
                };
            }
            else {
                // 入力されたクレジットカード
                purchaseModel.gmo = JSON.parse(req.body.gmoTokenObject);
                creditCard = {
                    token: purchaseModel.gmo.token
                };
            }
            const createCreditCardAuthorizationArgs = {
                transactionId: purchaseModel.transaction.id,
                orderId: purchaseModel.orderId,
                amount: purchaseModel.getReserveAmount(),
                method: GMO.utils.util.Method.Lump,
                creditCard: creditCard
            };
            try {
                purchaseModel.creditCardAuthorization = yield sasaki.service.transaction.placeOrder(options)
                    .createCreditCardAuthorization(createCreditCardAuthorizationArgs);
            }
            catch (err) {
                log(createCreditCardAuthorizationArgs);
                logger_1.default.error('SSKTS-APP:InputModule.submit createCreditCardAuthorization', `in: ${createCreditCardAuthorizationArgs}`, `err: ${err}`);
                throw ErrorUtilModule.ErrorType.Validation;
            }
            log('GMOオーソリ追加');
        }
    });
}
