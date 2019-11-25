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
const mvtkReserve = require("@motionpicture/mvtk-reserve-service");
const sasaki = require("@motionpicture/sskts-api-nodejs-client");
const debug = require("debug");
const HTTPStatus = require("http-status");
const functions_1 = require("../../functions");
const logger_1 = require("../../middlewares/logger");
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
        if (seatInfoSyncIn === undefined)
            throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
        let seatInfoSyncInResult;
        try {
            seatInfoSyncInResult = yield mvtkReserve.services.seat.seatInfoSync.seatInfoSync(seatInfoSyncIn);
            if (seatInfoSyncInResult.zskyykResult !== mvtkReserve.services.seat.seatInfoSync.ReservationResult.Success) {
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.ExternalModule, 'reservationResult is not success');
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
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
            const purchaseModel = new models_1.PurchaseModel(req.session.purchase);
            // 購入管理番号情報
            const seatInfoSyncIn = purchaseModel.getMvtkSeatInfoSync({
                deleteFlag: mvtkReserve.services.seat.seatInfoSync.DeleteFlag.True
            });
            //セッション削除
            delete req.session.purchase;
            delete req.session.mvtk;
            if (seatInfoSyncIn === undefined)
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
            try {
                const seatInfoSyncInResult = yield mvtkReserve.services.seat.seatInfoSync.seatInfoSync(seatInfoSyncIn);
                if (seatInfoSyncInResult.zskyykResult !== mvtkReserve.services.seat.seatInfoSync.ReservationResult.CancelSuccess) {
                    throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.ExternalModule, 'reservationResult is not cancelSuccess');
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
            if (purchaseModel.transaction === undefined
                || req.body.transactionId !== purchaseModel.transaction.id) {
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
            // ムビチケ使用
            if (purchaseModel.mvtk !== undefined && mvtkTickets.length > 0) {
                purchaseResult.mvtk = yield reserveMvtk(purchaseModel);
                log('Mvtk payment');
            }
            purchaseResult.order = yield new sasaki.service.transaction.PlaceOrder(options).confirm({
                id: purchaseModel.transaction.id,
                options: {
                    sendEmailMessage: false
                }
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
