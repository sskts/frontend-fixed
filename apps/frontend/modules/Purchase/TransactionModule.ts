/**
 * 取引
 * @namespace Purchase.TransactionModule
 */

import * as debug from 'debug';
import { Request, Response } from 'express';
import * as moment from 'moment';
import * as MP from '../../../../libs/MP';
import * as PurchaseSession from '../../models/Purchase/PurchaseModel';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';
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
export async function start(req: Request, res: Response): Promise<Response> {
    try {
        if (req.session === undefined || req.body.id === undefined) {
            throw ErrorUtilModule.ERROR_PROPERTY;
        }
        const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
        if (purchaseModel.transactionMP !== null && purchaseModel.reserveSeats !== null) {
            //重複確認へ
            return res.json({ redirect: `/purchase/${req.body.id}/overlap`, err: null });
        }
        // 予約可能日判定
        const performance = await MP.getPerformance(req.body.id);
        if (moment().format('YYYYMMDDHHmm') > `${performance.attributes.day}${performance.attributes.time_end}`) {
            throw ErrorUtilModule.ERROR_ACCESS;
        }
        // 取引開始
        const minutes = 30;
        purchaseModel.expired = moment().add('minutes', minutes).unix();
        purchaseModel.transactionMP = await MP.transactionStart({
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
    } catch (err) {
        if (err === ErrorUtilModule.ERROR_ACCESS) {
            return res.json({ redirect: '/error', err: null });
        }
        const msg = ErrorUtilModule.getError(req, err).message;
        return res.json({ redirect: null, err: msg });
    }
}
