import MvtkController from './MvtkController';

export default class MvtkConfirmController extends MvtkController {

    /**
     * ムビチケ券適用確認ページ表示
     */
    public index() {
        if (!this.req.session) return this.next(this.req.__('common.error.property'));
        if (this.purchaseModel) {

            //購入者情報入力表示
            this.res.locals['error'] = null;
            this.res.locals['step'] = 2;
            
            return this.res.render('purchase/mvtk/confirm');
        } else {
            return this.next(new Error(this.req.__('common.error.access')));
        }
        
    }

    /**
     * 購入者情報入力へ
     */
    public submit() {
        if (!this.router) return this.next(this.req.__('common.error.property'));
        return this.res.redirect(this.router.build('purchase.input', {}));
    }

    

}
