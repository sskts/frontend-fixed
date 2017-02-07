"use strict";
const MvtkController_1 = require("./MvtkController");
class MvtkAuthController extends MvtkController_1.default {
    index() {
        if (!this.req.session)
            return this.next(this.req.__('common.error.property'));
        if (this.req.session['performance']
            && this.req.session['reserveSeats']
            && this.req.session['reserveTickets']) {
            this.res.locals['error'] = null;
            this.res.locals['step'] = 2;
            return this.res.render('purchase/mvtk/auth');
        }
        else {
            return this.next(new Error(this.req.__('common.error.access')));
        }
    }
    submit() {
        if (!this.router)
            return this.next(this.req.__('common.error.property'));
        return this.res.redirect(this.router.build('purchase.mvtk.confirm', {}));
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MvtkAuthController;
