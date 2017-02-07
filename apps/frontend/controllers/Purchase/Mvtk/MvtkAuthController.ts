import MvtkController from './MvtkController';

export default class MvtkAuthController extends MvtkController {

    /**
     * ムビチケ券認証ページ表示
     */
    public index() {
        if (!this.req.session) return this.next(this.req.__('common.error.property'));
        if (this.req.session['performance']
            && this.req.session['reserveSeats']
            && this.req.session['reserveTickets']) {

            //購入者情報入力表示
            this.res.locals['error'] = null;
            this.res.locals['step'] = 2;

            return this.res.render('purchase/mvtk/auth');
        } else {
            return this.next(new Error(this.req.__('common.error.access')));
        }
        
    }
    

    /**
     * 適用
     */
    public submit() {
        if (!this.router) return this.next(this.req.__('common.error.property'));
        return this.res.redirect(this.router.build('purchase.mvtk.confirm', {}));
    }

    

}
