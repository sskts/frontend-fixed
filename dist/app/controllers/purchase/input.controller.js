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
const sasaki = require("@motionpicture/sskts-api-nodejs-client");
const debug = require("debug");
const google_libphonenumber_1 = require("google-libphonenumber");
const HTTPStatus = require("http-status");
const functions_1 = require("../../functions");
const forms_1 = require("../../functions/forms");
const models_1 = require("../../models");
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
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
            const purchaseModel = new models_1.PurchaseModel(req.session.purchase);
            const authModel = new models_1.AuthModel(req.session.auth);
            if (purchaseModel.isExpired())
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Expire);
            if (!purchaseModel.accessAuth(models_1.PurchaseModel.INPUT_STATE)) {
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Access);
            }
            //購入者情報入力表示
            if (purchaseModel.profile !== null) {
                res.locals.input = purchaseModel.profile;
            }
            else {
                const defaultProfile = {
                    familyName: '',
                    givenName: '',
                    email: '',
                    emailConfirm: '',
                    telephone: ''
                };
                purchaseModel.profile = defaultProfile;
            }
            purchaseModel.save(req.session);
            res.locals.error = null;
            res.locals.gmoError = null;
            res.locals.GMO_ENDPOINT = process.env.GMO_ENDPOINT;
            res.locals.purchaseModel = purchaseModel;
            res.locals.step = models_1.PurchaseModel.INPUT_STATE;
            if (authModel.isMember()) {
                res.render('purchase/member/input', { layout: 'layouts/purchase/layout' });
            }
            else {
                res.render('purchase/input', { layout: 'layouts/purchase/layout' });
            }
        }
        catch (err) {
            next(err);
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
// tslint:disable-next-line:max-func-body-length
function purchaserInformationRegistration(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.session === undefined) {
            next(new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property));
            return;
        }
        const options = functions_1.getApiOption(req);
        const purchaseModel = new models_1.PurchaseModel(req.session.purchase);
        try {
            if (purchaseModel.isExpired())
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Expire);
            if (purchaseModel.transaction === null
                || purchaseModel.reserveTickets === null)
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
            //取引id確認
            if (req.body.transactionId !== purchaseModel.transaction.id) {
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
            }
            //バリデーション
            forms_1.purchaseInputForm(req);
            const validationResult = yield req.getValidationResult();
            if (!validationResult.isEmpty()) {
                purchaseModel.profile = req.body;
                res.locals.error = validationResult.mapped();
                res.locals.gmoError = null;
                res.locals.GMO_ENDPOINT = process.env.GMO_ENDPOINT;
                res.locals.purchaseModel = purchaseModel;
                res.locals.step = models_1.PurchaseModel.INPUT_STATE;
                res.render('purchase/input', { layout: 'layouts/purchase/layout' });
                return;
            }
            const phoneUtil = google_libphonenumber_1.PhoneNumberUtil.getInstance();
            const phoneNumber = phoneUtil.parse(req.body.telephone, 'JP'); // 日本以外は非対応
            if (!phoneUtil.isValidNumber(phoneNumber)) {
                purchaseModel.profile = req.body;
                res.locals.error = {
                    telephone: { parm: 'telephone', msg: `${req.__('common.tel_num')}${req.__('common.validation.is_tel')}`, value: '' }
                };
                res.locals.gmoError = null;
                res.locals.GMO_ENDPOINT = process.env.GMO_ENDPOINT;
                res.locals.purchaseModel = purchaseModel;
                res.locals.step = models_1.PurchaseModel.INPUT_STATE;
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
            try {
                yield creditCardProsess(req, purchaseModel);
                log('クレジットカード処理終了');
            }
            catch (err) {
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
                res.locals.step = models_1.PurchaseModel.INPUT_STATE;
                res.locals.gmoError = err.message;
                res.render('purchase/input', { layout: 'layouts/purchase/layout' });
                log('クレジットカード処理失敗', err);
                return;
            }
            yield new sasaki.service.transaction.PlaceOrder(options).setCustomerContact({
                id: purchaseModel.transaction.id,
                object: {
                    customerContact: {
                        familyName: purchaseModel.profile.familyName,
                        givenName: purchaseModel.profile.givenName,
                        email: purchaseModel.profile.email,
                        telephone: purchaseModel.profile.telephone
                    }
                }
            });
            log('SSKTS購入者情報登録');
            // セッション更新
            purchaseModel.save(req.session);
            // 購入者内容確認へ
            res.redirect('/purchase/confirm');
        }
        catch (err) {
            next(err);
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
// tslint:disable-next-line:max-func-body-length
function purchaserInformationRegistrationOfMember(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.session === undefined) {
            next(new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property));
            return;
        }
        const authModel = new models_1.AuthModel(req.session.auth);
        const options = functions_1.getApiOption(req);
        const purchaseModel = new models_1.PurchaseModel(req.session.purchase);
        try {
            if (!authModel.isMember())
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
            if (purchaseModel.isExpired())
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Expire);
            if (purchaseModel.transaction === null
                || purchaseModel.reserveTickets === null
                || purchaseModel.profile === null)
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
            //取引id確認
            if (req.body.transactionId !== purchaseModel.transaction.id) {
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
            }
            //バリデーション
            forms_1.purchaseInputForm(req);
            const validationResult = yield req.getValidationResult();
            if (!validationResult.isEmpty()) {
                res.locals.error = validationResult.mapped();
                res.locals.gmoError = null;
                res.locals.GMO_ENDPOINT = process.env.GMO_ENDPOINT;
                res.locals.purchaseModel = purchaseModel;
                res.locals.step = models_1.PurchaseModel.INPUT_STATE;
                res.render('purchase/member/input', { layout: 'layouts/purchase/layout' });
                return;
            }
            const phoneUtil = google_libphonenumber_1.PhoneNumberUtil.getInstance();
            const phoneNumber = phoneUtil.parse(req.body.telephone, 'JP'); // 日本以外は非対応
            if (!phoneUtil.isValidNumber(phoneNumber)) {
                purchaseModel.profile = req.body;
                res.locals.error = {
                    telephone: { parm: 'telephone', msg: `${req.__('common.tel_num')}${req.__('common.validation.is_tel')}`, value: '' }
                };
                res.locals.gmoError = null;
                res.locals.GMO_ENDPOINT = process.env.GMO_ENDPOINT;
                res.locals.purchaseModel = purchaseModel;
                res.locals.step = models_1.PurchaseModel.INPUT_STATE;
                res.render('purchase/member/input', { layout: 'layouts/purchase/layout' });
                return;
            }
            // クレジットカード処理
            try {
                yield creditCardProsess(req, purchaseModel);
                log('クレジットカード処理終了');
            }
            catch (err) {
                res.locals.error = { gmo: { parm: 'gmo', msg: req.__('common.error.gmo'), value: '' } };
                res.locals.GMO_ENDPOINT = process.env.GMO_ENDPOINT;
                res.locals.purchaseModel = purchaseModel;
                res.locals.step = models_1.PurchaseModel.INPUT_STATE;
                res.locals.gmoError = err.message;
                res.render('purchase/member/input', { layout: 'layouts/purchase/layout' });
                log('クレジットカード処理失敗', err);
                return;
            }
            yield new sasaki.service.transaction.PlaceOrder(options).setCustomerContact({
                id: purchaseModel.transaction.id,
                object: {
                    customerContact: {
                        familyName: purchaseModel.profile.familyName,
                        givenName: purchaseModel.profile.givenName,
                        email: purchaseModel.profile.email,
                        telephone: purchaseModel.profile.telephone
                    }
                }
            });
            log('SSKTS購入者情報登録');
            // セッション更新
            purchaseModel.save(req.session);
            // 購入者内容確認へ
            res.redirect('/purchase/confirm');
        }
        catch (err) {
            next(err);
        }
    });
}
exports.purchaserInformationRegistrationOfMember = purchaserInformationRegistrationOfMember;
/**
 * クレジットカード処理
 * @function creditCardProsess
 * @param {Request} req
 * @param {Response} res
 * @param {PurchaseModel} purchaseModel
 */
