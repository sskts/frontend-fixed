"use strict";
const ReservationController_1 = require('./ReservationController');
class ConfirmPurchaseController extends ReservationController_1.default {
    /**
     * 購入者内容確認
     */
    index() {
        this.logger.debug('session', this.req.session);
        this.logger.debug('seats', this.req.session['reservationFilm']['seats']);
        this.logger.debug('tickets', this.req.session['reservationFilm']['tickets']);
        //購入者内容確認表示
        this.res.locals['token'] = this.req.session['reservationToken'];
        this.res.locals['info'] = this.req.session['reservationInfo'];
        this.res.locals['film'] = this.req.session['reservationFilm'];
        this.res.render('reservation/confirmPurchase');
    }
    /**
     * 購入確定
     */
    purchase() {
        this.checkToken();
        //モーションAPI仮予約
        //購入完了1もしくは購入完了2の情報を返す
        this.res.json();
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ConfirmPurchaseController;
