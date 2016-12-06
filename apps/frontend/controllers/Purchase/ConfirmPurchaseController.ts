import PurchaseController from './PurchaseController';


export default class ConfirmPurchaseController extends PurchaseController {
    /**
     * 購入者内容確認
     */
    public index(): void {
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
    public purchase(): void {
        
        //モーションAPI仮予約

        //購入完了1もしくは購入完了2の情報を返す
        this.res.json();
    }


}
