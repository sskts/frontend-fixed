
import express = require('express');
import PurchaseSession = require('../../models/Purchase/PurchaseModel');
import config = require('config');

import * as COA from '@motionpicture/coa-service';
import * as GMO from '@motionpicture/gmo-service';
import * as MP from '../../../../libs/MP';

/**
 * 重複予約
 * @namespace
 */
namespace OverlapModule {
    /**
     * 仮予約重複
     * @function
     */
    export function index(req: express.Request, res: express.Response, next: express.NextFunction): void {
        if (!req.session) return next(req.__('common.error.property'));
        const purchaseModel = new PurchaseSession.PurchaseModel(req.session['purchase']);
        if (!req.params || !req.params.id) return next(new Error(req.__('common.error.access')));
        if (!purchaseModel.performance) throw new Error(req.__('common.error.property'));
        //パフォーマンス取得
        MP.getPerformance.call({
            id: req.params.id
        }).then(
            (result) => {
                res.locals['performances'] = {
                    after: result,
                    before: purchaseModel.performance
                };

                return res.render('purchase/overlap');
            },
            (err) => {
                return next(new Error(err.message));
            });
    }

    /**
     * 新規予約へ
     * @function
     */
    export function newReserve(req: express.Request, res: express.Response, next: express.NextFunction): void {
        if (!req.session) return next(req.__('common.error.property'));
        const purchaseModel = new PurchaseSession.PurchaseModel(req.session['purchase']);
        removeReserve(req, purchaseModel).then(
            () => {
                if (!req.session) return next(req.__('common.error.property'));
                //購入スタートへ
                delete req.session['purchase'];
                return res.redirect('/purchase/' + req.body.performance_id + '/transaction');

            },
            (err) => {
                return next(new Error(err.message));
            });
    }

    /**
     * 前回の予約へ
     * @function
     */
    export function prevReserve(req: express.Request, res: express.Response, next: express.NextFunction): void {
        if (!req.session) return next(req.__('common.error.property'));
        //座席選択へ
        return res.redirect('/purchase/seat/' + req.body.performance_id + '/');
    }

    /**
     * 仮予約取り消し
     * @function
     */
    async function removeReserve(req: express.Request, purchaseModel: PurchaseSession.PurchaseModel): Promise<void> {
        if (!purchaseModel.performance) throw new Error(req.__('common.error.property'));
        if (!purchaseModel.transactionMP) throw new Error(req.__('common.error.property'));
        if (!purchaseModel.reserveSeats) throw new Error(req.__('common.error.property'));
        if (!purchaseModel.authorizationCOA) throw new Error(req.__('common.error.property'));

        const performance = purchaseModel.performance;
        const reserveSeats = purchaseModel.reserveSeats;

        //COA仮予約削除
        await COA.deleteTmpReserveInterface.call({
            theater_code: performance.attributes.theater._id,
            date_jouei: performance.attributes.day,
            title_code: performance.attributes.film.coa_title_code,
            title_branch_num: performance.attributes.film.coa_title_branch_num,
            time_begin: performance.attributes.time_start,
            tmp_reserve_num: reserveSeats.tmp_reserve_num
        });

        console.log('COA仮予約削除');

        // COAオーソリ削除
        await MP.removeCOAAuthorization.call({
            transactionId: purchaseModel.transactionMP._id,
            coaAuthorizationId: purchaseModel.authorizationCOA._id
        });

        console.log('COAオーソリ削除');

        if (purchaseModel.transactionGMO
            && purchaseModel.authorizationGMO
            && purchaseModel.orderId) {
            //GMOオーソリ取消
            await GMO.CreditService.alterTranInterface.call({
                shop_id: config.get<string>('gmo_shop_id'),
                shop_pass: config.get<string>('gmo_shop_password'),
                access_id: purchaseModel.transactionGMO.access_id,
                access_pass: purchaseModel.transactionGMO.access_pass,
                job_cd: GMO.Util.JOB_CD_VOID
            });
            console.log('GMOオーソリ取消');

            // GMOオーソリ削除
            await MP.removeGMOAuthorization.call({
                transactionId: purchaseModel.transactionMP._id,
                gmoAuthorizationId: purchaseModel.authorizationGMO._id
            });
            console.log('GMOオーソリ削除');
        }
    }
}


export default OverlapModule;
