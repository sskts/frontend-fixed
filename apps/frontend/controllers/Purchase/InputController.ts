import PurchaseController from './PurchaseController';
import InputForm from '../../forms/Purchase/InputForm';
import PurchaseSession = require('../../models/Purchase/PurchaseModel');
import config = require('config');
// import COA = require("@motionpicture/coa-service");
import GMO = require("@motionpicture/gmo-service");
//import MP = require('../../../../libs/MP');

export default class EnterPurchaseController extends PurchaseController {
    /**
     * 購入者情報入力
     */
    public index(): void {
        if (!this.req.session) return this.next(new Error('session is undefined'));
        this.purchaseModel.checkAccess(PurchaseSession.PurchaseModel.INPUT_STATE, this.next);
       
        
        //購入者情報入力表示
        this.res.locals['error'] = null;
        this.res.locals['info'] = this.purchaseModel.input;
        this.res.locals['moment'] = require('moment');
        this.res.locals['step'] = PurchaseSession.PurchaseModel.INPUT_STATE;
        this.res.locals['gmoModuleUrl'] = config.get<string>('gmo_module_url');
        this.res.locals['gmoShopId'] = config.get<string>('gmo_shop_id');
        this.res.locals['price'] = this.purchaseModel.getReserveAmount();

        if (process.env.NODE_ENV === 'dev') {
            this.res.locals['info'] = {
                last_name_hira: 'はたぐち',
                first_name_hira: 'あきと',
                mail_addr: 'hataguchi@motionpicture.jp',
                mail_confirm: 'hataguchi@motionpicture.jp',
                tel_num: '09040007648'
            }
        }

        //セッション更新
        if (!this.req.session) return this.next(new Error('session is undefined'));
        this.purchaseModel.upDate(this.req.session['purchase']);

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
                this.addAuthorization().then(()=>{
                    if (!this.router) return this.next(new Error('router is undefined'));
                    //セッション更新
                    if (!this.req.session) return this.next(new Error('session is undefined'));
                    this.purchaseModel.upDate(this.req.session['purchase']);
                    //購入者内容確認へ
                    this.res.redirect(this.router.build('purchase.confirm', {}));
                }, (err)=>{
                    return this.next(new Error(err.message));
                }); 
            } else {
                this.res.locals['error'] = this.req.form.getErrors();
                this.res.locals['info'] = this.req.body;
                this.res.locals['moment'] = require('moment');
                this.res.locals['step'] = 2;
                this.res.locals['gmoModuleUrl'] = config.get<string>('gmo_module_url');
                this.res.locals['gmoShopId'] = config.get<string>('gmo_shop_id');
                this.res.locals['price'] = this.purchaseModel.getReserveAmount();
                this.res.render('purchase/enterPurchase');
            }

        });
    }

    /**
     * オーソリ追加
     */
    private async addAuthorization(): Promise<void> {
        if (!this.req.session) throw new Error('session is undefined');
        
        //TODO
        // let performance: MP.performance = purchaseModel.performance;
        // let reserveSeats = purchaseModel.reserveSeats;
        // let reserveTickets = purchaseModel.reserveTickets;

        
        // let transaction: MP.transactionStart.Result = purchaseModel.transaction;
        // let owner: MP.ownerAnonymousCreate.Result = purchaseModel.owner;
        let gmo = this.purchaseModel.gmo;
        if (!gmo) throw new Error('gmo is undefined');

        /** 予約金額 */
        let amount: number = this.purchaseModel.getReserveAmount();

        // COAオーソリ追加
        // await MP.addCOAAuthorization.call({
        //     transaction: transaction,
        //     ownerId4administrator: config.get<string>('admin_id'),
        //     reserveSeatsTemporarilyResult: reserveSeats,
        //     performance: performance
        // });


        
        // GMOオーソリ取得
        let orderId = Date.now().toString();
        let entryTranResult = await GMO.CreditService.entryTranInterface.call({
            shop_id: config.get<string>('gmo_shop_id'),
            shop_pass: config.get<string>('gmo_shop_password'),
            order_id: orderId,
            job_cd: GMO.Util.JOB_CD_AUTH,
            amount: amount,
        });

        this.logger.debug('GMOオーソリ取得', entryTranResult);

        
        let execTranResult = await GMO.CreditService.execTranInterface.call({
            access_id: entryTranResult.access_id,
            access_pass: entryTranResult.access_pass,
            order_id: orderId,
            method: "1",
            token: gmo.token
        });

        this.logger.debug('GMO決済', execTranResult);

        // GMOオーソリ追加
        // await MP.addGMOAuthorization.call({
        //     transaction: transaction,
        //     owner: owner,
        //     orderId: orderId,
        //     amount: amount,
        //     entryTranResult: entryTranResult
        // });
    }

    


}
