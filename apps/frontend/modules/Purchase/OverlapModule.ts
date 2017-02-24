/**
 * 重複予約
 * @namespace Purchase.OverlapModule
 */

import * as COA from '@motionpicture/coa-service';
import * as GMO from '@motionpicture/gmo-service';
import * as express from 'express';
import * as MP from '../../../../libs/MP';
import * as PurchaseSession from '../../models/Purchase/PurchaseModel';

/**
 * 仮予約重複
 * @memberOf Purchase.OverlapModule
 * @function index
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
export function index(req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (!req.session) return next(req.__('common.error.property'));
    const purchaseModel = new PurchaseSession.PurchaseModel((<any>req.session).purchase);
    if (!req.params || !req.params.id) return next(new Error(req.__('common.error.access')));
    if (!purchaseModel.performance) throw new Error(req.__('common.error.property'));
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

/**
 * 新規予約へ
 * @memberOf Purchase.OverlapModule
 * @function newReserve
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
export function newReserve(req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (!req.session) return next(req.__('common.error.property'));
    const purchaseModel = new PurchaseSession.PurchaseModel((<any>req.session).purchase);
    removeReserve(req, purchaseModel).then(() => {
        if (!req.session) return next(req.__('common.error.property'));
        //購入スタートへ
        delete (<any>req.session).purchase;
        return res.redirect('/purchase/' + req.body.performance_id + '/transaction');

    }).catch((err) => {
        return next(new Error(err.message));
    });
}

/**
 * 前回の予約へ
 * @memberOf Purchase.OverlapModule
 * @function prevReserve
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
export function prevReserve(req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (!req.session) return next(req.__('common.error.property'));
    //座席選択へ
    return res.redirect('/purchase/seat/' + req.body.performance_id + '/');
}

/**
 * 仮予約取り消し
 * @memberOf Purchase.OverlapModule
 * @function removeReserve
 * @param {express.Request} req
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {Promise<void>}
 */
async function removeReserve(req: express.Request, purchaseModel: PurchaseSession.PurchaseModel): Promise<void> {
    if (!purchaseModel.performance) throw new Error(req.__('common.error.property'));
    if (!purchaseModel.transactionMP) throw new Error(req.__('common.error.property'));
    if (!purchaseModel.reserveSeats) throw new Error(req.__('common.error.property'));
    if (!purchaseModel.authorizationCOA) throw new Error(req.__('common.error.property'));

    const performance = purchaseModel.performance;
    const reserveSeats = purchaseModel.reserveSeats;

    //COA仮予約削除
    await COA.ReserveService.delTmpReserve({
        theater_code: performance.attributes.theater.id,
        date_jouei: performance.attributes.day,
        title_code: performance.attributes.film.coa_title_code,
        title_branch_num: performance.attributes.film.coa_title_branch_num,
        time_begin: performance.attributes.time_start,
        tmp_reserve_num: reserveSeats.tmp_reserve_num
    });

    console.log('COA仮予約削除');

    // COAオーソリ削除
    await MP.removeCOAAuthorization({
        transactionId: purchaseModel.transactionMP.id,
        coaAuthorizationId: purchaseModel.authorizationCOA.id
    });

    console.log('COAオーソリ削除');

    if (purchaseModel.transactionGMO
        && purchaseModel.authorizationGMO
        && purchaseModel.orderId) {
        //GMOオーソリ取消
        await GMO.CreditService.alterTran({
            shopId: process.env.GMO_SHOP_ID,
            shopPass: process.env.GMO_SHOP_PASSWORD,
            accessId: purchaseModel.transactionGMO.accessId,
            accessPass: purchaseModel.transactionGMO.accessPass,
            jobCd: GMO.Util.JOB_CD_VOID
        });
        console.log('GMOオーソリ取消');

        // GMOオーソリ削除
        await MP.removeGMOAuthorization({
            transactionId: purchaseModel.transactionMP.id,
            gmoAuthorizationId: purchaseModel.authorizationGMO.id
        });
        console.log('GMOオーソリ削除');
    }
}