function creditCardProsess(req, purchaseModel) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = functions_1.getApiOption(req);
        if (purchaseModel.transaction === null)
            throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
        if (purchaseModel.creditCardAuthorization !== null) {
            yield new sasaki.service.Payment(options).voidTransaction({
                id: purchaseModel.creditCardAuthorization.id,
                object: {
                    typeOf: sasaki.factory.paymentMethodType.CreditCard
                },
                purpose: {
                    id: purchaseModel.transaction.id,
                    typeOf: purchaseModel.transaction.typeOf
                }
            });
            purchaseModel.creditCardAuthorization = null;
            purchaseModel.gmo = null;
            purchaseModel.save(req.session);
            log('GMOオーソリ削除');
        }
        if (purchaseModel.getReserveAmount() > 0) {
            // クレジット決済
            purchaseModel.save(req.session);
            purchaseModel.gmo = JSON.parse(req.body.gmoTokenObject);
            const creditCard = {
                token: purchaseModel.gmo.token
            };
            purchaseModel.creditCardAuthorization = yield new sasaki.service.Payment(options).authorizeCreditCard({
                object: {
                    typeOf: sasaki.factory.paymentMethodType.CreditCard,
                    amount: purchaseModel.getReserveAmount(),
                    method: GMO.utils.util.Method.Lump,
                    creditCard
                },
                purpose: {
                    id: purchaseModel.transaction.id,
                    typeOf: purchaseModel.transaction.typeOf
                }
            });
            log('GMOオーソリ追加');
        }
    });
}
