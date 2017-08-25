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
const ssktsApi = require("@motionpicture/sasaki-api-nodejs");
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
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
function index(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.session === undefined)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (req.session.purchase === undefined)
                throw ErrorUtilModule.ERROR_EXPIRE;
            const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
            if (purchaseModel.isExpired())
                throw ErrorUtilModule.ERROR_EXPIRE;
            if (!purchaseModel.accessAuth(PurchaseModel_1.PurchaseModel.INPUT_STATE)) {
                throw ErrorUtilModule.ERROR_EXPIRE;
            }
            if (purchaseModel.transaction === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            //購入者情報入力表示
            if (purchaseModel.isMember()) {
                log('会員情報取得');
                purchaseModel.profile = {
                    familyName: '',
                    givenName: '',
                    email: '',
                    emailConfirm: '',
                    telephone: ''
                };
            }
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
            res.locals.error = null;
            res.locals.gmoError = null;
            res.locals.GMO_ENDPOINT = process.env.GMO_ENDPOINT;
            res.locals.purchaseModel = purchaseModel;
            res.locals.step = PurchaseModel_1.PurchaseModel.INPUT_STATE;
            res.render('purchase/input', { layout: 'layouts/purchase/layout' });
            return;
        }
        catch (err) {
            const error = (err instanceof Error)
                ? new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message)
                : new ErrorUtilModule.CustomError(err, undefined);
            next(error);
            return;
        }
    });
}
exports.index = index;
/**
 * 購入者情報入力完了
 * @memberof Purchase.InputModule
 * @function submit
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
// tslint:disable-next-line:max-func-body-length
// tslint:disable-next-line:cyclomatic-complexity
function submit(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.session === undefined) {
            next(new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_PROPERTY, undefined));
            return;
        }
        try {
            const authModel = new AuthModel_1.AuthModel(req.session.auth);
            const options = {
                endpoint: process.env.SSKTS_API_ENDPOINT,
                auth: authModel.create()
            };
            if (req.session.purchase === undefined)
                throw ErrorUtilModule.ERROR_EXPIRE;
            const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
            if (purchaseModel.isExpired())
                throw ErrorUtilModule.ERROR_EXPIRE;
            if (purchaseModel.transaction === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (purchaseModel.reserveTickets === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            //取引id確認
            if (req.body.transactionId !== purchaseModel.transaction.id) {
                throw ErrorUtilModule.ERROR_ACCESS;
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
            if (purchaseModel.creditCardAuthorization !== null) {
                const cancelCreditCardAuthorizationArgs = {
                    transactionId: purchaseModel.transaction.id,
                    authorizationId: purchaseModel.creditCardAuthorization.id
                };
                try {
                    yield ssktsApi.service.transaction.placeOrder(options).cancelCreditCardAuthorization(cancelCreditCardAuthorizationArgs);
                }
                catch (err) {
                    logger_1.default.error('SSKTS-APP:InputModule.submit cancelCreditCardAuthorization', `in: ${cancelCreditCardAuthorizationArgs}`, `err: ${err}`);
                    throw ErrorUtilModule.ERROR_VALIDATION;
                }
                log('GMOオーソリ削除');
            }
            if (purchaseModel.getReserveAmount() > 0) {
                // クレジット決済
                res.locals.gmoError = null;
                purchaseModel.gmo = JSON.parse(req.body.gmoTokenObject);
                purchaseModel.createOrderId();
                purchaseModel.save(req.session);
                const createCreditCardAuthorizationArgs = {
                    transactionId: purchaseModel.transaction.id,
                    orderId: purchaseModel.orderId,
                    amount: purchaseModel.getReserveAmount(),
                    method: GMO.utils.util.Method.Lump,
                    creditCard: {
                        token: purchaseModel.gmo.token
                    }
                };
                try {
                    yield ssktsApi.service.transaction.placeOrder(options).createCreditCardAuthorization(createCreditCardAuthorizationArgs);
                }
                catch (err) {
                    log(createCreditCardAuthorizationArgs);
                    logger_1.default.error('SSKTS-APP:InputModule.submit createCreditCardAuthorization', `in: ${createCreditCardAuthorizationArgs}`, `err: ${err}`);
                    throw ErrorUtilModule.ERROR_VALIDATION;
                }
                log('CMOオーソリ追加');
            }
            yield ssktsApi.service.transaction.placeOrder(options).setCustomerContact({
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
            if (err === ErrorUtilModule.ERROR_VALIDATION) {
                const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
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
                ? new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message)
                : new ErrorUtilModule.CustomError(err, undefined);
            next(error);
        }
    });
}
exports.submit = submit;
