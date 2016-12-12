import PurchaseController from './PurchaseController';


export default class ConfirmController extends PurchaseController {
    /**
     * 購入者内容確認
     */
    public index(): void {
        if (this.checkSession('reservationNo')
        && this.checkSession('gmoTokenObject')
        && this.checkSession('purchaseInfo')
        && this.checkSession('purchasePerformanceData')
        && this.checkSession('purchasePerformanceFilm')
        && this.checkSession('purchaseSeats')) {
            this.logger.debug('購入者情報入力表示', this.req.session['reservationNo']);
            //購入者内容確認表示
            this.res.locals['reservationNo'] = this.req.session['reservationNo'];
            this.res.locals['gmoTokenObject'] = this.req.session['gmoTokenObject'];
            this.res.locals['info'] = this.req.session['purchaseInfo'];
            this.res.locals['data'] = this.req.session['purchasePerformanceData'];
            this.res.locals['film'] = this.req.session['purchasePerformanceFilm'];
            this.res.locals['seats'] = this.req.session['purchaseSeats'];
            this.res.locals['step'] = 3;
            this.res.render('purchase/confirm');
        } else {
            return this.next(new Error('無効なアクセスです'));
        }
        
    }

    /**
     * 購入確定
     */
    public purchase(): void {
        
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

        //購入完了情報を返す
        this.res.json({
            purchaseNo: purchaseNo
        });
    }


}
