"use strict";
const PurchaseSession = require("../../../models/Purchase/PurchaseModel");
var MvtkConfirmModule;
(function (MvtkConfirmModule) {
    function index(req, res, next) {
        if (!req.session)
            return next(req.__('common.error.property'));
        let purchaseModel = new PurchaseSession.PurchaseModel(req.session['purchase']);
        if (!purchaseModel.transactionMP)
            return next(new Error(req.__('common.error.property')));
        res.locals['error'] = null;
        res.locals['step'] = 2;
        res.locals['transactionId'] = purchaseModel.transactionMP._id;
        return res.render('purchase/mvtk/confirm');
    }
    MvtkConfirmModule.index = index;
    function submit(req, res, next) {
        if (!req.session)
            return next(req.__('common.error.property'));
        let purchaseModel = new PurchaseSession.PurchaseModel(req.session['purchase']);
        if (!purchaseModel.transactionMP)
            return next(new Error(req.__('common.error.property')));
        if (req.body.transaction_id !== purchaseModel.transactionMP._id)
            return next(new Error(req.__('common.error.access')));
        return res.redirect('/purchase/input');
    }
    MvtkConfirmModule.submit = submit;
})(MvtkConfirmModule || (MvtkConfirmModule = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MvtkConfirmModule;
