"use strict";
const PurchaseSession = require("../../../models/Purchase/PurchaseModel");
var MvtkInputModule;
(function (MvtkInputModule) {
    function index(req, res, next) {
        if (!req.session)
            return next(req.__('common.error.property'));
        const purchaseModel = new PurchaseSession.PurchaseModel(req.session['purchase']);
        if (!purchaseModel.transactionMP)
            return next(new Error(req.__('common.error.property')));
        res.locals.error = null;
        res.locals.step = 2;
        res.locals.transactionId = purchaseModel.transactionMP._id;
        return res.render('purchase/mvtk/input');
    }
    MvtkInputModule.index = index;
    function auth(req, res, next) {
        if (!req.session)
            return next(req.__('common.error.property'));
        const purchaseModel = new PurchaseSession.PurchaseModel(req.session['purchase']);
        if (!purchaseModel.transactionMP)
            return next(new Error(req.__('common.error.property')));
        if (req.body.transaction_id !== purchaseModel.transactionMP._id)
            return next(new Error(req.__('common.error.access')));
        return res.redirect('/purchase/mvtk/confirm');
    }
    MvtkInputModule.auth = auth;
})(MvtkInputModule || (MvtkInputModule = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MvtkInputModule;
