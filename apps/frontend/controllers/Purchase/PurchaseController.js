"use strict";
const BaseController_1 = require("../BaseController");
class PurchaseController extends BaseController_1.default {
    deleteSession() {
        if (!this.req.session)
            return;
        delete this.req.session['purchaseInfo'];
        delete this.req.session['reserveSeats'];
        delete this.req.session['reserveTickets'];
        delete this.req.session['updateReserve'];
        delete this.req.session['gmoTokenObject'];
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PurchaseController;
