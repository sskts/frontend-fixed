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
 * 購入確認
 * @namespace Purchase.ConfirmModule
 */
const mvtkReserve = require("@motionpicture/mvtk-reserve-service");
const sasaki = require("@motionpicture/sskts-api-nodejs-client");
const debug = require("debug");
const HTTPStatus = require("http-status");
const moment = require("moment");
const logger_1 = require("../../middlewares/logger");
const AuthModel_1 = require("../../models/Auth/AuthModel");
const PurchaseModel_1 = require("../../models/Purchase/PurchaseModel");
const AwsCognitoService = require("../../service/AwsCognitoService");
const ErrorUtilModule_1 = require("../Util/ErrorUtilModule");
const UtilModule = require("../Util/UtilModule");
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
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
            if (purchaseModel.isExpired())
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Expire);
            if (!purchaseModel.accessAuth(PurchaseModel_1.PurchaseModel.CONFIRM_STATE)) {
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Access);
            }
            //購入者内容確認表示
            res.locals.updateReserve = null;
            res.locals.error = null;
            res.locals.purchaseModel = purchaseModel;
            res.locals.step = PurchaseModel_1.PurchaseModel.CONFIRM_STATE;
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
 * ムビチケ決済
 * @memberof Purchase.ConfirmModule
 * @function reserveMvtk
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {Promise<mvtkReserve.services.seat.seatInfoSync.ISeatInfoSyncResult>}
 */
function reserveMvtk(purchaseModel) {
    return __awaiter(this, void 0, void 0, function* () {
        // 購入管理番号情報
        const seatInfoSyncIn = purchaseModel.getMvtkSeatInfoSync();
        if (seatInfoSyncIn === null)
            throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
        let seatInfoSyncInResult;
        try {
            seatInfoSyncInResult = yield mvtkReserve.services.seat.seatInfoSync.seatInfoSync(seatInfoSyncIn);
            if (seatInfoSyncInResult.zskyykResult !== mvtkReserve.services.seat.seatInfoSync.ReservationResult.Success) {
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.ExternalModule, 'reservationResult is not success');
            }
        }
        catch (err) {
            log('Mvtk failure', err);
            logger_1.default.error('SSKTS-APP:ConfirmModule.reserveMvtk', seatInfoSyncIn, err);
            throw err;
        }
        log('Mvtk successful');
        // log('GMO', purchaseModel.getReserveAmount());
        // log('MVTK', purchaseModel.getMvtkPrice());
        // log('FULL', purchaseModel.getPrice());
        return seatInfoSyncInResult;
    });
}
/**
 * ムビチケ決済取り消し
 * @memberof Purchase.ConfirmModule
 * @function cancelMvtk
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
function cancelMvtk(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.session === undefined)
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
            // 購入管理番号情報
            const seatInfoSyncIn = purchaseModel.getMvtkSeatInfoSync({
                deleteFlag: mvtkReserve.services.seat.seatInfoSync.DeleteFlag.True
            });
            //セッション削除
            delete req.session.purchase;
            delete req.session.mvtk;
            if (seatInfoSyncIn === null)
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            try {
                const seatInfoSyncInResult = yield mvtkReserve.services.seat.seatInfoSync.seatInfoSync(seatInfoSyncIn);
                if (seatInfoSyncInResult.zskyykResult !== mvtkReserve.services.seat.seatInfoSync.ReservationResult.CancelSuccess) {
                    throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.ExternalModule, 'reservationResult is not cancelSuccess');
                }
                res.json({ isSuccess: true });
                log('Mvtk remove');
            }
            catch (err) {
                logger_1.default.error('SSKTS-APP:ConfirmModule.cancelMvtk', seatInfoSyncIn, err);
                throw err;
            }
        }
        catch (err) {
            res.json({ isSuccess: false });
        }
    });
}
exports.cancelMvtk = cancelMvtk;
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
            mvtk: null,
            order: null,
            mail: null,
            cognito: null,
            complete: null
        };
        try {
            if (req.session === undefined)
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            const authModel = new AuthModel_1.AuthModel(req.session.auth);
            const options = {
                endpoint: process.env.SSKTS_API_ENDPOINT,
                auth: authModel.create()
            };
            const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
            if (purchaseModel.transaction === null
                || req.body.transactionId !== purchaseModel.transaction.id) {
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            }
            //購入期限切れ
            if (purchaseModel.isExpired()) {
                delete req.session.purchase;
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Expire);
            }
            const mvtkTickets = purchaseModel.reserveTickets.filter((ticket) => {
                return (ticket.mvtkNum !== '');
            });
            // ムビチケ使用
            if (purchaseModel.mvtk !== null && mvtkTickets.length > 0) {
                purchaseResult.mvtk = yield reserveMvtk(purchaseModel);
                log('Mvtk payment');
            }
            purchaseResult.order = yield sasaki.service.transaction.placeOrder(options).confirm({
                transactionId: purchaseModel.transaction.id
            });
            log('Order confirmation');
            //購入情報をセッションへ
            const complete = {
                transaction: purchaseModel.transaction,
                individualScreeningEvent: purchaseModel.individualScreeningEvent,
                profile: purchaseModel.profile,
                seatReservationAuthorization: purchaseModel.seatReservationAuthorization,
                reserveTickets: purchaseModel.reserveTickets
            };
            req.session.complete = complete;
            purchaseResult.complete = complete;
            if (process.env.VIEW_TYPE !== UtilModule.VIEW.Fixed) {
                try {
                    purchaseResult.mail = yield sendMail(req, res, purchaseModel, authModel);
                    log('Mail notification');
                }
                catch (err) {
                    log('Mail registration failure', err);
                }
            }
            // Cognitoへ登録
            const awsCognitoIdentityId = req.session.awsCognitoIdentityId;
            if (awsCognitoIdentityId !== undefined) {
                const cognitoCredentials = AwsCognitoService.authenticateWithTerminal(awsCognitoIdentityId);
                try {
                    const reservationRecord = yield AwsCognitoService.getRecords({
                        datasetName: 'reservation',
                        credentials: cognitoCredentials
                    });
                    if (reservationRecord.orders === undefined) {
                        reservationRecord.orders = [];
                    }
                    reservationRecord.orders.push(purchaseResult.order);
                    log('before reservationRecord order', reservationRecord.orders.length);
                    reservationRecord.orders.forEach((order, index) => {
                        const endDate = moment(order.acceptedOffers[0].itemOffered.reservationFor.endDate).unix();
                        const limitDate = moment().subtract(1, 'day').unix();
                        if (endDate < limitDate)
                            reservationRecord.orders.splice(index, 1);
                    });
                    log('after reservationRecord order', reservationRecord.orders.length);
                    purchaseResult.cognito = yield AwsCognitoService.updateRecords({
                        datasetName: 'reservation',
                        value: reservationRecord,
                        credentials: cognitoCredentials
                    });
                }
                catch (err) {
                    log('AwsCognitoService.updateRecords', err);
                }
            }
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
 * メール送信
 * @function sendMail
 * @param {Request} req
 * @param {Response} res
 * @param {PurchaseModel} purchaseModel
 * @param {AuthModel} authModel
 */
