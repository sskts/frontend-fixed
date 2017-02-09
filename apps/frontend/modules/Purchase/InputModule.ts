import express = require('express');
import InputForm from '../../forms/Purchase/InputForm';
import PurchaseSession = require('../../models/Purchase/PurchaseModel');
import config = require('config');
// import COA = require("@motionpicture/coa-service");
import GMO = require("@motionpicture/gmo-service");
import MP = require('../../../../libs/MP');


export namespace Module {
    /**
     * 購入者情報入力
     */
    export function index(req: express.Request, res: express.Response, next: express.NextFunction): void {
        if (!req.session) return next(req.__('common.error.property'));
        let purchaseModel = new PurchaseSession.PurchaseModel(req.session['purchase']);
        if (!purchaseModel.accessAuth(PurchaseSession.PurchaseModel.INPUT_STATE)) return next(new Error(req.__('common.error.access')));
        if (!purchaseModel.transactionMP) return next(req.__('common.error.property'));
        

        //購入者情報入力表示
        res.locals['error'] = null;
        res.locals['moment'] = require('moment');
        res.locals['step'] = PurchaseSession.PurchaseModel.INPUT_STATE;
        res.locals['gmoModuleUrl'] = config.get<string>('gmo_module_url');
        res.locals['gmoShopId'] = config.get<string>('gmo_shop_id');
        res.locals['price'] = purchaseModel.getReserveAmount();
        res.locals['transactionId'] = purchaseModel.transactionMP._id;
        

        if (purchaseModel.input) {
            res.locals['input'] = purchaseModel.input;
        } else {
            res.locals['input'] = {
                last_name_hira: '',
                first_name_hira: '',
                mail_addr: '',
                mail_confirm: '',
                tel_num: '',
                agree: ''
            };
        }
        

        if (process.env.NODE_ENV === 'dev' && !purchaseModel.input) {
            res.locals['input'] = {
                last_name_hira: 'はたぐち',
                first_name_hira: 'あきと',
                mail_addr: 'hataguchi@motionpicture.jp',
                mail_confirm: 'hataguchi@motionpicture.jp',
                tel_num: '09040007648',
            }
        }

        //セッション更新
        if (!req.session) return next(req.__('common.error.property'));
        req.session['purchase'] = purchaseModel.formatToSession();

        return res.render('purchase/input');
    }

    /**
     * 購入者情報入力完了
     */
    export function submit(req: express.Request, res: express.Response, next: express.NextFunction): void {
        if (!req.session) return next(req.__('common.error.property'));
        let purchaseModel = new PurchaseSession.PurchaseModel(req.session['purchase']);
        if (!purchaseModel.transactionMP) return next(new Error(req.__('common.error.property')));
        
        //取引id確認
        if (req.body.transaction_id !== purchaseModel.transactionMP._id) return next(new Error(req.__('common.error.access')));  
        
        //バリデーション
        let form = InputForm(req);
        form(req, res, () => {
            if (!req.form) return next(req.__('common.error.property'));
            if (req.form.isValid) {
                //入力情報をセッションへ
                purchaseModel.input = {
                    last_name_hira: req.body.last_name_hira,
                    first_name_hira: req.body.first_name_hira,
                    mail_addr: req.body.mail_addr,
                    mail_confirm: req.body.mail_confirm,
                    tel_num: req.body.tel_num,
                    agree: req.body.agree
                };
                if (req.body.gmo_token_object) {
                    //クレジット決済
                    //決済情報をセッションへ
                    purchaseModel.gmo = JSON.parse(req.body.gmo_token_object);
                    //オーソリ追加
                    addAuthorization(req, purchaseModel).then(() => {
                        //セッション更新
                        if (!req.session) return next(req.__('common.error.property'));
                        req.session['purchase'] = purchaseModel.formatToSession();
                        //購入者内容確認へ
                        return res.redirect('/purchase/confirm');
                    }, (err) => {
                        if (!err.hasOwnProperty('type')) return next(new Error(err.message));
                        if (!purchaseModel.transactionMP) return next(req.__('common.error.property'));
                        //GMOオーソリ追加失敗
                        res.locals['error'] = {
                            cardno: [`${req.__('common.cardno')}${req.__('common.validation.card')}`],
                            expire: [`${req.__('common.expire')}${req.__('common.validation.card')}`],
                            securitycode: [`${req.__('common.securitycode')}${req.__('common.validation.card')}`],
                        }
                        res.locals['input'] = req.body;
                        res.locals['moment'] = require('moment');
                        res.locals['step'] = 2;
                        res.locals['gmoModuleUrl'] = config.get<string>('gmo_module_url');
                        res.locals['gmoShopId'] = config.get<string>('gmo_shop_id');
                        res.locals['price'] = purchaseModel.getReserveAmount();
                        res.locals['transactionId'] = purchaseModel.transactionMP._id;
                        
                        return res.render('purchase/input');
                    });


                } else {
                    //クレジット決済なし
                    //セッション更新
                    if (!req.session) return next(req.__('common.error.property'));
                    req.session['purchase'] = purchaseModel.formatToSession();
                    //購入者内容確認へ
                    return res.redirect('/purchase/confirm');
                }

            } else {
                if (!purchaseModel.transactionMP) return next(req.__('common.error.property'));
                res.locals['error'] = req.form.getErrors();
                res.locals['input'] = req.body;
                res.locals['moment'] = require('moment');
                res.locals['step'] = 2;
                res.locals['gmoModuleUrl'] = config.get<string>('gmo_module_url');
                res.locals['gmoShopId'] = config.get<string>('gmo_shop_id');
                res.locals['price'] = purchaseModel.getReserveAmount();
                res.locals['transactionId'] = purchaseModel.transactionMP._id;
                
                return res.render('purchase/input');
            }

        });
    }

