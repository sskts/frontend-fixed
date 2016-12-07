import BaseController from '../BaseController';


export default class PurchaseController extends BaseController {
    /**
     * 仮予約チェック
     */
    protected checkProvisionalReservationNumber(): void {
        this.checkSession('provisionalReservationNumber');
        if (this.req.body['provisionalReservationNumber'] !== this.req.session['provisionalReservationNumber']) {
            this.next(new Error('無効なアクセスです'));
        }
    }

    /**
     * セッションチェック
     */
    protected checkSession(name: string): void {
        if (!this.req.session[name]) {
            this.next(new Error('無効なアクセスです'));
        }
    }

}
