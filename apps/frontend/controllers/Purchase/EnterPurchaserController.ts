import PurchaseController from './PurchaseController';
import EnterPurchaserForm from '../../forms/Purchase/EnterPurchaserForm';

export default class EnterPurchaserController extends PurchaseController {
    /**
     * 購入者情報入力
     */
    public index(): void {
        this.checkSession('provisionalReservationNumber');
        //購入者情報入力表示
        this.res.locals['provisionalReservationNumber'] = this.req.session['provisionalReservationNumber'];
        this.res.locals['error'] = null;
        this.res.locals['info'] = null;
        this.res.locals['moment'] = require('moment');
        this.res.locals['step'] = 2;
        if (process.env.NODE_ENV === 'dev') {
            this.res.locals['info'] = {
                lastNameKanji: '畑口',
                firstNameKanji: '晃人',
                lastNameHira: 'はたぐち',
                firstNameHira: 'あきと',
                mail: 'hataguchi@motionpicture.jp',
                mailConfirm: 'hataguchi@motionpicture.jp',
                tel: '09040007648'
            }
        }

        this.res.render('purchase/enterPurchaser');
    }

    /**
     * 購入者情報入力完了
     */
    public submit(): void {
        this.checkProvisionalReservationNumber();
        //モーションAPI

        //バリデーション
        EnterPurchaserForm(this.req, this.res, () => {
            if (this.req.form.isValid && this.req.body.creditToken) {
                //モーションAPIで仮決済（GMOトークンと予約番号）


                //入力情報をセッションへ
                this.req.session['purchaseInfo'] = this.req.body;
                //購入者内容確認へ
                this.res.redirect(this.router.build('purchase.confirmPurchase', {}));
            } else {
                this.res.locals['provisionalReservationNumber'] = this.req.session['provisionalReservationNumber'];
                this.res.locals['error'] = this.req.form.getErrors();
                this.res.locals['info'] = this.req.body;
                this.res.locals['moment'] = require('moment');
                this.res.locals['step'] = 2;
                this.res.render('purchase/enterPurchaser');
            }
        });
    }


}
