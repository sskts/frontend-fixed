import BaseController from '../BaseController';


export default class InquiryController extends BaseController {
    /**
     * 照会認証ページ表示
     */
    public login(): void {
        

    }
    

    /**
     * 照会認証
     */
    public auth(): void {
        
        
    }

    /**
     * 照会確認ページ表示
     */
    public index(): void {
        if (this.req.session && this.req.session['inquiry']) {
            this.res.locals['inquiry'] = this.req.session['inquiry'];
            this.res.render('inquiry/confirm');
        } else {
            return this.next(new Error('無効なアクセスです'));
        }


    }

    /**
     * 照会印刷
     */
    public print(): void {
        
        
    }


}
