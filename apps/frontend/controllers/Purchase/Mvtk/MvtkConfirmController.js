"use strict";
const MvtkController_1 = require("./MvtkController");
const PurchaseController_1 = require("../PurchaseController");
class MvtkConfirmController extends MvtkController_1.default {
    index() {
        if (!this.req.session)
            return this.next(new Error('session is undefined'));
        if (this.purchaseModel) {
            this.res.locals['error'] = null;
            this.res.locals['step'] = 2;
            return this.res.render('purchase/mvtk/confirm');
        }
        else {
            return this.next(new Error(PurchaseController_1.default.ERROR_MESSAGE_ACCESS));
        }
    }
    submit() {
        if (!this.router)
            return this.next(new Error('router is undefined'));
        return this.res.redirect(this.router.build('purchase.input', {}));
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MvtkConfirmController;
