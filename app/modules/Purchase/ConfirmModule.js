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
const MVTK = require("@motionpicture/mvtk-service");
const sasaki = require("@motionpicture/sskts-api-nodejs-client");
const debug = require("debug");
const HTTPStatus = require("http-status");
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
 * @returns {Promise<void>}
 */
function reserveMvtk(purchaseModel) {
    return __awaiter(this, void 0, void 0, function* () {
        // 購入管理番号情報
        const mvtkSeatInfoSync = purchaseModel.getMvtkSeatInfoSync();
        log('購入管理番号情報', mvtkSeatInfoSync);
        if (mvtkSeatInfoSync === null)
            throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
        const seatInfoSyncService = MVTK.createSeatInfoSyncService();
        const seatInfoSyncIn = {
            kgygishCd: mvtkSeatInfoSync.kgygishCd,
            yykDvcTyp: mvtkSeatInfoSync.yykDvcTyp,
            trkshFlg: mvtkSeatInfoSync.trkshFlg,
            kgygishSstmZskyykNo: mvtkSeatInfoSync.kgygishSstmZskyykNo,
            kgygishUsrZskyykNo: mvtkSeatInfoSync.kgygishUsrZskyykNo,
            jeiDt: mvtkSeatInfoSync.jeiDt,
            kijYmd: mvtkSeatInfoSync.kijYmd,
            stCd: mvtkSeatInfoSync.stCd,
            screnCd: mvtkSeatInfoSync.screnCd,
            knyknrNoInfo: mvtkSeatInfoSync.knyknrNoInfo.map((knyknrNoInfo) => {
                return {
                    KNYKNR_NO: knyknrNoInfo.knyknrNo,
                    PIN_CD: knyknrNoInfo.pinCd,
                    KNSH_INFO: knyknrNoInfo.knshInfo.map((knshInfo) => {
                        return {
                            KNSH_TYP: knshInfo.knshTyp,
                            MI_NUM: String(knshInfo.miNum)
                        };
                    })
                };
            }),
            zskInfo: mvtkSeatInfoSync.zskInfo.map((zskInfo) => {
                return {
                    ZSK_CD: zskInfo.zskCd
                };
            }),
            skhnCd: mvtkSeatInfoSync.skhnCd
        };
        try {
            const seatInfoSyncInResult = yield seatInfoSyncService.seatInfoSync(seatInfoSyncIn);
            if (seatInfoSyncInResult.zskyykResult !== MVTK.SeatInfoSyncUtilities.RESERVATION_SUCCESS) {
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            }
        }
        catch (err) {
            log('MVTKムビチケ着券失敗', err);
            logger_1.default.error('SSKTS-APP:ConfirmModule reserveMvtk', `in: ${JSON.stringify(seatInfoSyncIn)}`, `err: ${err}`);
            throw err;
        }
        log('MVTKムビチケ着券成功');
        // log('GMO', purchaseModel.getReserveAmount());
        // log('MVTK', purchaseModel.getMvtkPrice());
        // log('FULL', purchaseModel.getPrice());
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
            const mvtkSeatInfoSync = purchaseModel.getMvtkSeatInfoSync({
                deleteFlag: MVTK.SeatInfoSyncUtilities.DELETE_FLAG_TRUE
            });
            log('購入管理番号情報', mvtkSeatInfoSync);
            //セッション削除
            delete req.session.purchase;
            delete req.session.mvtk;
            if (mvtkSeatInfoSync === null)
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            const seatInfoSyncService = MVTK.createSeatInfoSyncService();
            const seatInfoSyncIn = {
                kgygishCd: mvtkSeatInfoSync.kgygishCd,
                yykDvcTyp: mvtkSeatInfoSync.yykDvcTyp,
                trkshFlg: mvtkSeatInfoSync.trkshFlg,
                kgygishSstmZskyykNo: mvtkSeatInfoSync.kgygishSstmZskyykNo,
                kgygishUsrZskyykNo: mvtkSeatInfoSync.kgygishUsrZskyykNo,
                jeiDt: mvtkSeatInfoSync.jeiDt,
                kijYmd: mvtkSeatInfoSync.kijYmd,
                stCd: mvtkSeatInfoSync.stCd,
                screnCd: mvtkSeatInfoSync.screnCd,
                knyknrNoInfo: mvtkSeatInfoSync.knyknrNoInfo.map((knyknrNoInfo) => {
                    return {
                        KNYKNR_NO: knyknrNoInfo.knyknrNo,
                        PIN_CD: knyknrNoInfo.pinCd,
                        KNSH_INFO: knyknrNoInfo.knshInfo.map((knshInfo) => {
                            return {
                                KNSH_TYP: knshInfo.knshTyp,
                                MI_NUM: String(knshInfo.miNum)
                            };
                        })
                    };
                }),
                zskInfo: mvtkSeatInfoSync.zskInfo.map((zskInfo) => {
                    return {
                        ZSK_CD: zskInfo.zskCd
                    };
                }),
                skhnCd: mvtkSeatInfoSync.skhnCd
            };
            try {
                const seatInfoSyncInResult = yield seatInfoSyncService.seatInfoSync(seatInfoSyncIn);
                if (seatInfoSyncInResult.zskyykResult !== MVTK.SeatInfoSyncUtilities.RESERVATION_CANCEL_SUCCESS) {
                    throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
                }
                res.json({ isSuccess: true });
                log('MVTKムビチケ着券削除');
            }
            catch (err) {
                logger_1.default.error('SSKTS-APP:ConfirmModule cancelMvtk', `in: ${seatInfoSyncIn}`, `error: ${err}`);
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
                || purchaseModel.individualScreeningEvent === null
                || purchaseModel.profile === null
                || purchaseModel.seatReservationAuthorization === null
                || purchaseModel.seatReservationAuthorization.result === undefined
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
            log('ムビチケ券', mvtkTickets);
            // ムビチケ使用
            if (purchaseModel.mvtk !== null && mvtkTickets.length > 0) {
                yield reserveMvtk(purchaseModel);
                log('ムビチケ決済');
            }
            const order = yield sasaki.service.transaction.placeOrder(options).confirm({
                transactionId: purchaseModel.transaction.id
            });
            log('注文確定', order);
            //購入情報をセッションへ
            req.session.complete = {
                individualScreeningEvent: purchaseModel.individualScreeningEvent,
                profile: purchaseModel.profile,
                seatReservationAuthorization: purchaseModel.seatReservationAuthorization,
                reserveTickets: purchaseModel.reserveTickets
            };
            if (process.env.VIEW_TYPE !== UtilModule.VIEW.Fixed) {
                try {
                    const theater = yield sasaki.service.place(options).findMovieTheater({
                        branchCode: purchaseModel.individualScreeningEvent.coaInfo.theaterCode
                    });
                    log('劇場', theater.telephone);
                    const content = yield UtilModule.getEmailTemplate(res, `email/complete/${req.__('lang')}`, {
                        purchaseModel: purchaseModel,
                        theater: theater,
                        domain: req.headers.host,
                        layout: false
                    });
                    log('メールテンプレート取得');
                    const sender = 'noreply@ticket-cinemasunshine.com';
                    yield sasaki.service.transaction.placeOrder(options).sendEmailNotification({
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
                    log('メール通知');
                }
                catch (err) {
                    log('メール登録失敗', err);
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
                    reservationRecord.orders.push(order);
                    yield AwsCognitoService.updateRecords({
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
            res.json({ err: null, result: req.session.complete });
        }
        catch (err) {
            log('ERROR', err);
            const msg = (err.errorType === ErrorUtilModule_1.ErrorType.Expire) ? req.__('common.error.expire')
                : (err.code === HTTPStatus.BAD_REQUEST) ? req.__('common.error.badRequest')
                    : err.message;
            res.json({ err: msg, result: null });
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
            throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
        if (req.session.complete === undefined)
            throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Expire);
        res.json({ err: null, result: req.session.complete });
    }
    catch (err) {
        const msg = (err.errorType === ErrorUtilModule_1.ErrorType.Expire) ? req.__('common.error.expire')
            : (err.code === HTTPStatus.BAD_REQUEST) ? req.__('common.error.badRequest')
                : err.message;
        res.json({ err: msg, result: null });
    }
}
exports.getCompleteData = getCompleteData;
