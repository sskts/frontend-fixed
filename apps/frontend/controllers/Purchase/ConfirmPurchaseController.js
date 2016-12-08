"use strict";
const PurchaseController_1 = require('./PurchaseController');
class ConfirmPurchaseController extends PurchaseController_1.default {
    /**
     * 購入者内容確認
     */
    index() {
        this.checkGet();
        this.logger.debug('購入者情報入力表示', this.req.session['reservationNo']);
        //購入者内容確認表示
        this.res.locals['reservationNo'] = this.req.session['reservationNo'];
        this.res.locals['gmoTokenObject'] = this.req.session['gmoTokenObject'];
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
        //モーションAPI仮購入
        let token = this.req.params.token;
        let toBeExpiredAt = this.req.params.toBeExpiredAt;
        let isSecurityCodeSet = this.req.params.isSecurityCodeSet;
        let reservationNo = this.req.params.reservationNo;
        this.logger.debug('仮購入', {
            token: token,
            reservationNo: reservationNo
        });
        this.deleteSession();
        let purchaseNo = '1234567889';
        this.logger.debug('購入確定', purchaseNo);
        //購入完了1もしくは購入完了2の情報を返す
        this.res.json({
            purchaseNo: purchaseNo
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ConfirmPurchaseController;
