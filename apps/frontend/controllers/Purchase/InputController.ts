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
        if (!this.purchaseModel.checkAccess(PurchaseSession.PurchaseModel.INPUT_STATE)) return this.next(new Error('無効なアクセスです'));



        //購入者情報入力表示
        this.res.locals['error'] = null;
        this.res.locals['input'] = this.purchaseModel.input;
        this.res.locals['moment'] = require('moment');
        this.res.locals['step'] = PurchaseSession.PurchaseModel.INPUT_STATE;
        this.res.locals['gmoModuleUrl'] = config.get<string>('gmo_module_url');
        this.res.locals['gmoShopId'] = config.get<string>('gmo_shop_id');
        this.res.locals['price'] = this.purchaseModel.getReserveAmount();

        if (process.env.NODE_ENV === 'dev') {
            this.res.locals['input'] = {
                last_name_hira: 'はたぐち',
                first_name_hira: 'あきと',
                mail_addr: 'hataguchi@motionpicture.jp',
                mail_confirm: 'hataguchi@motionpicture.jp',
                tel_num: '09040007648'
            }
        }

        //セッション更新
        if (!this.req.session) return this.next(new Error('session is undefined'));
        this.req.session['purchase'] = this.purchaseModel.formatToSession();

        this.res.render('purchase/input');
    }

    /**
     * 購入者情報入力完了
     */
    public submit(): void {

        //バリデーション
        InputForm(this.req, this.res, () => {

            if (!this.req.form) return this.next(new Error('form is undefined'));
            if (this.req.form.isValid) {

                //入力情報をセッションへ
                this.purchaseModel.input = {
                    last_name_hira: this.req.body.last_name_hira,
                    first_name_hira: this.req.body.first_name_hira,
                    mail_addr: this.req.body.mail_addr,
                    tel_num: this.req.body.tel_num,
                };
                //決済情報をセッションへ
                this.purchaseModel.gmo = JSON.parse(this.req.body.gmo_token_object);
                this.addAuthorization().then(() => {
                    if (!this.router) return this.next(new Error('router is undefined'));
                    //セッション更新
                    if (!this.req.session) return this.next(new Error('session is undefined'));
                    this.req.session['purchase'] = this.purchaseModel.formatToSession();
                    //購入者内容確認へ
                    this.res.redirect(this.router.build('purchase.confirm', {}));
                }, (err) => {
                    return this.next(new Error(err.message));
                });
            } else {
                this.res.locals['error'] = this.req.form.getErrors();
                this.res.locals['input'] = this.req.body;
                this.res.locals['moment'] = require('moment');
                this.res.locals['step'] = 2;
                this.res.locals['gmoModuleUrl'] = config.get<string>('gmo_module_url');
                this.res.locals['gmoShopId'] = config.get<string>('gmo_shop_id');
                this.res.locals['price'] = this.purchaseModel.getReserveAmount();
                this.res.render('purchase/input');
            }

        });
    }

    /**
     * オーソリ追加
     */
    private async addAuthorization(): Promise<void> {
        if (!this.purchaseModel.transactionMP) throw new Error('transactionMP is undefined');
        if (!this.purchaseModel.gmo) throw new Error('gmo is undefined');
        if (!this.purchaseModel.owners) throw new Error('owners is undefined');
        if (!this.purchaseModel.gmo) throw new Error('gmo is undefined');
        if (!this.purchaseModel.gmo) throw new Error('gmo is undefined');
        

        if (this.purchaseModel.transactionGMO
            && this.purchaseModel.authorizationGMO
            && this.purchaseModel.orderId) {
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
                transaction: this.purchaseModel.transactionMP,
                addGMOAuthorizationResult: this.purchaseModel.authorizationGMO,
                orderId: this.purchaseModel.orderId
            });
            this.logger.debug('GMOオーソリ削除');
        }

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
        
        await GMO.CreditService.execTranInterface.call({
            access_id: this.purchaseModel.transactionGMO.access_id,
            access_pass: this.purchaseModel.transactionGMO.access_pass,
            order_id: this.purchaseModel.orderId,
            method: "1",
            token: this.purchaseModel.gmo.token
        });

        // GMOオーソリ追加
        MP.addGMOAuthorization.call({
            transaction: this.purchaseModel.transactionMP,
            owner: this.purchaseModel.owners,
            orderId: this.purchaseModel.orderId,
            amount: amount,
            entryTranResult: this.purchaseModel.transactionGMO
        });



        
    }




}
