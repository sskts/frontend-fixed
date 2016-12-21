import BaseController from '../BaseController';


export default class InquiryConfirmController extends BaseController {
    /**
     * 照会確認ページ表示
     */
    public index(): void {
        if (this.checkSession('inquiry')) {
            this.res.locals['inquiry'] = this.req.session['inquiry'];
            this.res.render('inquiry/confirm');
        } else {
            return this.next(new Error('無効なアクセスです'));
        }


    }


}
