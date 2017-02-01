import PurchaseController from './PurchaseController';
import InputForm from '../../forms/Purchase/InputForm';
import PurchaseSession = require('../../models/Purchase/PurchaseModel');
import config = require('config');
// import COA = require("@motionpicture/coa-service");
import GMO = require("@motionpicture/gmo-service");
import MP = require('../../../../libs/MP');

export default class InputController extends PurchaseController {
    /**
     * 購入者情報入力
     */
    public index(): void {
        if (!this.purchaseModel.accessAuth(PurchaseSession.PurchaseModel.INPUT_STATE)) return this.next(new Error(PurchaseController.ERROR_MESSAGE_ACCESS));



        //購入者情報入力表示
        this.res.locals['error'] = null;
        this.res.locals['moment'] = require('moment');
        this.res.locals['step'] = PurchaseSession.PurchaseModel.INPUT_STATE;
        this.res.locals['gmoModuleUrl'] = config.get<string>('gmo_module_url');
        this.res.locals['gmoShopId'] = config.get<string>('gmo_shop_id');
        this.res.locals['price'] = this.purchaseModel.getReserveAmount();
        if (this.purchaseModel.input) {
            this.res.locals['input'] = this.purchaseModel.input;
        } else {
            this.res.locals['input'] = {
                last_name_hira: '',
                first_name_hira: '',
                mail_addr: '',
                mail_confirm: '',
                tel_num: '',
                agree: ''
            };
        }
        

        if (process.env.NODE_ENV === 'dev' && !this.purchaseModel.input) {
            this.res.locals['input'] = {
                last_name_hira: 'はたぐち',
                first_name_hira: 'あきと',
                mail_addr: 'hataguchi@motionpicture.jp',
                mail_confirm: 'hataguchi@motionpicture.jp',
                tel_num: '09040007648',
                agree: 'true'
            }
        }

        //セッション更新
        if (!this.req.session) return this.next(new Error('session is undefined'));
        this.req.session['purchase'] = this.purchaseModel.formatToSession();

        return this.res.render('purchase/input');
    }

    /**
     * 購入者情報入力完了
     */
    public submit(): void {
        if (!this.transactionAuth()) return this.next(new Error(PurchaseController.ERROR_MESSAGE_ACCESS));
        //バリデーション
        InputForm(this.req, this.res, () => {

            if (!this.req.form) return this.next(new Error('form is undefined'));
            if (this.req.form.isValid) {

                //入力情報をセッションへ
                this.purchaseModel.input = {
                    last_name_hira: this.req.body.last_name_hira,
                    first_name_hira: this.req.body.first_name_hira,
                    mail_addr: this.req.body.mail_addr,
                    mail_confirm: this.req.body.mail_confirm,
                    tel_num: this.req.body.tel_num,
                    agree: this.req.body.agree
                };
                if (this.req.body.gmo_token_object) {
                    //クレジット決済
                    //決済情報をセッションへ
                    this.purchaseModel.gmo = JSON.parse(this.req.body.gmo_token_object);
                    //GMOオーソリなし
                    this.addAuthorization().then(() => {
                        if (!this.router) return this.next(new Error('router is undefined'));
                        //セッション更新
                        if (!this.req.session) return this.next(new Error('session is undefined'));
                        this.req.session['purchase'] = this.purchaseModel.formatToSession();
                        //購入者内容確認へ
                        return this.res.redirect(this.router.build('purchase.confirm', {}));
                    }, (err) => {
                        if (!err.hasOwnProperty('type')) return this.next(err.message);
                        //GMOオーソリ追加失敗
                        this.res.locals['error'] = {
                            cardno: [err.error.message]
                        }
                        this.res.locals['input'] = this.req.body;
                        this.res.locals['moment'] = require('moment');
                        this.res.locals['step'] = 2;
                        this.res.locals['gmoModuleUrl'] = config.get<string>('gmo_module_url');
                        this.res.locals['gmoShopId'] = config.get<string>('gmo_shop_id');
                        this.res.locals['price'] = this.purchaseModel.getReserveAmount();
                        return this.res.render('purchase/input');
                    });


                } else {
                    //クレジット決済なし
                    if (!this.router) return this.next(new Error('router is undefined'));
                    //セッション更新
                    if (!this.req.session) return this.next(new Error('session is undefined'));
                    this.req.session['purchase'] = this.purchaseModel.formatToSession();
                    //購入者内容確認へ
                    return this.res.redirect(this.router.build('purchase.confirm', {}));
                }

            } else {
                this.res.locals['error'] = this.req.form.getErrors();
                this.res.locals['input'] = this.req.body;
                this.res.locals['moment'] = require('moment');
                this.res.locals['step'] = 2;
                this.res.locals['gmoModuleUrl'] = config.get<string>('gmo_module_url');
                this.res.locals['gmoShopId'] = config.get<string>('gmo_shop_id');
                this.res.locals['price'] = this.purchaseModel.getReserveAmount();
                return this.res.render('purchase/input');
            }

        });
    }

