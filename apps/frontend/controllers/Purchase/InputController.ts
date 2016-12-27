import config = require('config');
import PurchaseController from './PurchaseController';
import EnterPurchaseForm from '../../forms/Purchase/EnterPurchaseForm';

export default class EnterPurchaseController extends PurchaseController {
    /**
     * 購入者情報入力
     */
    public index(): void {
        if (this.checkSession('reservationNo')
        && this.checkSession('performance')
        && this.checkSession('purchaseSeats')) {
        this.logger.debug('購入者情報入力表示', this.req.session['reservationNo']);
        //購入者情報入力表示
        this.res.locals['reservationNo'] = this.req.session['reservationNo'];
        this.res.locals['error'] = null;
        this.res.locals['info'] = null;
        this.res.locals['moment'] = require('moment');
        this.res.locals['step'] = 2;
        this.res.locals['gmoModuleUrl'] = config.get<string>('gmo_module_url');
        this.res.locals['gmoShopId'] = config.get<string>('gmo_shop_id');
        
        if (process.env.NODE_ENV === 'dev') {
            this.res.locals['info'] = {
                last_name_kanji: '畑口',
                first_name_kanji: '晃人',
                last_name_hira: 'はたぐち',
                first_name_hira: 'あきと',
                mail: 'hataguchi@motionpicture.jp',
                mail_confirm: 'hataguchi@motionpicture.jp',
                tel: '09040007648'
            }
        }

        this.res.render('purchase/input');
        } else {
            return this.next(new Error('無効なアクセスです'));
        }
    }

    /**
     * 購入者情報入力完了
     */
    public submit(): void {
        if (this.checkSession('reservationNo')) {
        
            //モーションAPI

            //バリデーション
            EnterPurchaseForm(this.req, this.res, () => {
                if (this.req.form.isValid) {
                    //モーションAPIで仮決済（GMOトークンと予約番号）


                    //入力情報をセッションへ
                    this.req.session['purchaseInfo'] = {
                        last_name_kanji: this.req.body.last_name_kanji,
                        first_name_kanji: this.req.body.first_name_kanji,
                        last_name_hira: this.req.body.last_name_hira,
                        first_name_hira: this.req.body.first_name_hira,
                        mail: this.req.body.mail,
                        tel: this.req.body.tel,
                    };
                    //決済情報をセッションへ
                    this.req.session['gmo_token_object'] = JSON.parse(this.req.body.gmo_token_object);
                    this.logger.debug('購入者情報入力完了', {
                        info: this.req.session['purchaseInfo'],
                        gmo: this.req.session['gmo_token_object']
                    });
                    //購入者内容確認へ
                    this.res.redirect(this.router.build('purchase.confirm', {}));
                } else {
                    this.res.locals['reservationNo'] = this.req.session['reservationNo'];
                    this.res.locals['error'] = this.req.form.getErrors();
                    this.res.locals['info'] = this.req.body;
                    this.res.locals['moment'] = require('moment');
                    this.res.locals['step'] = 2;
                    this.res.locals['gmoModuleUrl'] = config.get<string>('gmo_module_url');
                    this.res.locals['gmoShopId'] = config.get<string>('gmo_shop_id');
                    this.res.render('purchase/enterPurchase');
                }
            });
        } else {
            return this.next(new Error('無効なアクセスです'));
        }
    }


}