    /**
     * オーソリ追加
     */
    async function addAuthorization(req: express.Request, purchaseModel: PurchaseSession.PurchaseModel): Promise<void> {
        if (!purchaseModel.transactionMP) throw new Error(req.__('common.error.property'));
        if (!purchaseModel.gmo) throw new Error(req.__('common.error.property'));

        if (purchaseModel.transactionGMO
            && purchaseModel.authorizationGMO
            && purchaseModel.orderId) {
            //GMOオーソリあり
            if (!purchaseModel.transactionGMO) throw new Error(req.__('common.error.property'));
            if (!purchaseModel.authorizationGMO) throw new Error(req.__('common.error.property'));
            if (!purchaseModel.orderId) throw new Error(req.__('common.error.property'));


            //GMOオーソリ取消
            await GMO.CreditService.alterTranInterface.call({
                shop_id: config.get<string>('gmo_shop_id'),
                shop_pass: config.get<string>('gmo_shop_password'),
                access_id: purchaseModel.transactionGMO.access_id,
                access_pass: purchaseModel.transactionGMO.access_pass,
                job_cd: GMO.Util.JOB_CD_VOID
            });
            console.log('GMOオーソリ取消');

            // GMOオーソリ削除
            await MP.removeGMOAuthorization.call({
                transactionId: purchaseModel.transactionMP._id,
                gmoAuthorizationId: purchaseModel.authorizationGMO._id,
            });
            console.log('GMOオーソリ削除');


        }

        try {
            // GMOオーソリ取得
            purchaseModel.orderId = Date.now().toString();
            let amount: number = purchaseModel.getReserveAmount();
            purchaseModel.transactionGMO = await GMO.CreditService.entryTranInterface.call({
                shop_id: config.get<string>('gmo_shop_id'),
                shop_pass: config.get<string>('gmo_shop_password'),
                order_id: purchaseModel.orderId,
                job_cd: GMO.Util.JOB_CD_AUTH,
                amount: amount,
            });
            console.log('GMOオーソリ取得', purchaseModel.orderId);

            await GMO.CreditService.execTranInterface.call({
                access_id: purchaseModel.transactionGMO.access_id,
                access_pass: purchaseModel.transactionGMO.access_pass,
                order_id: purchaseModel.orderId,
                method: "1",
                token: purchaseModel.gmo.token
            });
            console.log('GMO決済');

            // GMOオーソリ追加
            purchaseModel.authorizationGMO = await MP.addGMOAuthorization.call({
                transaction: purchaseModel.transactionMP,
                orderId: purchaseModel.orderId,
                amount: amount,
                entryTranResult: purchaseModel.transactionGMO,
            });
            console.log('MPGMOオーソリ追加', purchaseModel.authorizationGMO);

        } catch (err) {
            throw {
                error: new Error(err.message),
                type: 'addAuthorization'
            };
        }

    }
}




