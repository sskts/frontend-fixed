import BaseController from '../BaseController';


export default class PurchaseController extends BaseController {

    /**
     * セッション削除
     */
    protected deleteSession(): void {
        delete this.req.session['gmo_token_object'];
        delete this.req.session['purchaseInfo'];
        delete this.req.session['performance'];
        delete this.req.session['purchaseSeats'];
    }

    

}
