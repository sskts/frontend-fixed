import BaseController from '../BaseController';


export default class PurchaseController extends BaseController {

    /**
     * セッション削除
     */
    protected deleteSession(): void {
        delete this.req.session['reservationNo'];
        delete this.req.session['gmoTokenObject'];
        delete this.req.session['purchaseInfo'];
        delete this.req.session['performance'];
        delete this.req.session['purchaseSeats'];
    }

    

}
