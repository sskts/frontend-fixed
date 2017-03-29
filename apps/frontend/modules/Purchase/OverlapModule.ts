/**
 * 重複予約
 * @namespace Purchase.OverlapModule
 */

import * as COA from '@motionpicture/coa-service';
import * as GMO from '@motionpicture/gmo-service';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as MP from '../../../../libs/MP';
import * as PurchaseSession from '../../models/Purchase/PurchaseModel';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';
const log = debug('SSKTS ');

/**
 * 仮予約重複
 * @memberOf Purchase.OverlapModule
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
export async function index(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (req.session === undefined) throw ErrorUtilModule.ERROR_PROPERTY;
        const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);

        if (req.params.id === undefined) throw ErrorUtilModule.ERROR_ACCESS;
        if (purchaseModel.performance === null) throw ErrorUtilModule.ERROR_PROPERTY;
        //パフォーマンス取得
        const result = await MP.getPerformance(req.params.id);
        res.locals.performances = {
            after: result,
            before: purchaseModel.performance
        };
        res.render('purchase/overlap');
        return;
    } catch (err) {
        next(ErrorUtilModule.getError(req, err));
        return;
    }
}

/**
 * 新規予約へ
 * @memberOf Purchase.OverlapModule
 * @function newReserve
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
export async function newReserve(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (req.session === undefined) throw ErrorUtilModule.ERROR_PROPERTY;
        const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);

        if (purchaseModel.performance === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.transactionMP === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.reserveSeats === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.authorizationCOA === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.performanceCOA === null) throw ErrorUtilModule.ERROR_PROPERTY;
        const performance = purchaseModel.performance;
        const reserveSeats = purchaseModel.reserveSeats;

        //COA仮予約削除
        await COA.ReserveService.delTmpReserve({
            theater_code: performance.attributes.theater.id,
            date_jouei: performance.attributes.day,
            title_code: purchaseModel.performanceCOA.titleCode,
            title_branch_num: purchaseModel.performanceCOA.titleBranchNum,
            time_begin: performance.attributes.time_start,
            tmp_reserve_num: reserveSeats.tmp_reserve_num
        });
        log('COA仮予約削除');

        // COAオーソリ削除
        await MP.removeCOAAuthorization({
            transactionId: purchaseModel.transactionMP.id,
            coaAuthorizationId: purchaseModel.authorizationCOA.id
        });
        log('COAオーソリ削除');

        if (purchaseModel.transactionGMO !== null
            && purchaseModel.authorizationGMO !== null
            && purchaseModel.orderId !== null) {
            if (purchaseModel.theater === null) throw ErrorUtilModule.ERROR_PROPERTY;
            const gmoShopId = purchaseModel.theater.attributes.gmo_shop_id;
            const gmoShopPassword = purchaseModel.theater.attributes.gmo_shop_pass;
            //GMOオーソリ取消
            await GMO.CreditService.alterTran({
                shopId: gmoShopId,
                shopPass: gmoShopPassword,
                accessId: purchaseModel.transactionGMO.accessId,
                accessPass: purchaseModel.transactionGMO.accessPass,
                jobCd: GMO.Util.JOB_CD_VOID
            });
            log('GMOオーソリ取消');

            // GMOオーソリ削除
            await MP.removeGMOAuthorization({
                transactionId: purchaseModel.transactionMP.id,
                gmoAuthorizationId: purchaseModel.authorizationGMO.id
            });
            log('GMOオーソリ削除');
        }
        //購入スタートへ
        delete req.session.purchase;
        res.redirect(`/purchase?id=${req.body.performance_id}`);
        return;
    } catch (err) {
        next(ErrorUtilModule.getError(req, err));
        return;
    }
}

/**
 * 前回の予約へ
 * @memberOf Purchase.OverlapModule
 * @function prevReserve
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
export function prevReserve(req: Request, res: Response, next: NextFunction): void {
    if (req.session === undefined) {
        next(ErrorUtilModule.getError(req, ErrorUtilModule.ERROR_PROPERTY));
        return;
    }
    //座席選択へ
    res.redirect('/purchase/seat/' + (<string>req.body.performance_id) + '/');
    return;
}
