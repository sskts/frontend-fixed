"use strict";
const PurchaseSession = require("../../models/Purchase/PurchaseModel");
var Module;
(function (Module) {
    function index(req, res, next) {
        if (!req.session)
            return next(req.__('common.error.property'));
        if (!req.session['complete'])
            return next(new Error(req.__('common.error.access')));
        res.locals['input'] = req.session['complete'].input;
        res.locals['performance'] = req.session['complete'].performance;
        res.locals['reserveSeats'] = req.session['complete'].reserveSeats;
        res.locals['reserveTickets'] = req.session['complete'].reserveTickets;
        res.locals['step'] = PurchaseSession.PurchaseModel.COMPLETE_STATE;
        res.locals['price'] = req.session['complete'].price;
        res.locals['updateReserve'] = req.session['complete'].updateReserve;
        return res.render('purchase/complete');
    }
    Module.index = index;
})(Module = exports.Module || (exports.Module = {}));
