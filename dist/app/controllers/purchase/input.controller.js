"use strict";
/**
 * 購入情報入力
 * @namespace Purchase.InputModule
 */
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
const cinerinoService = require("@cinerino/sdk");
const GMO = require("@motionpicture/gmo-service");
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
// tslint:disable-next-line:max-func-body-length
function render(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.session === undefined)
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
            const purchaseModel = new models_1.PurchaseModel(req.session.purchase);
            if (purchaseModel.isExpired())
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Expire);
            if (!purchaseModel.accessAuth(models_1.PurchaseModel.INPUT_STATE)) {
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Access);
            }
            if (purchaseModel.seller === undefined || purchaseModel.seller.id === undefined) {
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
            }
            //購入者情報入力表示
            if (purchaseModel.profile !== undefined) {
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
            const products = yield searchProduct(req, {
                typeOf: {
                    $eq: cinerinoService.factory.service.paymentService.PaymentServiceType
                        .CreditCard
                }
            });
            const paymentServices = [];
            products.forEach((p) => {
                if (p.typeOf !==
                    cinerinoService.factory.service.paymentService.PaymentServiceType
                        .CreditCard ||
                    p.provider === undefined) {
                    return;
                }
                const findResult = p.provider.find((provider) => purchaseModel.seller !== undefined && provider.id === purchaseModel.seller.id);
                if (findResult === undefined) {
                    return;
                }
                paymentServices.push(p);
            });
            const paymentService = paymentServices[0];
            const providerCredentials = yield getProviderCredentials({
                paymentService,
                seller: purchaseModel.seller
            });
            purchaseModel.providerCredentials = providerCredentials;
            purchaseModel.save(req.session);
            if (purchaseModel.providerCredentials === undefined ||
                purchaseModel.providerCredentials.shopId === undefined) {
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
            }
            res.locals.error = undefined;
            res.locals.gmoError = undefined;
            res.locals.GMO_ENDPOINT = process.env.GMO_ENDPOINT;
            res.locals.purchaseModel = purchaseModel;
            res.locals.shopId = purchaseModel.providerCredentials.shopId;
            res.locals.step = models_1.PurchaseModel.INPUT_STATE;
            res.render('purchase/input', { layout: 'layouts/purchase/layout' });
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
            if (purchaseModel.transaction === undefined ||
                purchaseModel.seller === undefined ||
                purchaseModel.seller.paymentAccepted === undefined ||
                purchaseModel.reserveTickets === undefined ||
                req.body.transactionId !== purchaseModel.transaction.id ||
                purchaseModel.providerCredentials === undefined ||
                purchaseModel.providerCredentials.shopId === undefined) {
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
            }
            // バリデーション
            forms_1.purchaseInputForm(req);
            const validationResult = yield req.getValidationResult();
            if (!validationResult.isEmpty()) {
                purchaseModel.profile = req.body;
                res.locals.error = validationResult.mapped();
                res.locals.gmoError = undefined;
                res.locals.GMO_ENDPOINT = process.env.GMO_ENDPOINT;
                res.locals.shopId = purchaseModel.providerCredentials.shopId;
                res.locals.purchaseModel = purchaseModel;
                res.locals.step = models_1.PurchaseModel.INPUT_STATE;
                res.render('purchase/input', { layout: 'layouts/purchase/layout' });
                log('入力バリデーション');
                return;
            }
            const phoneUtil = google_libphonenumber_1.PhoneNumberUtil.getInstance();
            const phoneNumber = phoneUtil.parse(req.body.telephone, 'JP'); // 日本以外は非対応
            if (!phoneUtil.isValidNumber(phoneNumber)) {
                purchaseModel.profile = req.body;
                res.locals.error = {
                    telephone: { parm: 'telephone', msg: `${req.__('common.tel_num')}${req.__('common.validation.is_tel')}`, value: '' }
                };
                res.locals.gmoError = undefined;
                res.locals.GMO_ENDPOINT = process.env.GMO_ENDPOINT;
                res.locals.shopId = purchaseModel.providerCredentials.shopId;
                res.locals.purchaseModel = purchaseModel;
                res.locals.step = models_1.PurchaseModel.INPUT_STATE;
                res.render('purchase/input', { layout: 'layouts/purchase/layout' });
                log('電話番号バリデーション');
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
                res.locals.shopId = purchaseModel.providerCredentials.shopId;
                res.locals.purchaseModel = purchaseModel;
                res.locals.step = models_1.PurchaseModel.INPUT_STATE;
                res.locals.gmoError = err.message;
                res.render('purchase/input', { layout: 'layouts/purchase/layout' });
                log('クレジットカード処理失敗', err);
                return;
            }
            yield new cinerinoService.service.transaction.PlaceOrder4sskts(options).setProfile({
                id: purchaseModel.transaction.id,
                agent: {
                    familyName: purchaseModel.profile.familyName,
                    givenName: purchaseModel.profile.givenName,
                    email: purchaseModel.profile.email,
                    telephone: functions_1.formatTelephone(purchaseModel.profile.telephone)
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
 * クレジットカード処理
 * @function creditCardProsess
 * @param {Request} req
 * @param {Response} res
 * @param {PurchaseModel} purchaseModel
 */
function creditCardProsess(req, purchaseModel) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = functions_1.getApiOption(req);
        const { seller } = purchaseModel;
        if (purchaseModel.transaction === undefined ||
            seller === undefined ||
            seller.id === undefined) {
            throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
        }
        if (purchaseModel.creditCardAuthorization !== undefined) {
            yield new cinerinoService.service.Payment(options).voidTransaction({
                id: purchaseModel.creditCardAuthorization.id,
                object: {
                    typeOf: cinerinoService.factory.service.paymentService.PaymentServiceType.CreditCard
                },
                purpose: {
                    id: purchaseModel.transaction.id,
                    typeOf: purchaseModel.transaction.typeOf
                }
            });
            purchaseModel.creditCardAuthorization = undefined;
            purchaseModel.gmo = undefined;
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
            const paymentServices = (yield new cinerinoService.service.Product(options).search({
                typeOf: {
                    $eq: cinerinoService.factory.service.paymentService.PaymentServiceType
                        .CreditCard
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
            purchaseModel.creditCardAuthorization = yield new cinerinoService.service.Payment(options).authorizeCreditCard({
                object: {
                    typeOf: cinerinoService.factory.action.authorize.paymentMethod.any.ResultType.Payment,
                    amount: purchaseModel.getReserveAmount(),
                    method: GMO.utils.util.Method.Lump,
                    creditCard,
                    paymentMethod: paymentService.serviceType.codeValue,
                    issuedThrough: {
                        id: paymentService.id
                    }
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
/**
 * プロバイダーの資格情報取得
 */
function getProviderCredentials(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { paymentService, seller } = params;
        if (paymentService.provider === undefined) {
            throw new Error('paymentService.provider undefined');
        }
        const findResult = paymentService.provider.find((provider) => provider.id === seller.id);
        if (findResult === undefined) {
            throw new Error('findResult undefined');
        }
        const credentials = findResult.credentials;
        let tokenizationCode;
        if (credentials !== undefined) {
            tokenizationCode = credentials.tokenizationCode;
        }
        return Object.assign(Object.assign({}, credentials), { tokenizationCode: typeof tokenizationCode === 'string' && tokenizationCode.length > 0
                ? tokenizationCode
                : undefined });
    });
}
/**
 * プロダクト検索
 */
function searchProduct(req, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const limit = 100;
        let page = 1;
        let roop = true;
        let result = [];
        const options = functions_1.getApiOption(req);
        while (roop) {
            const searchResult = yield new cinerinoService.service.Product(options).search(Object.assign({ page,
                limit }, params));
            result = [...result, ...searchResult.data];
            page = page + 1;
            roop = searchResult.data.length === limit;
            if (roop) {
                const time = 500;
                yield functions_1.sleep(time);
            }
        }
        return result;
    });
}
