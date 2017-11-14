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
const HTTPStatus = require("http-status");
const InputForm_1 = require("../../forms/Purchase/InputForm");
const AuthModel_1 = require("../../models/Auth/AuthModel");
const PurchaseModel_1 = require("../../models/Purchase/PurchaseModel");
const AwsCognitoService = require("../../service/AwsCognitoService");
const ErrorUtilModule_1 = require("../Util/ErrorUtilModule");
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
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
            const authModel = new AuthModel_1.AuthModel(req.session.auth);
            if (purchaseModel.isExpired())
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Expire);
            if (!purchaseModel.accessAuth(PurchaseModel_1.PurchaseModel.INPUT_STATE)) {
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Access);
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
                // Cognitoから参照
                const awsCognitoIdentityId = req.session.awsCognitoIdentityId;
                if (awsCognitoIdentityId !== undefined) {
                    const cognitoCredentials = AwsCognitoService.authenticateWithTerminal(awsCognitoIdentityId);
                    try {
                        const profileRecord = yield AwsCognitoService.getRecords({
                            datasetName: 'profile',
                            credentials: cognitoCredentials
                        });
                        purchaseModel.profile = {
                            familyName: (profileRecord.familyName !== undefined) ? profileRecord.familyName : '',
                            givenName: (profileRecord.givenName !== undefined) ? profileRecord.givenName : '',
                            email: (profileRecord.email !== undefined) ? profileRecord.email : '',
                            emailConfirm: (profileRecord.email !== undefined) ? profileRecord.email : '',
                            telephone: (profileRecord.telephone !== undefined) ? profileRecord.telephone : ''
                        };
                    }
                    catch (err) {
                        purchaseModel.profile = defaultProfile;
                        log('AwsCognitoService.getRecords', err);
                    }
                }
                else {
                    purchaseModel.profile = defaultProfile;
                }
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
            next(new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property));
            return;
        }
        const authModel = new AuthModel_1.AuthModel(req.session.auth);
        const options = {
            endpoint: process.env.SSKTS_API_ENDPOINT,
            auth: authModel.create()
        };
        const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
        try {
            if (purchaseModel.isExpired())
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Expire);
            if (purchaseModel.transaction === null
                || purchaseModel.reserveTickets === null)
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            //取引id確認
            if (req.body.transactionId !== purchaseModel.transaction.id) {
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
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
            try {
                yield creditCardProsess(req, purchaseModel, authModel);
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
                res.locals.step = PurchaseModel_1.PurchaseModel.INPUT_STATE;
                res.locals.gmoError = err.message;
                res.render('purchase/input', { layout: 'layouts/purchase/layout' });
                log('クレジットカード処理失敗', err);
                return;
            }
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
            // Cognitoへ登録
            const awsCognitoIdentityId = req.session.awsCognitoIdentityId;
            if (awsCognitoIdentityId !== undefined) {
                const cognitoCredentials = AwsCognitoService.authenticateWithTerminal(awsCognitoIdentityId);
                try {
                    yield AwsCognitoService.updateRecords({
                        datasetName: 'profile',
                        value: {
                            familyName: purchaseModel.profile.familyName,
                            givenName: purchaseModel.profile.givenName,
                            email: purchaseModel.profile.email,
                            telephone: purchaseModel.profile.telephone
                        },
                        credentials: cognitoCredentials
                    });
                }
                catch (err) {
                    log('AwsCognitoService.updateRecords', err);
                }
            }
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
function purchaserInformationRegistrationOfMember(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.session === undefined) {
            next(new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property));
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
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            if (purchaseModel.isExpired())
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Expire);
            if (purchaseModel.transaction === null
                || purchaseModel.reserveTickets === null
                || purchaseModel.profile === null)
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            //取引id確認
            if (req.body.transactionId !== purchaseModel.transaction.id) {
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
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
                    yield sasaki.service.person(options).deleteCreditCard({
                        personId: 'me',
                        cardSeq: purchaseModel.creditCards[0].cardSeq
                    });
                    log('クレジットカード削除');
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
                log('クレジットカード登録', purchaseModel.creditCards);
            }
            // クレジットカード処理
            try {
                yield creditCardProsess(req, purchaseModel, authModel);
                log('クレジットカード処理終了');
            }
            catch (err) {
                res.locals.error = { gmo: { parm: 'gmo', msg: req.__('common.error.gmo'), value: '' } };
                res.locals.GMO_ENDPOINT = process.env.GMO_ENDPOINT;
                res.locals.purchaseModel = purchaseModel;
                res.locals.step = PurchaseModel_1.PurchaseModel.INPUT_STATE;
                res.locals.gmoError = err.message;
                res.render('purchase/member/input', { layout: 'layouts/purchase/layout' });
                log('クレジットカード処理失敗', err);
                return;
            }
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
function creditCardProsess(req, purchaseModel, authModel) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = {
            endpoint: process.env.SSKTS_API_ENDPOINT,
            auth: authModel.create()
        };
        if (purchaseModel.transaction === null)
            throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
        if (purchaseModel.creditCardAuthorization !== null) {
            const cancelCreditCardAuthorizationArgs = {
                transactionId: purchaseModel.transaction.id,
                actionId: purchaseModel.creditCardAuthorization.id
            };
            purchaseModel.creditCardAuthorization = null;
            purchaseModel.gmo = null;
            purchaseModel.save(req.session);
            yield sasaki.service.transaction.placeOrder(options).cancelCreditCardAuthorization(cancelCreditCardAuthorizationArgs);
            log('GMOオーソリ削除');
        }
        if (purchaseModel.getReserveAmount() > 0) {
            // クレジット決済
            purchaseModel.createOrderId();
            purchaseModel.save(req.session);
            let creditCard;
            if (purchaseModel.creditCards.length > 0) {
                // 登録されたクレジットカード
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
            purchaseModel.creditCardAuthorization = yield sasaki.service.transaction.placeOrder(options)
                .createCreditCardAuthorization(createCreditCardAuthorizationArgs);
            log('GMOオーソリ追加');
        }
    });
}
