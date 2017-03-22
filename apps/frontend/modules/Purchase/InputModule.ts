/**
 * 購入情報入力
 * @namespace Purchase.InputModule
 */

import * as GMO from '@motionpicture/gmo-service';
import * as debug from 'debug';
import * as express from 'express';
import * as moment from 'moment';
import * as MP from '../../../../libs/MP';
import InputForm from '../../forms/Purchase/InputForm';
import * as PurchaseSession from '../../models/Purchase/PurchaseModel';
const debugLog = debug('SSKTS ');

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
    if (!req.session) return next(new Error(req.__('common.error.property')));
    if (!req.session.purchase) return next(new Error(req.__('common.error.expire')));
    const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
    if (!purchaseModel.accessAuth(PurchaseSession.PurchaseModel.INPUT_STATE)) return next(new Error(req.__('common.error.access')));
    if (!purchaseModel.transactionMP) return next(new Error(req.__('common.error.property')));
    if (!purchaseModel.theater) return next(new Error(req.__('common.error.property')));

    //購入者情報入力表示
    res.locals.error = null;
    res.locals.step = PurchaseSession.PurchaseModel.INPUT_STATE;
    res.locals.gmoModuleUrl = process.env.GMO_CLIENT_MODULE;
    res.locals.gmoShopId = purchaseModel.theater.attributes.gmo_shop_id;
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

    if (process.env.NODE_ENV === 'development' && !purchaseModel.input) {
        res.locals.input = {
            last_name_hira: 'はたぐち',
            first_name_hira: 'あきと',
            mail_addr: 'hataguchi@motionpicture.jp',
            mail_confirm: 'hataguchi@motionpicture.jp',
            tel_num: '09040007648'
        };
    }

    //セッション更新
    if (!req.session) return next(new Error(req.__('common.error.property')));
    (<any>req.session).purchase = purchaseModel.toSession();

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
    if (!req.session) return next(new Error(req.__('common.error.property')));
    if (!req.session.purchase) return next(new Error(req.__('common.error.expire')));
    const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
    if (!purchaseModel.transactionMP) return next(new Error(req.__('common.error.property')));

    //取引id確認
    if (req.body.transaction_id !== purchaseModel.transactionMP.id) return next(new Error(req.__('common.error.access')));

    //バリデーション
    InputForm(req);
    req.getValidationResult().then((result) => {
        if (!result.isEmpty()) {
            if (!purchaseModel.transactionMP) return next(new Error(req.__('common.error.property')));
            if (!purchaseModel.theater) return next(new Error(req.__('common.error.property')));
            res.locals.error = result.mapped();
            res.locals.input = req.body;
            res.locals.step = PurchaseSession.PurchaseModel.INPUT_STATE;
            res.locals.gmoModuleUrl = process.env.GMO_CLIENT_MODULE;
            res.locals.gmoShopId = purchaseModel.theater.attributes.gmo_shop_id;
            res.locals.price = purchaseModel.getReserveAmount();
            res.locals.transactionId = purchaseModel.transactionMP.id;

            return res.render('purchase/input');
        }
        // 入力情報をセッションへ
        purchaseModel.input = {
            last_name_hira: req.body.last_name_hira,
            first_name_hira: req.body.first_name_hira,
            mail_addr: req.body.mail_addr,
            mail_confirm: req.body.mail_confirm,
            tel_num: req.body.tel_num,
            agree: req.body.agree
        };
        if (!req.body.gmo_token_object) {
            // クレジット決済なし
            if (!req.session) return next(new Error(req.__('common.error.property')));
            req.session.purchase = purchaseModel.toSession();
            // 購入者内容確認へ
            return res.redirect('/purchase/confirm');
        }
        // クレジット決済
        purchaseModel.gmo = JSON.parse(req.body.gmo_token_object);
        // オーソリ追加
        addAuthorization(req, purchaseModel).then(() => {
            // セッション更新
            if (!req.session) return next(new Error(req.__('common.error.property')));
            req.session.purchase = purchaseModel.toSession();
            // 購入者内容確認へ
            return res.redirect('/purchase/confirm');
        }).catch((err) => {
            if (!err.hasOwnProperty('type')) return next(new Error(err.message));
            if (!purchaseModel.transactionMP) return next(new Error(req.__('common.error.property')));
            if (!purchaseModel.theater) return next(new Error(req.__('common.error.property')));

            const gmoShopId = purchaseModel.theater.attributes.gmo_shop_id;

            // GMOオーソリ追加失敗
            res.locals.error = getGMOError(req);
            res.locals.input = req.body;
            res.locals.step = PurchaseSession.PurchaseModel.INPUT_STATE;
            res.locals.gmoModuleUrl = process.env.GMO_CLIENT_MODULE;
            res.locals.gmoShopId = gmoShopId;
            res.locals.price = purchaseModel.getReserveAmount();
            res.locals.transactionId = purchaseModel.transactionMP.id;

            return res.render('purchase/input');
        });
    }).catch(() => {
        return next(new Error(req.__('common.error.access')));
    });
}

