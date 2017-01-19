import config = require('config');
import PurchaseController from './PurchaseController';
import InputForm from '../../forms/Purchase/InputForm';


export default class EnterPurchaseController extends PurchaseController {
    /**
     * 購入者情報入力
     */
    public index(): void {
        if (!this.req.session) return this.next(new Error('session is undefined'));
        if (this.req.session['performance']
            && this.req.session['reserveSeats']
            && this.req.session['reserveTickets']) {

            //購入者情報入力表示
            this.res.locals['error'] = null;
            this.res.locals['info'] = null;
            this.res.locals['moment'] = require('moment');
            this.res.locals['step'] = 2;
            this.res.locals['gmoModuleUrl'] = config.get<string>('gmo_module_url');
            this.res.locals['gmoShopId'] = config.get<string>('gmo_shop_id');
            this.res.locals['price'] = this.getPrice(this.req.session);

            if (process.env.NODE_ENV === 'dev') {
                this.res.locals['info'] = {
                    //TODO　項目確認
                    // last_name_kanji: '畑口',
                    // first_name_kanji: '晃人',
                    last_name_hira: 'はたぐち',
                    first_name_hira: 'あきと',
                    mail_addr: 'hataguchi@motionpicture.jp',
                    mail_confirm: 'hataguchi@motionpicture.jp',
                    tel_num: '09040007648'
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

        //モーションAPI

        //バリデーション
        InputForm(this.req, this.res, () => {
            if (!this.req.session) return this.next(new Error('session is undefined'));
            if (!this.req.form) return this.next(new Error('form is undefined'));
            if (this.req.form.isValid) {
                //入力情報をセッションへ
                this.req.session['purchaseInfo'] = {
                    //TODO　項目確認
                    // last_name_kanji: this.req.body.last_name_kanji,
                    // first_name_kanji: this.req.body.first_name_kanji,
                    last_name_hira: this.req.body.last_name_hira,
                    first_name_hira: this.req.body.first_name_hira,
                    mail_addr: this.req.body.mail_addr,
                    tel_num: this.req.body.tel_num,
                };
                //決済情報をセッションへ
                this.req.session['gmoTokenObject'] = JSON.parse(this.req.body.gmo_token_object);
                
                if (!this.router) return this.next(new Error('router is undefined'));
                //購入者内容確認へ
                this.res.redirect(this.router.build('purchase.confirm', {}));

                

            } else {
                this.res.locals['error'] = this.req.form.getErrors();
                this.res.locals['info'] = this.req.body;
                this.res.locals['moment'] = require('moment');
                this.res.locals['step'] = 2;
                this.res.locals['gmoModuleUrl'] = config.get<string>('gmo_module_url');
                this.res.locals['gmoShopId'] = config.get<string>('gmo_shop_id');
                this.res.locals['price'] = this.getPrice(this.req.session);
                this.res.render('purchase/enterPurchase');
            }


        });
    }

    


}
