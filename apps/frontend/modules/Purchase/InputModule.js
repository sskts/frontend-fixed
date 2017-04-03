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
const moment = require("moment");
const MP = require("../../../../libs/MP");
const InputForm_1 = require("../../forms/Purchase/InputForm");
const PurchaseSession = require("../../models/Purchase/PurchaseModel");
const ErrorUtilModule = require("../Util/ErrorUtilModule");
const UtilModule = require("../Util/UtilModule");
const log = debug('SSKTS');
/**
 * 購入者情報入力
 * @memberOf Purchase.InputModule
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
function index(req, res, next) {
    try {
        if (req.session === undefined)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (req.session.purchase === undefined)
            throw ErrorUtilModule.ERROR_EXPIRE;
        const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
        if (!purchaseModel.accessAuth(PurchaseSession.PurchaseModel.INPUT_STATE)) {
            throw ErrorUtilModule.ERROR_EXPIRE;
        }
        if (purchaseModel.theater === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.transactionMP === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        //購入者情報入力表示
        res.locals.error = null;
        res.locals.step = PurchaseSession.PurchaseModel.INPUT_STATE;
        res.locals.gmoModuleUrl = process.env.GMO_CLIENT_MODULE;
        res.locals.gmoShopId = purchaseModel.theater.attributes.gmo_shop_id;
        res.locals.price = purchaseModel.getReserveAmount();
        res.locals.transactionId = purchaseModel.transactionMP.id;
        if (purchaseModel.input !== null) {
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
        if (process.env.NODE_ENV === 'development' && purchaseModel.input === null) {
            res.locals.input = {
                last_name_hira: 'はたぐち',
                first_name_hira: 'あきと',
                mail_addr: 'hataguchi@motionpicture.jp',
                mail_confirm: 'hataguchi@motionpicture.jp',
                tel_num: '09040007648'
            };
        }
        //セッション更新
        req.session.purchase = purchaseModel.toSession();
        res.render('purchase/input');
        return;
    }
    catch (err) {
        next(ErrorUtilModule.getError(req, err));
        return;
    }
}
exports.index = index;
/**
 * 購入者情報入力完了
 * @memberOf Purchase.InputModule
 * @function submit
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
// tslint:disable-next-line:max-func-body-length
function submit(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.session === undefined)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (req.session.purchase === undefined)
                throw ErrorUtilModule.ERROR_EXPIRE;
            const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
            if (purchaseModel.theater === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (purchaseModel.transactionMP === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (purchaseModel.performance === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (purchaseModel.reserveSeats === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (purchaseModel.reserveTickets === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            //取引id確認
            if (req.body.transaction_id !== purchaseModel.transactionMP.id) {
                throw ErrorUtilModule.ERROR_ACCESS;
            }
            //バリデーション
            InputForm_1.default(req);
            const validationResult = yield req.getValidationResult();
            if (!validationResult.isEmpty()) {
                res.locals.error = validationResult.mapped();
                res.locals.input = req.body;
                res.locals.step = PurchaseSession.PurchaseModel.INPUT_STATE;
                res.locals.gmoModuleUrl = process.env.GMO_CLIENT_MODULE;
                res.locals.gmoShopId = purchaseModel.theater.attributes.gmo_shop_id;
                res.locals.price = purchaseModel.getReserveAmount();
                res.locals.transactionId = purchaseModel.transactionMP.id;
                res.render('purchase/input');
                return;
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
            if (req.body.gmo_token_object === undefined) {
                // クレジット決済なし
                req.session.purchase = purchaseModel.toSession();
                // 購入者内容確認へ
                res.redirect('/purchase/confirm');
                return;
            }
            // クレジット決済
            purchaseModel.gmo = JSON.parse(req.body.gmo_token_object);
            yield addAuthorization(purchaseModel);
            log('オーソリ追加');
            yield MP.ownersAnonymous({
                transactionId: purchaseModel.transactionMP.id,
                name_first: purchaseModel.input.first_name_hira,
                name_last: purchaseModel.input.last_name_hira,
                tel: purchaseModel.input.tel_num,
                email: purchaseModel.input.mail_addr
            });
            log('MP購入者情報登録');
            yield MP.transactionsEnableInquiry({
                transactionId: purchaseModel.transactionMP.id,
                inquiry_theater: purchaseModel.performance.attributes.theater.id,
                inquiry_id: purchaseModel.reserveSeats.tmp_reserve_num,
                inquiry_pass: purchaseModel.input.tel_num
            });
            log('MP照会情報登録');
            yield MP.addEmail({
                transactionId: purchaseModel.transactionMP.id,
                from: 'noreply@ticket-cinemasunshine.com',
                to: purchaseModel.input.mail_addr,
                subject: '購入完了',
                content: getMailContent(req, purchaseModel)
            });
            log('MPメール登録');
            // セッション更新
            req.session.purchase = purchaseModel.toSession();
            // 購入者内容確認へ
            res.redirect('/purchase/confirm');
            return;
        }
        catch (err) {
            if (err === ErrorUtilModule.ERROR_VALIDATION) {
                if (req.session === undefined)
                    throw ErrorUtilModule.ERROR_PROPERTY;
                if (req.session.purchase === undefined)
                    throw ErrorUtilModule.ERROR_EXPIRE;
                const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
                if (purchaseModel.theater === null)
                    throw ErrorUtilModule.ERROR_PROPERTY;
                if (purchaseModel.transactionMP === null)
                    throw ErrorUtilModule.ERROR_PROPERTY;
                const gmoShopId = purchaseModel.theater.attributes.gmo_shop_id;
                // GMOオーソリ追加失敗
                res.locals.error = getGMOError(req);
                res.locals.input = req.body;
                res.locals.step = PurchaseSession.PurchaseModel.INPUT_STATE;
                res.locals.gmoModuleUrl = process.env.GMO_CLIENT_MODULE;
                res.locals.gmoShopId = gmoShopId;
                res.locals.price = purchaseModel.getReserveAmount();
                res.locals.transactionId = purchaseModel.transactionMP.id;
                res.render('purchase/input');
                return;
            }
            next(ErrorUtilModule.getError(req, err));
            return;
        }
    });
}
exports.submit = submit;
/**
 * メール内容取得
 * @function getMailContent
 * @param {Request} req
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {Promise<string>}
 */
