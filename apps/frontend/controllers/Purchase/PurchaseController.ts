import BaseController from '../BaseController';


export default class PurchaseController extends BaseController {
    /**
     * トークンチェック
     * 
     */
    protected checkToken(): void {
        if (this.req.body['token'] !== this.req.session['purchaseToken']) {
            this.next(new Error('無効なアクセスです'));
        }
    }
}
