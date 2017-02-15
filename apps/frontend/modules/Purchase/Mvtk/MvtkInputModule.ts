import * as express from 'express';
import * as PurchaseSession from '../../../models/Purchase/PurchaseModel';

/**
 * ムビチケ入力
 * @namespace
 */
namespace MvtkInputModule {
    /**
     * ムビチケ券入力ページ表示
     * @function
     */
    export function index(req: express.Request, res: express.Response, next: express.NextFunction) {
        if (!req.session) return next(req.__('common.error.property'));
        const purchaseModel = new PurchaseSession.PurchaseModel(req.session['purchase']);
        if (!purchaseModel.transactionMP) return next(new Error(req.__('common.error.property')));

        //購入者情報入力表示
        res.locals.error = null;
        res.locals.step = PurchaseSession.PurchaseModel.INPUT_STATE;
        res.locals.transactionId = purchaseModel.transactionMP._id;
        return res.render('purchase/mvtk/input');

    }

    /**
     * 認証
     * @function
     */
    export function auth(req: express.Request, res: express.Response, next: express.NextFunction) {
        if (!req.session) return next(req.__('common.error.property'));
        const purchaseModel = new PurchaseSession.PurchaseModel(req.session['purchase']);
        if (!purchaseModel.transactionMP) return next(new Error(req.__('common.error.property')));

        //取引id確認
        if (req.body.transaction_id !== purchaseModel.transactionMP._id) return next(new Error(req.__('common.error.access')));

        return res.redirect('/purchase/mvtk/confirm');
    }
}

export default MvtkInputModule;
