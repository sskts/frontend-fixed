/**
 * パフォーマンス一覧
 * @namespace Purchase.PerformancesModule
 */
import * as COA from '@motionpicture/coa-service';
import * as GMO from '@motionpicture/gmo-service';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as MP from '../../../libs/MP';
import logger from '../../middlewares/logger';
import * as PurchaseSession from '../../models/Purchase/PurchaseModel';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';
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
export async function index(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (req.session === undefined) {
        next(new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_PROPERTY, undefined));

        return;
    }
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
            transactionId: purchaseModel.transactionMP.id,
            gmoAuthorizationId: purchaseModel.authorizationGMO.id
        };
        try {
            const alterTranResult = await GMO.CreditService.alterTran(alterTranIn);
            log('GMOオーソリ取消', alterTranResult);
            // GMOオーソリ削除
            await MP.removeGMOAuthorization(removeGMOAuthorizationIn);
            log('MPGMOオーソリ削除');
        } catch (err) {
            logger.error('SSKTS-APP:FixedModule.index', {
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
        if (purchaseModel.authorizationCOA === null) throw ErrorUtilModule.ERROR_PROPERTY;
        const delTmpReserveIn = {
            theater_code: purchaseModel.performance.attributes.theater.id,
            date_jouei: purchaseModel.performance.attributes.day,
            title_code: purchaseModel.performanceCOA.titleCode,
            title_branch_num: purchaseModel.performanceCOA.titleBranchNum,
            time_begin: purchaseModel.performance.attributes.time_start,
            tmp_reserve_num: purchaseModel.reserveSeats.tmp_reserve_num
        };
        const removeCOAAuthorizationIn = {
            transactionId: purchaseModel.transactionMP.id,
            coaAuthorizationId: purchaseModel.authorizationCOA.id
        };
        try {
            // COA仮予約削除
            await COA.ReserveService.delTmpReserve(delTmpReserveIn);
            log('COA仮予約削除');
            // COAオーソリ削除
            await MP.removeCOAAuthorization(removeCOAAuthorizationIn);
            log('MPCOAオーソリ削除');
        } catch (err) {
            logger.error('SSKTS-APP:FixedModule.index', {
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
        res.locals.theaters = await MP.getTheaters();
    }
    res.locals.step = PurchaseSession.PurchaseModel.PERFORMANCE_STATE;
    res.render('purchase/performances', { layout: 'layouts/purchase/layout' });

    return;
}

/**
 * パフォーマンスリスト取得
 * @memberof Purchase.PerformancesModule
 * @function getPerformances
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getPerformances(req: Request, res: Response): Promise<void> {
    try {
        const result = await MP.getPerformances(req.body.theater, req.body.day);
        res.json({ error: null, result: result });
    } catch (err) {
        res.json({ error: err, result: null });
    }
}
