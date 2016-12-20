import BaseController from '../BaseController';


export default class PurchaseController extends BaseController {
    

    /**
     * セッションチェック
     */
    protected checkSession(name: string): boolean {
        if (!this.req.session[name]) {
            return false;
        }
        return true;
    }

    /**
     * セッション削除
     */
    protected deleteSession(): void {
        // delete this.req.session['reservationNo'];
        // delete this.req.session['gmoTokenObject'];
        // delete this.req.session['purchaseInfo'];
        // delete this.req.session['purchasePerformanceData'];
        // delete this.req.session['purchasePerformanceFilm'];
        // delete this.req.session['purchaseSeats'];
    }

    

}
