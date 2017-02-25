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
const MP = require("../../../../libs/MP");
const PurchaseSession = require("../../models/Purchase/PurchaseModel");
/**
 * 仮予約重複
 * @memberOf Purchase.OverlapModule
 * @function index
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
function index(req, res, next) {
    if (!req.session)
        return next(req.__('common.error.property'));
    const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
    if (!req.params || !req.params.id)
        return next(new Error(req.__('common.error.access')));
    if (!purchaseModel.performance)
        throw new Error(req.__('common.error.property'));
    //パフォーマンス取得
    MP.getPerformance({
        id: req.params.id
    }).then((result) => {
        res.locals.performances = {
            after: result,
            before: purchaseModel.performance
        };
        return res.render('purchase/overlap');
    }).catch((err) => {
        return next(new Error(err.message));
    });
}
exports.index = index;
/**
 * 新規予約へ
 * @memberOf Purchase.OverlapModule
 * @function newReserve
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
function newReserve(req, res, next) {
    if (!req.session)
        return next(req.__('common.error.property'));
    const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
    removeReserve(req, purchaseModel).then(() => {
        if (!req.session)
            return next(req.__('common.error.property'));
        //購入スタートへ
        delete req.session.purchase;
        return res.redirect('/purchase/' + req.body.performance_id + '/transaction');
    }).catch((err) => {
        return next(new Error(err.message));
    });
}
exports.newReserve = newReserve;
/**
 * 前回の予約へ
 * @memberOf Purchase.OverlapModule
 * @function prevReserve
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
function prevReserve(req, res, next) {
    if (!req.session)
        return next(req.__('common.error.property'));
    //座席選択へ
    return res.redirect('/purchase/seat/' + req.body.performance_id + '/');
}
exports.prevReserve = prevReserve;
/**
 * 仮予約取り消し
 * @memberOf Purchase.OverlapModule
 * @function removeReserve
 * @param {express.Request} req
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {Promise<void>}
 */
function removeReserve(req, purchaseModel) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!purchaseModel.performance)
            throw new Error(req.__('common.error.property'));
        if (!purchaseModel.transactionMP)
            throw new Error(req.__('common.error.property'));
        if (!purchaseModel.reserveSeats)
            throw new Error(req.__('common.error.property'));
        if (!purchaseModel.authorizationCOA)
            throw new Error(req.__('common.error.property'));
        const performance = purchaseModel.performance;
        const reserveSeats = purchaseModel.reserveSeats;
        //COA仮予約削除
        yield COA.ReserveService.delTmpReserve({
            theater_code: performance.attributes.theater.id,
            date_jouei: performance.attributes.day,
            title_code: performance.attributes.film.coa_title_code,
            title_branch_num: performance.attributes.film.coa_title_branch_num,
            time_begin: performance.attributes.time_start,
            tmp_reserve_num: reserveSeats.tmp_reserve_num
        });
        console.log('COA仮予約削除');
        // COAオーソリ削除
        yield MP.removeCOAAuthorization({
            transactionId: purchaseModel.transactionMP.id,
            coaAuthorizationId: purchaseModel.authorizationCOA.id
        });
        console.log('COAオーソリ削除');
        if (purchaseModel.transactionGMO
            && purchaseModel.authorizationGMO
            && purchaseModel.orderId) {
            //GMOオーソリ取消
            yield GMO.CreditService.alterTran({
                shopId: process.env.GMO_SHOP_ID,
                shopPass: process.env.GMO_SHOP_PASSWORD,
                accessId: purchaseModel.transactionGMO.accessId,
                accessPass: purchaseModel.transactionGMO.accessPass,
                jobCd: GMO.Util.JOB_CD_VOID
            });
            console.log('GMOオーソリ取消');
            // GMOオーソリ削除
            yield MP.removeGMOAuthorization({
                transactionId: purchaseModel.transactionMP.id,
                gmoAuthorizationId: purchaseModel.authorizationGMO.id
            });
            console.log('GMOオーソリ削除');
        }
    });
}
