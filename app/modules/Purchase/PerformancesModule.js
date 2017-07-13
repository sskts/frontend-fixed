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
 * パフォーマンス一覧
 * @namespace Purchase.PerformancesModule
 */
const COA = require("@motionpicture/coa-service");
const GMO = require("@motionpicture/gmo-service");
const debug = require("debug");
const MP = require("../../../libs/MP");
const logger_1 = require("../../middlewares/logger");
const PurchaseSession = require("../../models/Purchase/PurchaseModel");
const ErrorUtilModule = require("../Util/ErrorUtilModule");
const UtilModule = require("../Util/UtilModule");
const log = debug('SSKTS:Purchase.PerformancesModule');
/**
 * パフォーマンス一覧表示
 * @memberof Purchase.PerformancesModule
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
            // GMO取消
            if (purchaseModel.transactionGMO !== null
                && purchaseModel.authorizationGMO !== null
                && purchaseModel.orderId !== null
                && purchaseModel.transactionMP !== null
                && purchaseModel.theater !== null) {
                const gmoShopId = purchaseModel.theater.attributes.gmo.shop_id;
                const gmoShopPassword = purchaseModel.theater.attributes.gmo.shop_pass;
                // GMOオーソリ取消
                const alterTranIn = {
                    shopId: gmoShopId,
                    shopPass: gmoShopPassword,
                    accessId: purchaseModel.transactionGMO.accessId,
                    accessPass: purchaseModel.transactionGMO.accessPass,
                    jobCd: GMO.Util.JOB_CD_VOID
                };
                const removeGMOAuthorizationIn = {
                    accessToken: yield UtilModule.getAccessToken(req),
                    transactionId: purchaseModel.transactionMP.id,
                    authorizationId: purchaseModel.authorizationGMO.id
                };
                try {
                    const alterTranResult = yield GMO.CreditService.alterTran(alterTranIn);
                    log('GMOオーソリ取消', alterTranResult);
                    // GMOオーソリ削除
                    yield MP.services.transaction.removeAuthorization(removeGMOAuthorizationIn);
                    log('MPGMOオーソリ削除');
                }
                catch (err) {
                    logger_1.default.error('SSKTS-APP:FixedModule.index', {
                        alterTranIn: alterTranIn,
                        removeGMOAuthorizationIn: removeGMOAuthorizationIn,
                        err: err
                    });
                }
            }
            // COA仮予約削除
            if (purchaseModel.reserveSeats !== null
                && purchaseModel.authorizationCOA !== null
                && purchaseModel.reserveSeats !== null
                && purchaseModel.transactionMP !== null
                && purchaseModel.performance !== null
                && purchaseModel.performanceCOA !== null) {
                if (purchaseModel.authorizationCOA === null)
                    throw ErrorUtilModule.ERROR_PROPERTY;
                const delTmpReserveIn = {
                    theater_code: purchaseModel.performance.attributes.theater.id,
                    date_jouei: purchaseModel.performance.attributes.day,
                    title_code: purchaseModel.performanceCOA.titleCode,
                    title_branch_num: purchaseModel.performanceCOA.titleBranchNum,
                    time_begin: purchaseModel.performance.attributes.time_start,
                    tmp_reserve_num: purchaseModel.reserveSeats.tmp_reserve_num
                };
                const removeCOAAuthorizationIn = {
                    accessToken: yield UtilModule.getAccessToken(req),
                    transactionId: purchaseModel.transactionMP.id,
                    authorizationId: purchaseModel.authorizationCOA.id
                };
                try {
                    // COA仮予約削除
                    yield COA.services.reserve.delTmpReserve(delTmpReserveIn);
                    log('COA仮予約削除');
                    // COAオーソリ削除
                    yield MP.services.transaction.removeAuthorization(removeCOAAuthorizationIn);
                    log('MPCOAオーソリ削除');
                }
                catch (err) {
                    logger_1.default.error('SSKTS-APP:FixedModule.index', {
                        delTmpReserveIn: delTmpReserveIn,
                        removeCOAAuthorizationIn: removeCOAAuthorizationIn,
                        err: err
                    });
                }
            }
            delete req.session.purchase;
            delete req.session.mvtk;
            delete req.session.complete;
            if (process.env.VIEW_TYPE === undefined) {
                res.locals.theaters = yield MP.services.theater.getTheaters({
                    accessToken: yield UtilModule.getAccessToken(req)
                });
            }
            res.locals.step = PurchaseSession.PurchaseModel.PERFORMANCE_STATE;
            res.render('purchase/performances', { layout: 'layouts/purchase/layout' });
        }
        catch (err) {
            const error = (err instanceof Error)
                ? new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message)
                : new ErrorUtilModule.CustomError(err, undefined);
            next(error);
            return;
        }
    });
}
exports.index = index;
/**
 * パフォーマンスリスト取得
 * @memberof Purchase.PerformancesModule
 * @function getPerformances
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
function getPerformances(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield MP.services.performance.getPerformances({
                accessToken: yield UtilModule.getAccessToken(req),
                theater: req.body.theater,
                day: req.body.day
            });
            res.json({ error: null, result: result });
        }
        catch (err) {
            res.json({ error: err, result: null });
        }
    });
}
exports.getPerformances = getPerformances;
