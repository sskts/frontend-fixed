"use strict";
/**
 * 購入完了
 * @namespace Purchase.CompleteModule
 */
Object.defineProperty(exports, "__esModule", { value: true });
const ErrorUtilModule = require("../Util/ErrorUtilModule");
/**
 * 購入完了表示
 * @memberOf Purchase.CompleteModule
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
function index(req, res, next) {
    try {
        if (req.session === undefined)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (req.session.complete === undefined)
            throw ErrorUtilModule.ERROR_ACCESS;
        //購入者内容確認表示
        const complete = req.session.complete;
        res.locals.input = complete.input;
        res.locals.performance = complete.performance;
        res.locals.reserveSeats = complete.reserveSeats;
        res.locals.reserveTickets = complete.reserveTickets;
        res.locals.price = complete.price;
        res.locals.updateReserve = complete.updateReserve;
        res.render('purchase/complete', { layout: 'layouts/purchase/layout' });
        return;
    }
    catch (err) {
        const error = (err instanceof Error)
            ? new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message)
            : new ErrorUtilModule.CustomError(err, undefined);
        next(error);
        return;
    }
}
exports.index = index;