    /**
     * オーソリ追加
     */
    private async addAuthorization(): Promise<void> {
        if (!this.purchaseModel.transactionMP) throw new Error('transactionMP is undefined');
        if (!this.purchaseModel.gmo) throw new Error('gmo is undefined');

        if (this.purchaseModel.transactionGMO
            && this.purchaseModel.authorizationGMO
            && this.purchaseModel.orderId) {
            //GMOオーソリあり
            if (!this.purchaseModel.transactionGMO) throw new Error('transactionGMO is undefined');
            if (!this.purchaseModel.authorizationGMO) throw new Error('authorizationGMO is undefined');
            if (!this.purchaseModel.orderId) throw new Error('orderId is undefined');


            //GMOオーソリ取消
            await GMO.CreditService.alterTranInterface.call({
                shop_id: config.get<string>('gmo_shop_id'),
                shop_pass: config.get<string>('gmo_shop_password'),
                access_id: this.purchaseModel.transactionGMO.access_id,
                access_pass: this.purchaseModel.transactionGMO.access_pass,
                job_cd: GMO.Util.JOB_CD_VOID
            });
            this.logger.debug('GMOオーソリ取消');

            // GMOオーソリ削除
            await MP.removeGMOAuthorization.call({
                transactionId: this.purchaseModel.transactionMP._id,
                gmoAuthorizationId: this.purchaseModel.authorizationGMO._id,
            });
            this.logger.debug('GMOオーソリ削除');


        }

        try {
            // GMOオーソリ取得
            this.purchaseModel.orderId = Date.now().toString();
            let amount: number = this.purchaseModel.getReserveAmount();
            this.purchaseModel.transactionGMO = await GMO.CreditService.entryTranInterface.call({
                shop_id: config.get<string>('gmo_shop_id'),
                shop_pass: config.get<string>('gmo_shop_password'),
                order_id: this.purchaseModel.orderId,
                job_cd: GMO.Util.JOB_CD_AUTH,
                amount: amount,
            });
            this.logger.debug('GMOオーソリ取得', this.purchaseModel.orderId);

            await GMO.CreditService.execTranInterface.call({
                access_id: this.purchaseModel.transactionGMO.access_id,
                access_pass: this.purchaseModel.transactionGMO.access_pass,
                order_id: this.purchaseModel.orderId,
                method: "1",
                token: this.purchaseModel.gmo.token
            });
            this.logger.debug('GMO決済');

            // GMOオーソリ追加
            this.purchaseModel.authorizationGMO = await MP.addGMOAuthorization.call({
                transaction: this.purchaseModel.transactionMP,
                orderId: this.purchaseModel.orderId,
                amount: amount,
                entryTranResult: this.purchaseModel.transactionGMO,
            });
            this.logger.debug('MPGMOオーソリ追加', this.purchaseModel.authorizationGMO);

        } catch (err) {
            throw {
                error: new Error(err.message),
                type: 'addAuthorization'
            };
        }

    }






}
