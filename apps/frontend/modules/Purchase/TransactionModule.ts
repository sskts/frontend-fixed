import express = require('express');
import PurchaseSession = require('../../models/Purchase/PurchaseModel');
import MP = require('../../../../libs/MP');
import moment = require('moment');

export namespace Module {
    /**
     * 取引開始
     */
    export function start(req: express.Request, res: express.Response, next: express.NextFunction): void {
        if (!req.params || !req.params['id']) return next(new Error(req.__('common.error.access')));
        if (!req.session) return next(req.__('common.error.property'));
        let purchaseModel = new PurchaseSession.PurchaseModel(req.session['purchase']);
        if (purchaseModel.transactionMP && purchaseModel.reserveSeats) {
            
            //重複確認へ
            return res.redirect('/purchase/' + req.params['id'] + '/overlap');
        }

        transactionStart(purchaseModel).then(() => {
            if (!req.session) return next(req.__('common.error.property'));
            delete req.session['purchase'];
            //セッション更新
            req.session['purchase'] = purchaseModel.formatToSession();
            //座席選択へ 
            return res.redirect('/purchase/seat/' + req.params['id'] + '/');
        }, (err) => {
            return next(new Error(err.message));
        });
    }

     /**
     * 取引開始
     */
    async function transactionStart(purchaseModel: PurchaseSession.PurchaseModel): Promise<void> {
        // 取引開始
        purchaseModel.expired = moment().add('minutes', 30).unix();
        purchaseModel.transactionMP = await MP.transactionStart.call({
            expired_at: purchaseModel.expired,
        });
        console.log('MP取引開始', purchaseModel.transactionMP.attributes.owners);
    }
}