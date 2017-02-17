"use strict";
const PurchaseSession = require("../../models/Purchase/PurchaseModel");
/**
 * 購入完了
 * @namespace
 */
var CompleteModule;
(function (CompleteModule) {
    /**
     * 購入完了表示
     * @function
     */
    function index(req, res, next) {
        if (!req.session)
            return next(req.__('common.error.property'));
        if (!req.session.complete)
            return next(new Error(req.__('common.error.access')));
        //購入者内容確認表示
        const complete = req.session.complete;
        res.locals.input = complete.input;
        res.locals.performance = complete.performance;
        res.locals.reserveSeats = complete.reserveSeats;
        res.locals.reserveTickets = complete.reserveTickets;
        res.locals.step = PurchaseSession.PurchaseModel.COMPLETE_STATE;
        res.locals.price = complete.price;
        res.locals.updateReserve = complete.updateReserve;
        return res.render('purchase/complete');
    }
    CompleteModule.index = index;
})(CompleteModule || (CompleteModule = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CompleteModule;
