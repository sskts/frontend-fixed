import ReservationController from './ReservationController';
import EnterPurchaserForm from '../../forms/Reservation/EnterPurchaserForm';

export default class EnterPurchaserController extends ReservationController {
    /**
     * 購入者情報入力
     */
    public index(): void {
        this.logger.debug('session', this.req.session['reservationInfo'])
        
        //購入者情報入力表示
        this.res.locals['token'] = this.req.session['reservationToken'];
        this.res.locals['error'] = null;
        this.res.locals['info'] = null;
        this.res.locals['moment'] = require('moment');
        this.res.render('reservation/enterPurchaser');
    }

    /**
     * 購入者情報入力完了
     */
    public enterPurchaser(): void {
        this.checkToken();
        //モーションAPI

        //バリデーション
        EnterPurchaserForm(this.req, this.res, () => {
            if (this.req.form.isValid) {
                //入力情報をセッションへ
                this.req.session['reservationInfo'] = this.req.body;
                //購入者内容確認へ
                this.res.redirect(this.router.build('reservation.confirmPurchase', {}));
            } else {
                this.res.locals['token'] = this.req.body['token'];
                this.res.locals['error'] = this.req.form.getErrors();
                this.res.locals['info'] = this.req.body;
                this.res.locals['moment'] = require('moment');
                this.res.render('reservation/enterPurchaser');
            }
        });
    }


}