/**
 * GMOオーソリ追加エラー取得
 * @memberOf Purchase.InputModule
 * @function getGMOError
 * @param {express.Request} req
 * @returns {any}
 */
function getGMOError(req: Express.Request) {
    return {
        cardno: {
            parm: 'cardno', msg: `${req.__('common.cardno')}${req.__('common.validation.card')}`, value: ''
        },
        expire: {
            parm: 'expire', msg: `${req.__('common.expire')}${req.__('common.validation.card')}`, value: ''
        },
        securitycode: {
            parm: 'securitycode', msg: `${req.__('common.securitycode')}${req.__('common.validation.card')}`, value: ''
        },
        holdername: {
            parm: 'holdername', msg: `${req.__('common.holdername')}${req.__('common.validation.card')}`, value: ''
        }
    };
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
    if (!purchaseModel.performance) throw new Error(req.__('common.error.property'));
    if (!purchaseModel.reserveSeats) throw new Error(req.__('common.error.property'));
    if (!purchaseModel.theater) throw new Error(req.__('common.error.property'));

    const gmoShopId = purchaseModel.theater.attributes.gmo_shop_id;
    const gmoShopPassword = purchaseModel.theater.attributes.gmo_shop_pass;

    if (purchaseModel.transactionGMO
        && purchaseModel.authorizationGMO
        && purchaseModel.orderId) {
        //GMOオーソリあり
        if (!purchaseModel.transactionGMO) throw new Error(req.__('common.error.property'));
        if (!purchaseModel.authorizationGMO) throw new Error(req.__('common.error.property'));
        if (!purchaseModel.orderId) throw new Error(req.__('common.error.property'));

        //GMOオーソリ取消
        await GMO.CreditService.alterTran({
            shopId: gmoShopId,
            shopPass: gmoShopPassword,
            accessId: purchaseModel.transactionGMO.accessId,
            accessPass: purchaseModel.transactionGMO.accessPass,
            jobCd: GMO.Util.JOB_CD_VOID
        });
        debugLog('GMOオーソリ取消');

        // GMOオーソリ削除
        await MP.removeGMOAuthorization({
            transactionId: purchaseModel.transactionMP.id,
            gmoAuthorizationId: purchaseModel.authorizationGMO.id
        });
        debugLog('GMOオーソリ削除');
    }

    try {
        // GMOオーソリ取得
        const theaterId = purchaseModel.performance.attributes.theater.id;
        const reservenum = purchaseModel.reserveSeats.tmp_reserve_num;
        // オーダーID （予約時間 + 劇場ID + 予約番号）
        purchaseModel.orderId = `${moment().format('YYYYMMDD')}${theaterId}${reservenum}`;
        const amount: number = purchaseModel.getReserveAmount();
        purchaseModel.transactionGMO = await GMO.CreditService.entryTran({
            shopId: gmoShopId,
            shopPass: gmoShopPassword,
            orderId: purchaseModel.orderId,
            jobCd: GMO.Util.JOB_CD_AUTH,
            amount: amount
        });
        debugLog('GMOオーソリ取得', purchaseModel.orderId);

        await GMO.CreditService.execTran({
            accessId: purchaseModel.transactionGMO.accessId,
            accessPass: purchaseModel.transactionGMO.accessPass,
            orderId: purchaseModel.orderId,
            method: '1',
            token: purchaseModel.gmo.token
        });
        debugLog('GMO決済');

        // GMOオーソリ追加
        purchaseModel.authorizationGMO = await MP.addGMOAuthorization({
            transaction: purchaseModel.transactionMP,
            orderId: purchaseModel.orderId,
            amount: amount,
            entryTranResult: purchaseModel.transactionGMO,
            gmoShopId: purchaseModel.theater.attributes.gmo_shop_id,
            gmoShopPassword: purchaseModel.theater.attributes.gmo_shop_pass
        });
        debugLog('MPGMOオーソリ追加', purchaseModel.authorizationGMO);

    } catch (err) {
        throw {
            error: new Error(err.message),
            type: 'addAuthorization'
        };
    }
}
