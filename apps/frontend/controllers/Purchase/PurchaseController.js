"use strict";
const BaseController_1 = require('../BaseController');
class PurchaseController extends BaseController_1.default {
    /**
     * 仮予約チェック
     */
    checkProvisionalReservationNumber() {
        this.checkSession('provisionalReservationNumber');
        if (this.req.body['provisionalReservationNumber'] !== this.req.session['provisionalReservationNumber']) {
            this.next(new Error('無効なアクセスです'));
        }
    }
    /**
     * セッションチェック
     */
    checkSession(name) {
        if (!this.req.session[name]) {
            this.next(new Error('無効なアクセスです'));
        }
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PurchaseController;
