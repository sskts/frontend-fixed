"use strict";
const PurchaseController_1 = require('./PurchaseController');
class ConfirmPurchaseController extends PurchaseController_1.default {
    /**
     * 購入者内容確認
     */
    index() {
        //購入者内容確認表示
        this.res.locals['provisionalReservationNumber'] = this.req.session['provisionalReservationNumber'];
        this.res.locals['info'] = this.req.session['purchaseInfo'];
        this.res.locals['data'] = this.req.session['purchasePerformanceData'];
        this.res.locals['film'] = this.req.session['purchasePerformanceFilm'];
        this.res.locals['seats'] = this.req.session['purchaseSeats'];
        this.res.locals['step'] = 3;
        this.res.render('purchase/confirmPurchase');
    }
    /**
     * 購入確定
     */
    purchase() {
        //モーションAPI仮予約
        //購入完了1もしくは購入完了2の情報を返す
        this.res.json();
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ConfirmPurchaseController;
