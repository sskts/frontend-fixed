import express = require('express');
import PurchaseSession = require('../../models/Purchase/PurchaseModel');



namespace CompleteModule {
    /**
     * 購入完了表示
     */
    export function index(req: express.Request, res: express.Response, next: express.NextFunction): void {
        if (!req.session) return next(req.__('common.error.property'));
        if (!req.session['complete']) return next(new Error(req.__('common.error.access')));
        

        //購入者内容確認表示
        res.locals['input'] = req.session['complete'].input;
        res.locals['performance'] = req.session['complete'].performance;
        res.locals['reserveSeats'] = req.session['complete'].reserveSeats;
        res.locals['reserveTickets'] = req.session['complete'].reserveTickets;
        res.locals['step'] = PurchaseSession.PurchaseModel.COMPLETE_STATE;
        res.locals['price'] = req.session['complete'].price;
        res.locals['updateReserve'] = req.session['complete'].updateReserve;
        

        return res.render('purchase/complete');

    }
}

export default CompleteModule;