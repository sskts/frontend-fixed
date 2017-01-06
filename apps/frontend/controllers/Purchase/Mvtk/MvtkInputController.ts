import MvtkController from './MvtkController';


export default class MvtkInputController extends MvtkController {

    /**
     * ムビチケ券入力ページ表示
     */
    public index() {
        if (this.req.session
        && this.req.session['performance']
        && this.req.session['purchaseSeats']) {

            //購入者情報入力表示
            this.res.locals['error'] = null;
            this.res.locals['step'] = 2;

            this.res.render('purchase/mvtk/input');
        } else {
            return this.next(new Error('無効なアクセスです'));
        }

    }

    /**
     * 認証
     */
    public auth() {
        if (!this.router) return this.next(new Error('router is undefined'));
        this.res.redirect(this.router.build('purchase.mvtk.confirm', {}));
    }



}
