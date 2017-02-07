"use strict";
const MvtkController_1 = require("./MvtkController");
class MvtkInputController extends MvtkController_1.default {
    index() {
        if (!this.req.session)
            return this.next(this.req.__('common.error.property'));
        if (this.purchaseModel) {
            this.res.locals['error'] = null;
            this.res.locals['step'] = 2;
            return this.res.render('purchase/mvtk/input');
        }
        else {
            return this.next(new Error(this.req.__('common.error.access')));
        }
    }
    auth() {
        if (!this.router)
            return this.next(this.req.__('common.error.property'));
        return this.res.redirect(this.router.build('purchase.mvtk.confirm', {}));
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MvtkInputController;
