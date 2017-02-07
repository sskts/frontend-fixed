"use strict";
const MvtkController_1 = require("./MvtkController");
class MvtkConfirmController extends MvtkController_1.default {
    index() {
        if (!this.req.session)
            return this.next(this.req.__('common.error.property'));
        if (this.purchaseModel) {
            this.res.locals['error'] = null;
            this.res.locals['step'] = 2;
            return this.res.render('purchase/mvtk/confirm');
        }
        else {
            return this.next(new Error(this.req.__('common.error.access')));
        }
    }
    submit() {
        if (!this.router)
            return this.next(this.req.__('common.error.property'));
        return this.res.redirect(this.router.build('purchase.input', {}));
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MvtkConfirmController;
