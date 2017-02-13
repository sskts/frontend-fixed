
import express = require('express');
import PurchaseSession = require('../../../models/Purchase/PurchaseModel');

namespace MvtkConfirmModule {
    /**
     * ムビチケ券適用確認ページ表示
     */
    export function index(req: express.Request, res: express.Response, next: express.NextFunction) {
        if (!req.session) return next(req.__('common.error.property'));
        let purchaseModel = new PurchaseSession.PurchaseModel(req.session['purchase']);
        if (!purchaseModel.transactionMP) return next(new Error(req.__('common.error.property')));
        //購入者情報入力表示
        res.locals.error = null;
        res.locals.step = 2;
        res.locals.transactionId = purchaseModel.transactionMP._id;
        return res.render('purchase/mvtk/confirm');

    }

    /**
     * 購入者情報入力へ
     */
    export function submit(req: express.Request, res: express.Response, next: express.NextFunction) {
        if (!req.session) return next(req.__('common.error.property'));
        const purchaseModel = new PurchaseSession.PurchaseModel(req.session['purchase']);
        if (!purchaseModel.transactionMP) return next(new Error(req.__('common.error.property'))); 

        //取引id確認
        if (req.body.transaction_id !== purchaseModel.transactionMP._id) return next(new Error(req.__('common.error.access')));

        return res.redirect('/purchase/input');
    }
}

export default MvtkConfirmModule;