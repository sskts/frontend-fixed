/**
 * 取引
 * @namespace Purchase.TransactionModule
 */

import * as express from 'express';
import * as moment from 'moment';
import * as MP from '../../../../libs/MP';
import * as PurchaseSession from '../../models/Purchase/PurchaseModel';

/**
 * 取引開始
 * @memberOf Purchase.TransactionModule
 * @function start
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
export function start(req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (!req.params || !req.params.id) return next(new Error(req.__('common.error.access')));
    if (!req.session) return next(new Error(req.__('common.error.property')));
    const purchaseModel = new PurchaseSession.PurchaseModel((<any>req.session).purchase);
    if (purchaseModel.transactionMP && purchaseModel.reserveSeats) {

        //重複確認へ
        return res.redirect('/purchase/' + req.params.id + '/overlap');
    }

    transactionStart(purchaseModel).then(() => {
        if (!req.session) return next(new Error(req.__('common.error.property')));
        delete (<any>req.session).purchase;
        //セッション更新
        (<any>req.session).purchase = purchaseModel.formatToSession();
        //座席選択へ
        return res.redirect('/purchase/seat/' + req.params.id + '/');
    }).catch((err) => {
        return next(new Error(err.message));
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
        expired_at: purchaseModel.expired
    });
    console.log('MP取引開始', purchaseModel.transactionMP.attributes.owners);
}
