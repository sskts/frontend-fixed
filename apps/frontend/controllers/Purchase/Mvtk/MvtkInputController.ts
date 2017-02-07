import MvtkController from './MvtkController';

export default class MvtkInputController extends MvtkController {

    /**
     * ムビチケ券入力ページ表示
     */
    public index() {
        if (!this.req.session) return this.next(this.req.__('common.error.property'));
        if (this.purchaseModel) {

            //購入者情報入力表示
            this.res.locals['error'] = null;
            this.res.locals['step'] = 2;

            return this.res.render('purchase/mvtk/input');
        } else {
            return this.next(new Error(this.req.__('common.error.access')));
        }

    }

    /**
     * 認証
     */
    public auth() {
        if (!this.router) return this.next(this.req.__('common.error.property'));
        return this.res.redirect(this.router.build('purchase.mvtk.confirm', {}));
    }



}
