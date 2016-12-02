import BaseController from '../BaseController';


export default class ReservationController extends BaseController {
    /**
     * トークンチェック
     * 
     */
    protected checkToken(): void {
         if (this.req.body['token'] !== this.req.session['reservationToken']) {
            this.next(new Error('無効なアクセスです'));
        }
    }
}
