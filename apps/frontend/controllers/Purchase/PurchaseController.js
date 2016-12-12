"use strict";
const BaseController_1 = require('../BaseController');
class PurchaseController extends BaseController_1.default {
    /**
     * セッションチェック
     */
    checkSession(name) {
        if (!this.req.session[name]) {
            return false;
        }
        return true;
    }
    /**
     * セッション削除
     */
    deleteSession() {
        delete this.req.session['reservationNo'];
        delete this.req.session['gmoTokenObject'];
        delete this.req.session['purchaseInfo'];
        delete this.req.session['purchasePerformanceData'];
        delete this.req.session['purchasePerformanceFilm'];
        delete this.req.session['purchaseSeats'];
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PurchaseController;