function getMailContent(req, purchaseModel) {
    if (purchaseModel.performance === null)
        throw ErrorUtilModule.ERROR_PROPERTY;
    if (purchaseModel.reserveSeats === null)
        throw ErrorUtilModule.ERROR_PROPERTY;
    if (purchaseModel.input === null)
        throw ErrorUtilModule.ERROR_PROPERTY;
    if (purchaseModel.reserveTickets === null)
        throw ErrorUtilModule.ERROR_PROPERTY;
    const reserveSeatsString = purchaseModel.reserveTickets.map((ticket) => {
        return `${ticket.seat_code} ${ticket.ticket_name} ￥${UtilModule.formatPrice(ticket.sale_price)}`;
    });
    return `${purchaseModel.input.last_name_hira} ${purchaseModel.input.first_name_hira} 様

この度は、${purchaseModel.performance.attributes.theater.name.ja}のオンライン先売りチケットサービスにてご購入頂き、誠にありがとうございます。お客様がご購入されましたチケットの情報は下記の通りです。

・[予約番号] ${purchaseModel.reserveSeats.tmp_reserve_num}

・[鑑賞日時] ${moment(purchaseModel.performance.attributes.day).format('YYYY年MM月DD日')} 
(${req.__('week[' + moment(purchaseModel.performance.attributes.day).format('ddd') + ']')}) 
${UtilModule.timeFormat(purchaseModel.performance.attributes.time_start)}

・[作品名] ${purchaseModel.performance.attributes.film.name.ja}

・[スクリーン名] ${purchaseModel.performance.attributes.screen.name.ja}

・[座席] ${reserveSeatsString.join('\n')}

・[合計] ￥${UtilModule.formatPrice(purchaseModel.getReserveAmount())}

【チケット発券について】
チケットの発券/入場方法は2通りからお選び頂けます。

<発券/入場方法1 劇場発券機で発券>
劇場に設置されている発券機にて発券頂きます。予約番号をお控えの上ご来場ください。
チケットが発券できなかった場合にはチケット売場にお越しください。

<発券/入場方法2 入場用QRコードで入場>
以下のURLよりチケット情報確認画面へアクセス頂き、「チケットを購入した劇場」「予約番号」「お電話番号」を入力してログインしてください。 ご鑑賞時間の24時間前から入場用QRコードが表示されますので、入場時にそちらのQRコードをご提示ください。
https://${req.headers.host}/inquiry/login?theater=${purchaseModel.performance.attributes.theater.id}

【ご注意事項】
・ご購入されたチケットの変更、キャンセル、払い戻しはいかなる場合でも致しかねます。
・チケットの発券にお時間がかかる場合もございますので、お時間の余裕を持ってご来場ください。
・メンバーズカード会員のお客様は、ポイントは付与いたしますので、発券したチケットまたは、表示されたQRコードとメンバーズカードをチケット売場までお持ち下さいませ。
・年齢や学生など各種証明が必要なチケットを購入された方は、入場時にご提示ください。
ご提示頂けない場合は、一般料金との差額を頂きます。

なお、このメールは、${purchaseModel.performance.attributes.theater.name.ja}の予約システムでチケットをご購入頂いた方にお送りしておりますが、
チケット購入に覚えのない方に届いております場合は、下記お問い合わせ先までご連絡ください。
※なお、このメールアドレスは送信専用となっておりますので、ご返信頂けません。
ご不明な点がございましたら、下記番号までお問合わせ下さい。

お問い合わせはこちら
${purchaseModel.performance.attributes.theater.name.ja}
TEL：XX-XXXX-XXXX`;
}
/**
 * GMOオーソリ追加エラー取得
 * @memberOf Purchase.InputModule
 * @function getGMOError
 * @param {Request} req
 * @returns {any}
 */
