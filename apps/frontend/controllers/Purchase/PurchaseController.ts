import BaseController from '../BaseController';


export default class PurchaseController extends BaseController {
    /**
     * 仮予約チェック（POST）
     */
    protected checkPost(): void {
        let target: string = 'reservationNo';
        if (this.req.body[target] !== this.req.session[target]) {
            this.next(new Error('無効なアクセスです'));
        }
    }

    /**
     * 仮予約チェック（GET）
     */
    protected checkGet(): void {
        let target: string = 'reservationNo';
        if (!this.req.session[target]) {
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

    /**
     * セッション削除
     */
    protected deleteSession(): void {
        this.req.session['reservationNo'] = null;
        this.req.session['gmoTokenObject'] = null;
        this.req.session['purchaseInfo'] = null;
        this.req.session['purchasePerformanceData'] = null;
        this.req.session['purchasePerformanceFilm'] = null;
        this.req.session['purchaseSeats'] = null;
    }

    

}
