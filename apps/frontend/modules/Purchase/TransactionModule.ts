/**
 * 取引
 * @namespace Purchase.TransactionModule
 */

import * as debug from 'debug';
import * as express from 'express';
import * as moment from 'moment';
import * as MP from '../../../../libs/MP';
import * as PurchaseSession from '../../models/Purchase/PurchaseModel';
const debugLog = debug('SSKTS ');

/**
 * 取引開始
 * @memberOf Purchase.TransactionModule
 * @function start
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void | express.Response}
 */
// tslint:disable-next-line:variable-name
export function start(req: express.Request, res: express.Response, _next: express.NextFunction): void | express.Response {
    if (!req.session || !req.body.id) return res.json({ redirect: null, err: req.__('common.error.property') });
    const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);

    if (purchaseModel.transactionMP && purchaseModel.reserveSeats) {
        //重複確認へ
        return res.json({ redirect: '/purchase/' + req.body.id + '/overlap', err: null });
    }

    transactionStart(purchaseModel).then(() => {
        if (!req.session) return res.json({ redirect: null, err: req.__('common.error.property') });
        delete req.session.purchase;
        delete req.session.mvtk;
        delete req.session.complete;
        //セッション更新
        req.session.purchase = purchaseModel.toSession();
        //座席選択へ
        return res.json({ redirect: '/purchase/seat/' + req.body.id + '/', err: null });
    }).catch((err) => {
        return res.json({ redirect: null, err: err.message });
    });
}

/**
 * 取引開始
 * @memberOf Purchase.TransactionModule
 * @function transactionStart
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {Promise<void>}
 */
async function transactionStart(purchaseModel: PurchaseSession.PurchaseModel): Promise<void> {
    // 取引開始
    const minutes = 30;
    purchaseModel.expired = moment().add('minutes', minutes).unix();
    purchaseModel.transactionMP = await MP.transactionStart({
        expires_at: purchaseModel.expired
    });
    debugLog('MP取引開始', purchaseModel.transactionMP.attributes.owners);
}
