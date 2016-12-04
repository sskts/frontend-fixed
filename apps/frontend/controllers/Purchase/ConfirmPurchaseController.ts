import PurchaseController from './PurchaseController';


export default class ConfirmPurchaseController extends PurchaseController {
    /**
     * 購入者内容確認
     */
    public index(): void {
        this.logger.debug('session', this.req.session)
        this.logger.debug('seats', this.req.session['purchaseFilm']['seats'])
        this.logger.debug('tickets', this.req.session['purchaseFilm']['tickets'])
        //購入者内容確認表示
        this.res.locals['token'] = this.req.session['purchaseToken'];
        this.res.locals['info'] = this.req.session['purchaseInfo'];
        this.res.locals['film'] = this.req.session['purchaseFilm'];
        this.res.render('purchase/confirmPurchase');
    }

    /**
     * 購入確定
     */
    public purchase(): void {
        this.checkToken();
        //モーションAPI仮予約

        //購入完了1もしくは購入完了2の情報を返す
        this.res.json();
    }


}
