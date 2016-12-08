"use strict";
const BaseController_1 = require('../BaseController');
class PurchaseController extends BaseController_1.default {
    /**
     * 仮予約チェック（POST）
     */
    checkPost() {
        let target = 'reservationNo';
        if (this.req.body[target] !== this.req.session[target]) {
            this.next(new Error('無効なアクセスです'));
        }
    }
    /**
     * 仮予約チェック（GET）
     */
    checkGet() {
        let target = 'reservationNo';
        if (!this.req.session[target]) {
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
    /**
     * セッション削除
     */
    deleteSession() {
        this.req.session['reservationNo'] = null;
        this.req.session['gmoTokenObject'] = null;
        this.req.session['purchaseInfo'] = null;
        this.req.session['purchasePerformanceData'] = null;
        this.req.session['purchasePerformanceFilm'] = null;
        this.req.session['purchaseSeats'] = null;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PurchaseController;
