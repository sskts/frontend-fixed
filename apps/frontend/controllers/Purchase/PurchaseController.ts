import BaseController from '../BaseController';


export default class PurchaseController extends BaseController {

    /**
     * セッション削除
     */
    protected deleteSession(): void {
        if (!this.req.session) return;
        delete this.req.session['purchaseInfo']
        // delete this.req.session['performance']
        delete this.req.session['reserveSeats']
        delete this.req.session['reserveTickets']
        delete this.req.session['updateReserve']
        delete this.req.session['gmoTokenObject'];
    }

}