function getGMOError(req) {
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
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {void}
 */
function addAuthorization(purchaseModel) {
    return __awaiter(this, void 0, void 0, function* () {
        if (purchaseModel.transactionMP === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.gmo === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.performance === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.reserveSeats === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.theater === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        const gmoShopId = purchaseModel.theater.attributes.gmo_shop_id;
        const gmoShopPassword = purchaseModel.theater.attributes.gmo_shop_pass;
        if (purchaseModel.transactionGMO !== null
            && purchaseModel.authorizationGMO !== null
            && purchaseModel.orderId !== null) {
            //GMOオーソリ取消
            yield GMO.CreditService.alterTran({
                shopId: gmoShopId,
                shopPass: gmoShopPassword,
                accessId: purchaseModel.transactionGMO.accessId,
                accessPass: purchaseModel.transactionGMO.accessPass,
                jobCd: GMO.Util.JOB_CD_VOID
            });
            log('GMOオーソリ取消');
            // GMOオーソリ削除
            yield MP.removeGMOAuthorization({
                transactionId: purchaseModel.transactionMP.id,
                gmoAuthorizationId: purchaseModel.authorizationGMO.id
            });
            log('GMOオーソリ削除');
        }
        const amount = purchaseModel.getReserveAmount();
        try {
            // GMOオーソリ取得
            const theaterId = purchaseModel.performance.attributes.theater.id;
            const reservenum = purchaseModel.reserveSeats.tmp_reserve_num;
            // オーダーID 予約日 + 劇場ID + 予約番号(8桁) + オーソリカウント(2桁)
            purchaseModel.orderId = `${moment().format('YYYYMMDD')}${theaterId}${reservenum}${purchaseModel.authorizationCountGMOToString()}`;
            log('GMOオーソリ取得In', {
                shopId: gmoShopId,
                shopPass: gmoShopPassword,
                orderId: purchaseModel.orderId,
                jobCd: GMO.Util.JOB_CD_AUTH,
                amount: amount
            });
            purchaseModel.transactionGMO = yield GMO.CreditService.entryTran({
                shopId: gmoShopId,
                shopPass: gmoShopPassword,
                orderId: purchaseModel.orderId,
                jobCd: GMO.Util.JOB_CD_AUTH,
                amount: amount
            });
            log('GMOオーソリ取得', purchaseModel.orderId);
            yield GMO.CreditService.execTran({
                accessId: purchaseModel.transactionGMO.accessId,
                accessPass: purchaseModel.transactionGMO.accessPass,
                orderId: purchaseModel.orderId,
                method: '1',
                token: purchaseModel.gmo.token
            });
            log('GMO決済');
        }
        catch (err) {
            throw ErrorUtilModule.ERROR_VALIDATION;
        }
        // GMOオーソリ追加
        purchaseModel.authorizationGMO = yield MP.addGMOAuthorization({
            transaction: purchaseModel.transactionMP,
            orderId: purchaseModel.orderId,
            amount: amount,
            entryTranResult: purchaseModel.transactionGMO,
            gmoShopId: purchaseModel.theater.attributes.gmo_shop_id,
            gmoShopPassword: purchaseModel.theater.attributes.gmo_shop_pass
        });
        log('MPGMOオーソリ追加', purchaseModel.authorizationGMO);
        purchaseModel.authorizationCountGMO += 1;
        log('GMOオーソリカウント加算', purchaseModel.authorizationCountGMOToString());
    });
}