function sendMail(req, res, purchaseModel, authModel) {
    return __awaiter(this, void 0, void 0, function* () {
        if (purchaseModel.transaction === null
            || purchaseModel.individualScreeningEvent === null
            || purchaseModel.profile === null
            || purchaseModel.seatReservationAuthorization === null
            || purchaseModel.seatReservationAuthorization.result === undefined) {
            throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
        }
        const options = {
            endpoint: process.env.SSKTS_API_ENDPOINT,
            auth: authModel.create()
        };
        const theater = yield sasaki.service.place(options).findMovieTheater({
            branchCode: purchaseModel.individualScreeningEvent.coaInfo.theaterCode
        });
        const content = yield UtilModule.getEmailTemplate(res, `email/complete/${req.__('lang')}`, {
            purchaseModel: purchaseModel,
            theater: theater,
            domain: req.headers.host,
            layout: false
        });
        log('Retrieve mail template');
        const sender = 'noreply@ticket-cinemasunshine.com';
        // tslint:disable-next-line:no-unnecessary-local-variable
        const sendEmailNotification = yield sasaki.service.transaction.placeOrder(options).sendEmailNotification({
            transactionId: purchaseModel.transaction.id,
            emailMessageAttributes: {
                sender: {
                    name: purchaseModel.transaction.seller.name,
                    email: sender
                },
                toRecipient: {
                    name: `${purchaseModel.profile.emailConfirm} ${purchaseModel.profile.givenName}`,
                    email: purchaseModel.profile.email
                },
                about: `${purchaseModel.individualScreeningEvent.superEvent.location.name.ja} 購入完了`,
                text: content
            }
        });
        return sendEmailNotification;
    });
}
/**
 * メール再送信
 * @memberof Purchase.resendMail
 * @function resendMail
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
function resendMail(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.session === undefined)
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            if (req.session.complete === undefined)
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Expire);
            const authModel = new AuthModel_1.AuthModel(req.session.auth);
            const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.complete);
            yield sendMail(req, res, purchaseModel, authModel);
            res.json();
        }
        catch (err) {
            log('resendMail error', err);
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
exports.resendMail = resendMail;
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
            throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
        if (req.session.complete === undefined)
            throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Expire);
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
