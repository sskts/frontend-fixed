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
const MVTK = require("@motionpicture/mvtk-service");
const sasaki = require("@motionpicture/sasaki-api-nodejs");
const debug = require("debug");
const logger_1 = require("../../middlewares/logger");
const AuthModel_1 = require("../../models/Auth/AuthModel");
const PurchaseModel_1 = require("../../models/Purchase/PurchaseModel");
const ErrorUtilModule = require("../Util/ErrorUtilModule");
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
                throw ErrorUtilModule.ErrorType.Property;
            if (req.session.purchase === undefined)
                throw ErrorUtilModule.ErrorType.Expire;
            const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
            if (purchaseModel.isExpired())
                throw ErrorUtilModule.ErrorType.Expire;
            if (!purchaseModel.accessAuth(PurchaseModel_1.PurchaseModel.CONFIRM_STATE)) {
                throw ErrorUtilModule.ErrorType.Expire;
            }
            //購入者内容確認表示
            res.locals.updateReserve = null;
            res.locals.error = null;
            res.locals.purchaseModel = purchaseModel;
            res.locals.step = PurchaseModel_1.PurchaseModel.CONFIRM_STATE;
            //セッション更新
            purchaseModel.save(req.session);
            res.render('purchase/confirm', { layout: 'layouts/purchase/layout' });
            return;
        }
        catch (err) {
            const error = (err instanceof Error)
                ? new ErrorUtilModule.CustomError(ErrorUtilModule.ErrorType.ExternalModule, err.message)
                : new ErrorUtilModule.CustomError(err, undefined);
            next(error);
            return;
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
            throw ErrorUtilModule.ErrorType.Access;
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
            if (seatInfoSyncInResult.zskyykResult !== MVTK.SeatInfoSyncUtilities.RESERVATION_SUCCESS)
                throw ErrorUtilModule.ErrorType.Access;
        }
        catch (err) {
            logger_1.default.error('SSKTS-APP:ConfirmModule reserveMvtk', `in: ${seatInfoSyncIn}`, `err: ${err}`);
            throw err;
        }
        log('MVTKムビチケ着券');
        log('GMO', purchaseModel.getReserveAmount());
        log('MVTK', purchaseModel.getMvtkPrice());
        log('FULL', purchaseModel.getPrice());
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
        if (req.session === undefined)
            throw ErrorUtilModule.ErrorType.Property;
        if (req.session.purchase === undefined)
            throw ErrorUtilModule.ErrorType.Expire;
        const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
        // 購入管理番号情報
        const mvtkSeatInfoSync = purchaseModel.getMvtkSeatInfoSync({
            deleteFlag: MVTK.SeatInfoSyncUtilities.DELETE_FLAG_TRUE
        });
        log('購入管理番号情報', mvtkSeatInfoSync);
        if (mvtkSeatInfoSync === null)
            throw ErrorUtilModule.ErrorType.Access;
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
        let result = true;
        try {
            const seatInfoSyncInResult = yield seatInfoSyncService.seatInfoSync(seatInfoSyncIn);
            if (seatInfoSyncInResult.zskyykResult !== MVTK.SeatInfoSyncUtilities.RESERVATION_CANCEL_SUCCESS) {
                throw ErrorUtilModule.ErrorType.Access;
            }
        }
        catch (err) {
            result = false;
            logger_1.default.error('SSKTS-APP:ConfirmModule reserveMvtk', `in: ${seatInfoSyncIn}`, `err: ${err}`);
        }
        //購入セッション削除
        delete req.session.purchase;
        //ムビチケセッション削除
        delete req.session.mvtk;
        log('MVTKムビチケ着券削除');
        res.json({ isSuccess: result });
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
                throw ErrorUtilModule.ErrorType.Property;
            const authModel = new AuthModel_1.AuthModel(req.session.auth);
            const options = {
                endpoint: process.env.SSKTS_API_ENDPOINT,
                auth: authModel.create()
            };
            if (req.session.purchase === undefined)
                throw ErrorUtilModule.ErrorType.Expire;
            const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
            if (purchaseModel.transaction === null)
                throw ErrorUtilModule.ErrorType.Property;
            if (purchaseModel.profile === null)
                throw ErrorUtilModule.ErrorType.Property;
            if (purchaseModel.individualScreeningEvent === null)
                throw ErrorUtilModule.ErrorType.Property;
            if (purchaseModel.seatReservationAuthorization === null)
                throw ErrorUtilModule.ErrorType.Property;
            //取引id確認
            if (req.body.transactionId !== purchaseModel.transaction.id)
                throw ErrorUtilModule.ErrorType.Access;
            //購入期限切れ
            if (purchaseModel.isExpired()) {
                delete req.session.purchase;
                throw ErrorUtilModule.ErrorType.Expire;
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
            if (process.env.VIEW_TYPE === UtilModule.VIEW.Fixed) {
                // 本予約に必要な情報を印刷セッションへ
                const updateReserveIn = {
                    theaterCode: purchaseModel.individualScreeningEvent.coaInfo.theaterCode,
                    dateJouei: purchaseModel.individualScreeningEvent.coaInfo.dateJouei,
                    titleCode: purchaseModel.individualScreeningEvent.coaInfo.titleCode,
                    titleBranchNum: purchaseModel.individualScreeningEvent.coaInfo.titleBranchNum,
                    timeBegin: purchaseModel.individualScreeningEvent.coaInfo.timeBegin,
                    tmpReserveNum: purchaseModel.seatReservationAuthorization.result.tmpReserveNum,
                    reserveName: `${purchaseModel.profile.familyName}　${purchaseModel.profile.givenName}`,
                    reserveNameJkana: `${purchaseModel.profile.familyName}　${purchaseModel.profile.givenName}`,
                    telNum: purchaseModel.profile.telephone,
                    mailAddr: purchaseModel.profile.email,
                    reserveAmount: purchaseModel.getReserveAmount(),
                    listTicket: purchaseModel.reserveTickets.map((ticket) => {
                        let mvtkTicket;
                        if (purchaseModel.mvtk !== null) {
                            mvtkTicket = purchaseModel.mvtk.find((value) => {
                                return (value.code === ticket.mvtkNum && value.ticket.ticketCode === ticket.ticketCode);
                            });
                        }
                        return {
                            ticketCode: ticket.ticketCode,
                            stdPrice: ticket.stdPrice,
                            addPrice: ticket.addPrice,
                            disPrice: 0,
                            salePrice: (ticket.stdPrice + ticket.addPrice),
                            ticketCount: 1,
                            mvtkAppPrice: ticket.mvtkAppPrice,
                            seatNum: ticket.seatCode,
                            addGlasses: (ticket.glasses) ? ticket.addPriceGlasses : 0,
                            kbnEisyahousiki: (mvtkTicket !== undefined) ? mvtkTicket.ykknInfo.eishhshkTyp : '00',
                            mvtkNum: (mvtkTicket !== undefined) ? mvtkTicket.code : '',
                            mvtkKbnDenshiken: (mvtkTicket !== undefined) ? mvtkTicket.ykknInfo.dnshKmTyp : '00',
                            mvtkKbnMaeuriken: (mvtkTicket !== undefined) ? mvtkTicket.ykknInfo.znkkkytsknGkjknTyp : '00',
                            mvtkKbnKensyu: (mvtkTicket !== undefined) ? mvtkTicket.ykknInfo.ykknshTyp : '00',
                            mvtkSalesPrice: (mvtkTicket !== undefined) ? Number(mvtkTicket.ykknInfo.knshknhmbiUnip) : 0
                        };
                    })
                };
                req.session.fixed = {
                    updateReserveIn: updateReserveIn
                };
            }
            else {
                const theater = yield sasaki.service.place(options).findMovieTheater({
                    branchCode: purchaseModel.individualScreeningEvent.coaInfo.theaterCode
                });
                const content = yield UtilModule.getEmailTemplate(res, `email/complete/${req.__('lang')}`, {
                    purchaseModel: purchaseModel,
                    theater: theater,
                    domain: req.headers.host
                });
                yield sasaki.service.transaction.placeOrder(options).sendEmailNotification({
                    transactionId: purchaseModel.transaction.id,
                    emailNotification: {
                        from: 'noreply@ticket-cinemasunshine.com',
                        to: purchaseModel.profile.email,
                        subject: `${purchaseModel.individualScreeningEvent.superEvent.location.name.ja} 購入完了`,
                        content: content
                    }
                });
                log('メール通知');
            }
            // 購入セッション削除
            delete req.session.purchase;
            // 購入完了情報を返す
            res.json({ err: null, result: req.session.complete });
        }
        catch (err) {
            log('ERROR', err);
            const msg = (err === ErrorUtilModule.ErrorType.Property) ? req.__('common.error.property')
                : (err === ErrorUtilModule.ErrorType.Access) ? req.__('common.error.access')
                    : (err === ErrorUtilModule.ErrorType.Expire) ? req.__('common.error.expire')
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
            throw ErrorUtilModule.ErrorType.Property;
        if (req.session.complete === undefined)
            throw ErrorUtilModule.ErrorType.Expire;
        res.json({ err: null, result: req.session.complete });
    }
    catch (err) {
        const msg = (err === ErrorUtilModule.ErrorType.Property) ? req.__('common.error.property')
            : (err === ErrorUtilModule.ErrorType.Access) ? req.__('common.error.access')
                : (err === ErrorUtilModule.ErrorType.Expire) ? req.__('common.error.expire')
                    : err.message;
        res.json({ err: msg, result: null });
    }
}
exports.getCompleteData = getCompleteData;
