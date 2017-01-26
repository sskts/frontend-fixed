import MvtkController from './MvtkController';
import PurchaseController from '../PurchaseController';

export default class MvtkConfirmController extends MvtkController {

    /**
     * ムビチケ券適用確認ページ表示
     */
    public index() {
        if (!this.req.session) return this.next(new Error('session is undefined'));
        if (this.purchaseModel) {

            //購入者情報入力表示
            this.res.locals['error'] = null;
            this.res.locals['step'] = 2;
            
            return this.res.render('purchase/mvtk/confirm');
        } else {
            return this.next(new Error(PurchaseController.ERROR_MESSAGE_ACCESS));
        }
        
    }

    /**
     * 購入者情報入力へ
     */
    public submit() {
        if (!this.router) return this.next(new Error('router is undefined'));
        return this.res.redirect(this.router.build('purchase.input', {}));
    }

    

}
