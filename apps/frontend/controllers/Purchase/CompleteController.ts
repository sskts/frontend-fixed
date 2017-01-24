import PurchaseController from './PurchaseController';
import PurchaseSession = require('../../models/Purchase/PurchaseModel');

export default class ConfirmController extends PurchaseController {
    /**
     * 購入完了表示
     */
    public index(): void {
        if (!this.req.session) return this.next(new Error('session is undefined'));
        if (!this.req.session['complete']) return this.next(new Error('無効なアクセスです'));
        

        //購入者内容確認表示
        this.res.locals['input'] = this.req.session['complete'].input;
        this.res.locals['performance'] = this.req.session['complete'].performance;
        this.res.locals['reserveSeats'] = this.req.session['complete'].reserveSeats;
        this.res.locals['reserveTickets'] = this.req.session['complete'].reserveTickets;
        this.res.locals['step'] = PurchaseSession.PurchaseModel.COMPLETE_STATE;
        this.res.locals['price'] = this.req.session['complete'].price;
        this.res.locals['updateReserve'] = this.req.session['complete'].updateReserve;

        this.res.render('purchase/complete');

    }

}
