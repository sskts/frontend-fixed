/**
 * 取引
 * @namespace Purchase.TransactionModule
 */
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
const debug = require("debug");
const moment = require("moment");
const MP = require("../../../libs/MP");
const PurchaseSession = require("../../models/Purchase/PurchaseModel");
const ErrorUtilModule = require("../Util/ErrorUtilModule");
const log = debug('SSKTS');
/**
 * 取引開始
 * @memberOf Purchase.TransactionModule
 * @function start
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<Response>}
 */
function start(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.session === undefined || req.body.id === undefined) {
                throw ErrorUtilModule.ERROR_PROPERTY;
            }
            const performance = yield MP.getPerformance(req.body.id);
            // 開始可能日判定
            if (moment().unix() < moment(`${performance.attributes.coa_rsv_start_date}`).unix()) {
                throw ErrorUtilModule.ERROR_ACCESS;
            }
            const timeLimit = 1;
            // 終了可能日判定
            if (moment().add(timeLimit, 'hours').unix() > moment(`${performance.attributes.day} ${performance.attributes.time_start}`).unix()) {
                throw ErrorUtilModule.ERROR_ACCESS;
            }
            const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
            if (purchaseModel.transactionMP !== null && purchaseModel.reserveSeats !== null) {
                //重複確認へ
                return res.json({ redirect: `/purchase/${req.body.id}/overlap`, err: null });
            }
            // 取引開始
            const minutes = 15;
            purchaseModel.expired = moment().add(minutes, 'minutes').unix();
            purchaseModel.transactionMP = yield MP.transactionStart({
                expires_at: purchaseModel.expired
            });
            log('MP取引開始', purchaseModel.transactionMP.attributes.owners);
            delete req.session.purchase;
            delete req.session.mvtk;
            delete req.session.complete;
            //セッション更新
            req.session.purchase = purchaseModel.toSession();
            //座席選択へ
            return res.json({ redirect: `/purchase/seat/${req.body.id}/`, err: null });
        }
        catch (err) {
            if (err === ErrorUtilModule.ERROR_ACCESS) {
                return res.json({ redirect: '/error', err: null });
            }
            let msg;
            if (err === ErrorUtilModule.ERROR_PROPERTY) {
                msg = req.__('common.error.property');
            }
            else if (err === ErrorUtilModule.ERROR_EXPIRE) {
                msg = req.__('common.error.expire');
            }
            else {
                msg = err.message;
            }
            return res.json({ redirect: null, err: msg });
        }
    });
}
exports.start = start;