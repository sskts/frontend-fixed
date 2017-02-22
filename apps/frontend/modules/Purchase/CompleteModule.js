/**
 * 購入完了
 * @namespace Purchase.CompleteModule
 */
"use strict";
const PurchaseSession = require("../../models/Purchase/PurchaseModel");
/**
 * 購入完了表示
 * @memberOf Purchase.CompleteModule
 * @function index
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
function index(req, res, next) {
    if (!req.session)
        return next(req.__('common.error.property'));
    if (!req.session.complete)
        return next(new Error(req.__('common.error.access')));
    //購入者内容確認表示
    const complete = req.session.complete;
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
exports.index = index;
