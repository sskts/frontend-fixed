/**
 * 重複予約
 * @namespace Purchase.OverlapModule
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
const COA = require("@motionpicture/coa-service");
const GMO = require("@motionpicture/gmo-service");
const debug = require("debug");
const MP = require("../../../../libs/MP");
const PurchaseSession = require("../../models/Purchase/PurchaseModel");
const ErrorUtilModule = require("../Util/ErrorUtilModule");
const debugLog = debug('SSKTS ');
/**
 * 仮予約重複
 * @memberOf Purchase.OverlapModule
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
            const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
            if (!req.params.hasOwnProperty('id'))
                throw ErrorUtilModule.ERROR_ACCESS;
            if (purchaseModel.performance === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            //パフォーマンス取得
            const result = yield MP.getPerformance(req.params.id);
            res.locals.performances = {
                after: result,
                before: purchaseModel.performance
            };
            res.render('purchase/overlap');
            return;
        }
        catch (err) {
            next(ErrorUtilModule.getError(req, err));
            return;
        }
    });
}
exports.index = index;
/**
 * 新規予約へ
 * @memberOf Purchase.OverlapModule
 * @function newReserve
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
function newReserve(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.session === undefined)
                throw ErrorUtilModule.ERROR_PROPERTY;
            const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
            if (purchaseModel.performance === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (purchaseModel.transactionMP === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (purchaseModel.reserveSeats === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (purchaseModel.authorizationCOA === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (purchaseModel.performanceCOA === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            const performance = purchaseModel.performance;
            const reserveSeats = purchaseModel.reserveSeats;
            //COA仮予約削除
            yield COA.ReserveService.delTmpReserve({
                theater_code: performance.attributes.theater.id,
                date_jouei: performance.attributes.day,
                title_code: purchaseModel.performanceCOA.titleCode,
                title_branch_num: purchaseModel.performanceCOA.titleBranchNum,
                time_begin: performance.attributes.time_start,
                tmp_reserve_num: reserveSeats.tmp_reserve_num
            });
            debugLog('COA仮予約削除');
            // COAオーソリ削除
            yield MP.removeCOAAuthorization({
                transactionId: purchaseModel.transactionMP.id,
                coaAuthorizationId: purchaseModel.authorizationCOA.id
            });
            debugLog('COAオーソリ削除');
            if (purchaseModel.transactionGMO !== null
                && purchaseModel.authorizationGMO !== null
                && purchaseModel.orderId !== null) {
                if (purchaseModel.theater === null)
                    throw ErrorUtilModule.ERROR_PROPERTY;
                const gmoShopId = purchaseModel.theater.attributes.gmo_shop_id;
                const gmoShopPassword = purchaseModel.theater.attributes.gmo_shop_pass;
                //GMOオーソリ取消
                yield GMO.CreditService.alterTran({
                    shopId: gmoShopId,
                    shopPass: gmoShopPassword,
                    accessId: purchaseModel.transactionGMO.accessId,
                    accessPass: purchaseModel.transactionGMO.accessPass,
                    jobCd: GMO.Util.JOB_CD_VOID
                });
                debugLog('GMOオーソリ取消');
                // GMOオーソリ削除
                yield MP.removeGMOAuthorization({
                    transactionId: purchaseModel.transactionMP.id,
                    gmoAuthorizationId: purchaseModel.authorizationGMO.id
                });
                debugLog('GMOオーソリ削除');
            }
            //購入スタートへ
            delete req.session.purchase;
            res.redirect(`/purchase?id=${req.body.performance_id}`);
            return;
        }
        catch (err) {
            next(ErrorUtilModule.getError(req, err));
            return;
        }
    });
}
exports.newReserve = newReserve;
/**
 * 前回の予約へ
 * @memberOf Purchase.OverlapModule
 * @function prevReserve
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
function prevReserve(req, res, next) {
    if (req.session === undefined) {
        next(ErrorUtilModule.getError(req, ErrorUtilModule.ERROR_PROPERTY));
        return;
    }
    //座席選択へ
    res.redirect('/purchase/seat/' + req.body.performance_id + '/');
    return;
}
exports.prevReserve = prevReserve;
