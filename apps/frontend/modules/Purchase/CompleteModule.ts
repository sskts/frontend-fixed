/**
 * 購入完了
 * @namespace Purchase.CompleteModule
 */

import * as express from 'express';
import * as PurchaseSession from '../../models/Purchase/PurchaseModel';

/**
 * 購入完了表示
 * @memberOf Purchase.CompleteModule
 * @function index
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
export function index(req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (!req.session) return next(req.__('common.error.property'));
    if (!(<any>req.session).complete) return next(new Error(req.__('common.error.access')));

    //購入者内容確認表示
    const complete = (<any>req.session).complete;
    res.locals.input = complete.input;
    res.locals.performance = complete.performance;
    res.locals.reserveSeats = complete.reserveSeats;
    res.locals.reserveTickets = complete.reserveTickets;
    res.locals.step = PurchaseSession.PurchaseModel.COMPLETE_STATE;
    res.locals.price = complete.price;
    res.locals.updateReserve = complete.updateReserve;

    return res.render('purchase/complete');

}
