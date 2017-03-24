/**
 * 購入完了
 * @namespace Purchase.CompleteModule
 */

import * as express from 'express';
import * as PurchaseSession from '../../models/Purchase/PurchaseModel';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';

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
    if (!req.session) return next(ErrorUtilModule.getError(req, ErrorUtilModule.ERROR_PROPERTY));
    if (!(<any>req.session).complete) return next(ErrorUtilModule.getError(req, ErrorUtilModule.ERROR_ACCESS));
    //購入者内容確認表示
    const complete = (<any>req.session).complete;
    const purchaseModel = new PurchaseSession.PurchaseModel({
        reserveSeats: complete.reserveSeats,
        reserveTickets: complete.reserveTickets
    });
    res.locals.input = complete.input;
    res.locals.performance = complete.performance;
    res.locals.reserveSeats = complete.reserveSeats;
    res.locals.reserveTickets = complete.reserveTickets;
    res.locals.step = PurchaseSession.PurchaseModel.COMPLETE_STATE;
    res.locals.price = complete.price;
    res.locals.seatStr = purchaseModel.seatToString();
    res.locals.ticketStr = purchaseModel.ticketToString();
    res.locals.updateReserve = complete.updateReserve;

    return res.render('purchase/complete');

}
