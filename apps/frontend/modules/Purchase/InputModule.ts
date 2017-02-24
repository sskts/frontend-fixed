/**
 * 購入情報入力
 * @namespace Purchase.InputModule
 */

import * as GMO from '@motionpicture/gmo-service';
import * as express from 'express';
import * as MP from '../../../../libs/MP';
import InputForm from '../../forms/Purchase/InputForm';
import * as PurchaseSession from '../../models/Purchase/PurchaseModel';

/**
 * 購入者情報入力
 * @memberOf Purchase.InputModule
 * @function index
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
export function index(req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (!req.session) return next(req.__('common.error.property'));
    const purchaseModel = new PurchaseSession.PurchaseModel((<any>req.session).purchase);
    if (!purchaseModel.accessAuth(PurchaseSession.PurchaseModel.INPUT_STATE)) return next(new Error(req.__('common.error.access')));
    if (!purchaseModel.transactionMP) return next(req.__('common.error.property'));

    //購入者情報入力表示
    res.locals.error = null;
    res.locals.step = PurchaseSession.PurchaseModel.INPUT_STATE;
    res.locals.gmoModuleUrl = process.env.GMO_CLIENT_MODULE;
    res.locals.gmoShopId = process.env.GMO_SHOP_ID;
    res.locals.price = purchaseModel.getReserveAmount();
    res.locals.transactionId = purchaseModel.transactionMP.id;

    if (purchaseModel.input) {
        res.locals.input = purchaseModel.input;
    } else {
        res.locals.input = {
            last_name_hira: '',
            first_name_hira: '',
            mail_addr: '',
            mail_confirm: '',
            tel_num: '',
            agree: ''
        };
    }

    if (process.env.NODE_ENV === 'dev' && !purchaseModel.input) {
        res.locals.input = {
            last_name_hira: 'はたぐち',
            first_name_hira: 'あきと',
            mail_addr: 'hataguchi@motionpicture.jp',
            mail_confirm: 'hataguchi@motionpicture.jp',
            tel_num: '09040007648'
        };
    }

    //セッション更新
    if (!req.session) return next(req.__('common.error.property'));
    (<any>req.session).purchase = purchaseModel.formatToSession();

    return res.render('purchase/input');
}

/**
 * 購入者情報入力完了
 * @memberOf Purchase.InputModule
 * @function submit
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
export function submit(req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (!req.session) return next(req.__('common.error.property'));
    const purchaseModel = new PurchaseSession.PurchaseModel((<any>req.session).purchase);
    if (!purchaseModel.transactionMP) return next(new Error(req.__('common.error.property')));

    //取引id確認
    if (req.body.transaction_id !== purchaseModel.transactionMP.id) return next(new Error(req.__('common.error.access')));

    //バリデーション
    const form = InputForm(req);
    form(req, res, () => {
        if (!(<any>req).form) return next(req.__('common.error.property'));
        if ((<any>req).form.isValid) {
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
                    (<any>req.session).purchase = purchaseModel.formatToSession();
                    //購入者内容確認へ
                    return res.redirect('/purchase/confirm');
                }).catch((err) => {
                    if (!err.hasOwnProperty('type')) return next(new Error(err.message));
                    if (!purchaseModel.transactionMP) return next(req.__('common.error.property'));
                    //GMOオーソリ追加失敗
                    res.locals.error = {
                        cardno: [`${req.__('common.cardno')}${req.__('common.validation.card')}`],
                        expire: [`${req.__('common.expire')}${req.__('common.validation.card')}`],
                        securitycode: [`${req.__('common.securitycode')}${req.__('common.validation.card')}`]
                    };
                    res.locals.input = req.body;
                    res.locals.step = PurchaseSession.PurchaseModel.INPUT_STATE;
                    res.locals.gmoModuleUrl = process.env.GMO_CLIENT_MODULE;
                    res.locals.gmoShopId = process.env.GMO_SHOP_ID;
                    res.locals.price = purchaseModel.getReserveAmount();
                    res.locals.transactionId = purchaseModel.transactionMP.id;

                    return res.render('purchase/input');
                });

            } else {
                //クレジット決済なし
                //セッション更新
                if (!req.session) return next(req.__('common.error.property'));
                (<any>req.session).purchase = purchaseModel.formatToSession();
                //購入者内容確認へ
                return res.redirect('/purchase/confirm');
            }

        } else {
            if (!purchaseModel.transactionMP) return next(req.__('common.error.property'));
            res.locals.error = (<any>req).form.getErrors();
            res.locals.input = req.body;
            res.locals.step = PurchaseSession.PurchaseModel.INPUT_STATE;
            res.locals.gmoModuleUrl = process.env.GMO_CLIENT_MODULE;
            res.locals.gmoShopId = process.env.GMO_SHOP_ID;
            res.locals.price = purchaseModel.getReserveAmount();
            res.locals.transactionId = purchaseModel.transactionMP.id;

            return res.render('purchase/input');
        }

    });
}

/**
 * オーソリ追加
 * @memberOf Purchase.InputModule
 * @function addAuthorization
 * @param {express.Request} req
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {void}
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
        await GMO.CreditService.alterTran({
            shopId: process.env.GMO_SHOP_ID,
            shopPass: process.env.GMO_SHOP_PASSWORD,
            accessId: purchaseModel.transactionGMO.accessId,
            accessPass: purchaseModel.transactionGMO.accessPass,
            jobCd: GMO.Util.JOB_CD_VOID
        });
        console.log('GMOオーソリ取消');

        // GMOオーソリ削除
        await MP.removeGMOAuthorization({
            transactionId: purchaseModel.transactionMP.id,
            gmoAuthorizationId: purchaseModel.authorizationGMO.id
        });
        console.log('GMOオーソリ削除');
    }

    try {
        // GMOオーソリ取得
        // todo orderIdをユニークに
        purchaseModel.orderId = Date.now().toString();
        const amount: number = purchaseModel.getReserveAmount();
        purchaseModel.transactionGMO = await GMO.CreditService.entryTran({
            shopId: process.env.GMO_SHOP_ID,
            shopPass: process.env.GMO_SHOP_PASSWORD,
            orderId: purchaseModel.orderId,
            jobCd: GMO.Util.JOB_CD_AUTH,
            amount: amount
        });
        console.log('GMOオーソリ取得', purchaseModel.orderId);

        await GMO.CreditService.execTran({
            accessId: purchaseModel.transactionGMO.accessId,
            accessPass: purchaseModel.transactionGMO.accessPass,
            orderId: purchaseModel.orderId,
            method: '1',
            token: purchaseModel.gmo.token
        });
        console.log('GMO決済');

        // GMOオーソリ追加
        purchaseModel.authorizationGMO = await MP.addGMOAuthorization({
            transaction: purchaseModel.transactionMP,
            orderId: purchaseModel.orderId,
            amount: amount,
            entryTranResult: purchaseModel.transactionGMO
        });
        console.log('MPGMOオーソリ追加', purchaseModel.authorizationGMO);

    } catch (err) {
        throw {
            error: new Error(err.message),
            type: 'addAuthorization'
        };
    }
}
