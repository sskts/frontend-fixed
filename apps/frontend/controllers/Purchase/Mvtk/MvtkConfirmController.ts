import MvtkController from './MvtkController';


export default class MvtkConfirmController extends MvtkController {

    /**
     * ムビチケ券適用確認ページ表示
     */
    public index() {
        if (this.checkSession('reservationNo')
            && this.checkSession('performance')
            && this.checkSession('purchaseSeats')) {
            this.logger.debug('ムビチケ券入力ページ表示', this.req.session['reservationNo']);
            //購入者情報入力表示
            this.res.locals['reservationNo'] = this.req.session['reservationNo'];
            this.res.locals['error'] = null;
            this.res.locals['step'] = 2;

            this.res.render('purchase/mvtk/this.res.render('purchase/mvtk/confirm');');
        } else {
            return this.next(new Error('無効なアクセスです'));
        }
        
    }

    /**
     * 購入者情報入力へ
     */
    public submit() {
        this.res.redirect(this.router.build('purchase.input', {}));
    }

    

}
