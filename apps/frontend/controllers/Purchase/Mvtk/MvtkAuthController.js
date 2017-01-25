"use strict";
const MvtkController_1 = require("./MvtkController");
const PurchaseController_1 = require("../PurchaseController");
class MvtkAuthController extends MvtkController_1.default {
    index() {
        if (!this.req.session)
            return this.next(new Error('session is undefined'));
        if (this.req.session['performance']
            && this.req.session['reserveSeats']
            && this.req.session['reserveTickets']) {
            this.res.locals['error'] = null;
            this.res.locals['step'] = 2;
            this.res.render('purchase/mvtk/auth');
        }
        else {
            return this.next(new Error(PurchaseController_1.default.ERROR_MESSAGE_ACCESS));
        }
    }
    submit() {
        if (!this.router)
            return this.next(new Error('router is undefined'));
        this.res.redirect(this.router.build('purchase.mvtk.confirm', {}));
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MvtkAuthController;
