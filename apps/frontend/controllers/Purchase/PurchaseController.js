"use strict";
const BaseController_1 = require("../BaseController");
class PurchaseController extends BaseController_1.default {
    deleteSession() {
        if (!this.req.session)
            return;
        delete this.req.session['gmo_token_object'];
        delete this.req.session['purchaseInfo'];
        delete this.req.session['performance'];
        delete this.req.session['purchaseSeats'];
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PurchaseController;
