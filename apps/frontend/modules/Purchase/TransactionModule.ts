/**
 * 取引
 * @namespace Purchase.TransactionModule
 */

import * as debug from 'debug';
import {NextFunction, Request, Response} from 'express';
import * as moment from 'moment';
import * as MP from '../../../../libs/MP';
import * as PurchaseSession from '../../models/Purchase/PurchaseModel';
const debugLog = debug('SSKTS ');

/**
 * 取引開始
 * @memberOf Purchase.TransactionModule
 * @function start
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<Response>}
 */
// tslint:disable-next-line:variable-name
export async function start(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    if (req.session === undefined || !Boolean(req.body.id)) {
        return res.json({ redirect: null, err: req.__('common.error.property') });
    }
    const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
    try {
        if (purchaseModel.transactionMP !== null && purchaseModel.reserveSeats !== null) {
            //重複確認へ
            return res.json({ redirect: `/purchase/${req.body.id}/overlap`, err: null });
        }
        // 取引開始
        const minutes = 30;
        purchaseModel.expired = moment().add('minutes', minutes).unix();
        purchaseModel.transactionMP = await MP.transactionStart({
            expires_at: purchaseModel.expired
        });
        debugLog('MP取引開始', purchaseModel.transactionMP.attributes.owners);
        delete req.session.purchase;
        delete req.session.mvtk;
        delete req.session.complete;
        //セッション更新
        req.session.purchase = purchaseModel.toSession();
        //座席選択へ
        return res.json({ redirect: `/purchase/seat/${req.body.id}/`, err: null });
    } catch (err) {
        return res.json({ redirect: null, err: err.message });
    }
}
