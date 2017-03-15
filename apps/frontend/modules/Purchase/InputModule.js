/**
 * 購入情報入力
 * @namespace Purchase.InputModule
 */
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const GMO = require("@motionpicture/gmo-service");
const debug = require("debug");
const MP = require("../../../../libs/MP");
const InputForm_1 = require("../../forms/Purchase/InputForm");
const PurchaseSession = require("../../models/Purchase/PurchaseModel");
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
function index(req, res, next) {
    if (!req.session)
        return next(new Error(req.__('common.error.property')));
    if (!req.session.purchase)
        return next(new Error(req.__('common.error.property')));
    const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
    if (!purchaseModel.accessAuth(PurchaseSession.PurchaseModel.INPUT_STATE))
        return next(new Error(req.__('common.error.access')));
    if (!purchaseModel.transactionMP)
        return next(new Error(req.__('common.error.property')));
    // todo GMO情報取得API作成中
    let gmoShopId = 'tshop00026096';
    if (process.env.NODE_ENV === 'test') {
        gmoShopId = 'tshop00026715';
    }
    //購入者情報入力表示
    res.locals.error = null;
    res.locals.step = PurchaseSession.PurchaseModel.INPUT_STATE;
    res.locals.gmoModuleUrl = process.env.GMO_CLIENT_MODULE;
    res.locals.gmoShopId = gmoShopId;
    res.locals.price = purchaseModel.getReserveAmount();
    res.locals.transactionId = purchaseModel.transactionMP.id;
    if (purchaseModel.input) {
        res.locals.input = purchaseModel.input;
    }
    else {
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
    if (!req.session)
        return next(new Error(req.__('common.error.property')));
    req.session.purchase = purchaseModel.toSession();
    return res.render('purchase/input');
}
exports.index = index;
/**
 * 購入者情報入力完了
 * @memberOf Purchase.InputModule
 * @function submit
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
function submit(req, res, next) {
    if (!req.session)
        return next(new Error(req.__('common.error.property')));
    if (!req.session.purchase)
        return next(new Error(req.__('common.error.property')));
    const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
    if (!purchaseModel.transactionMP)
        return next(new Error(req.__('common.error.property')));
    //取引id確認
    if (req.body.transaction_id !== purchaseModel.transactionMP.id)
        return next(new Error(req.__('common.error.access')));
    //バリデーション
    const form = InputForm_1.default(req);
    form(req, res, () => {
        if (!req.form)
            return next(new Error(req.__('common.error.property')));
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
                    if (!req.session)
                        return next(new Error(req.__('common.error.property')));
                    req.session.purchase = purchaseModel.toSession();
                    //購入者内容確認へ
                    return res.redirect('/purchase/confirm');
                }).catch((err) => {
                    if (!err.hasOwnProperty('type'))
                        return next(new Error(err.message));
                    if (!purchaseModel.transactionMP)
                        return next(new Error(req.__('common.error.property')));
                    // todo GMO情報取得API作成中
                    let gmoShopId = 'tshop00026096';
                    if (process.env.NODE_ENV === 'test') {
                        gmoShopId = 'tshop00026715';
                    }
                    //GMOオーソリ追加失敗
                    res.locals.error = {
                        cardno: [`${req.__('common.cardno')}${req.__('common.validation.card')}`],
                        expire: [`${req.__('common.expire')}${req.__('common.validation.card')}`],
                        securitycode: [`${req.__('common.securitycode')}${req.__('common.validation.card')}`],
                        holdername: [`${req.__('common.holdername')}${req.__('common.validation.card')}`]
                    };
                    res.locals.input = req.body;
                    res.locals.step = PurchaseSession.PurchaseModel.INPUT_STATE;
                    res.locals.gmoModuleUrl = process.env.GMO_CLIENT_MODULE;
                    res.locals.gmoShopId = gmoShopId;
                    res.locals.price = purchaseModel.getReserveAmount();
                    res.locals.transactionId = purchaseModel.transactionMP.id;
                    return res.render('purchase/input');
                });
            }
            else {
                //クレジット決済なし
                //セッション更新
                if (!req.session)
                    return next(new Error(req.__('common.error.property')));
                req.session.purchase = purchaseModel.toSession();
                //購入者内容確認へ
                return res.redirect('/purchase/confirm');
            }
        }
        else {
            if (!purchaseModel.transactionMP)
                return next(new Error(req.__('common.error.property')));
            res.locals.error = req.form.getErrors();
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
exports.submit = submit;
/**
 * オーソリ追加
 * @memberOf Purchase.InputModule
 * @function addAuthorization
 * @param {express.Request} req
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {void}
 */
function addAuthorization(req, purchaseModel) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!purchaseModel.transactionMP)
            throw new Error(req.__('common.error.property'));
        if (!purchaseModel.gmo)
            throw new Error(req.__('common.error.property'));
        if (!purchaseModel.performance)
            throw new Error(req.__('common.error.property'));
        if (!purchaseModel.reserveSeats)
            throw new Error(req.__('common.error.property'));
        // todo GMO情報取得API作成中
        let gmoShopId = 'tshop00026096';
        let gmoShopPassword = 'xbxmkaa6';
        if (process.env.NODE_ENV === 'test') {
            gmoShopId = 'tshop00026715';
            gmoShopPassword = 'ybmbptww';
        }
        if (purchaseModel.transactionGMO
            && purchaseModel.authorizationGMO
            && purchaseModel.orderId) {
            //GMOオーソリあり
            if (!purchaseModel.transactionGMO)
                throw new Error(req.__('common.error.property'));
            if (!purchaseModel.authorizationGMO)
                throw new Error(req.__('common.error.property'));
            if (!purchaseModel.orderId)
                throw new Error(req.__('common.error.property'));
            //GMOオーソリ取消
            yield GMO.CreditService.alterTran({
                shopId: gmoShopId,
                shopPass: gmoShopPassword,
                accessId: purchaseModel.transactionGMO.accessId,
                accessPass: purchaseModel.transactionGMO.accessPass,
                jobCd: GMO.Util.JOB_CD_VOID
            });
            debugLog('GMOオーソリ取消');
            // GMOオーソリ削除
            yield MP.removeGMOAuthorization({
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
            purchaseModel.orderId = `${Date.now().toString()}${theaterId}${reservenum}`;
            const amount = purchaseModel.getReserveAmount();
            purchaseModel.transactionGMO = yield GMO.CreditService.entryTran({
                shopId: gmoShopId,
                shopPass: gmoShopPassword,
                orderId: purchaseModel.orderId,
                jobCd: GMO.Util.JOB_CD_AUTH,
                amount: amount
            });
            debugLog('GMOオーソリ取得', purchaseModel.orderId);
            yield GMO.CreditService.execTran({
                accessId: purchaseModel.transactionGMO.accessId,
                accessPass: purchaseModel.transactionGMO.accessPass,
                orderId: purchaseModel.orderId,
                method: '1',
                token: purchaseModel.gmo.token
            });
            debugLog('GMO決済');
            // GMOオーソリ追加
            purchaseModel.authorizationGMO = yield MP.addGMOAuthorization({
                transaction: purchaseModel.transactionMP,
                orderId: purchaseModel.orderId,
                amount: amount,
                entryTranResult: purchaseModel.transactionGMO
            });
            debugLog('MPGMOオーソリ追加', purchaseModel.authorizationGMO);
        }
        catch (err) {
            throw {
                error: new Error(err.message),
                type: 'addAuthorization'
            };
        }
    });
}
