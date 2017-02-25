/**
 * 購入確認
 * @namespace Purchase.ConfirmModule
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
const COA = require("@motionpicture/coa-service");
const moment = require("moment");
const MP = require("../../../../libs/MP");
const PurchaseSession = require("../../models/Purchase/PurchaseModel");
const UtilModule = require("../Util/UtilModule");
/**
 * 購入者内容確認
 * @memberOf Purchase.ConfirmModule
 * @function index
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
function index(req, res, next) {
    if (!req.session)
        return next(new Error(req.__('common.error.property')));
    const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
    if (!purchaseModel.accessAuth(PurchaseSession.PurchaseModel.CONFIRM_STATE))
        return next(new Error(req.__('common.error.access')));
    if (!purchaseModel.transactionMP)
        return next(new Error(req.__('common.error.property')));
    //購入者内容確認表示
    res.locals.gmoTokenObject = (purchaseModel.gmo) ? purchaseModel.gmo : null;
    res.locals.input = purchaseModel.input;
    res.locals.performance = purchaseModel.performance;
    res.locals.reserveSeats = purchaseModel.reserveSeats;
    res.locals.reserveTickets = purchaseModel.reserveTickets;
    res.locals.step = PurchaseSession.PurchaseModel.CONFIRM_STATE;
    res.locals.price = purchaseModel.getReserveAmount();
    res.locals.updateReserve = null;
    res.locals.error = null;
    res.locals.seatStr = purchaseModel.seatToString();
    res.locals.ticketStr = purchaseModel.ticketToString();
    res.locals.transactionId = purchaseModel.transactionMP.id;
    //セッション更新
    if (!req.session)
        return next(new Error(req.__('common.error.property')));
    req.session.purchase = purchaseModel.formatToSession();
    return res.render('purchase/confirm');
}
exports.index = index;
/**
 * 座席本予約
 * @memberOf Purchase.ConfirmModule
 * @function updateReserve
 * @param {express.Request} req
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {Promise<void>}
 */
function updateReserve(req, purchaseModel) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('座席本予約開始');
        if (!purchaseModel.performance)
            throw new Error(req.__('common.error.property'));
        if (!purchaseModel.reserveSeats)
            throw new Error(req.__('common.error.property'));
        if (!purchaseModel.input)
            throw new Error(req.__('common.error.property'));
        if (!purchaseModel.transactionMP)
            throw Error(req.__('common.error.property'));
        if (!purchaseModel.expired)
            throw Error(req.__('common.error.property'));
        if (!req.session)
            throw Error(req.__('common.error.property'));
        //購入期限切れ
        const minutes = 5;
        if (purchaseModel.expired < moment().add(minutes, 'minutes').unix()) {
            console.log('購入期限切れ');
            //購入セッション削除
            delete req.session.purchase;
            throw {
                error: new Error(req.__('common.error.expire')),
                type: 'expired'
            };
        }
        const performance = purchaseModel.performance;
        const reserveSeats = purchaseModel.reserveSeats;
        const input = purchaseModel.input;
        try {
            // COA本予約
            purchaseModel.updateReserve = yield COA.ReserveService.updReserve({
                theater_code: performance.attributes.theater.id,
                date_jouei: performance.attributes.day,
                title_code: performance.attributes.film.coa_title_code,
                title_branch_num: performance.attributes.film.coa_title_branch_num,
                time_begin: performance.attributes.time_start,
                tmp_reserve_num: reserveSeats.tmp_reserve_num,
                reserve_name: `${input.last_name_hira}　${input.first_name_hira}`,
                reserve_name_jkana: `${input.last_name_hira}　${input.first_name_hira}`,
                tel_num: input.tel_num,
                mail_addr: input.mail_addr,
                reserve_amount: purchaseModel.getReserveAmount(),
                list_ticket: purchaseModel.getTicketList()
            });
            console.log('COA本予約', purchaseModel.updateReserve);
        }
        catch (err) {
            console.log('COA本予約エラー', err);
            throw {
                error: new Error(err.message),
                type: 'updateReserve'
            };
        }
        // MP購入者情報登録
        yield MP.ownersAnonymous({
            transactionId: purchaseModel.transactionMP.id,
            name_first: input.first_name_hira,
            name_last: input.last_name_hira,
            tel: input.tel_num,
            email: input.mail_addr
        });
        console.log('MP購入者情報登録');
        // MP照会情報登録
        yield MP.transactionsEnableInquiry({
            transactionId: purchaseModel.transactionMP.id,
            inquiry_theater: purchaseModel.performance.attributes.theater.id,
            inquiry_id: purchaseModel.updateReserve.reserve_num,
            inquiry_pass: purchaseModel.input.tel_num
        });
        console.log('MP照会情報登録');
        // MPメール登録
        yield MP.addEmail({
            transactionId: purchaseModel.transactionMP.id,
            from: 'noreply@localhost',
            to: purchaseModel.input.mail_addr,
            subject: '購入完了',
            content: getMailContent(req, purchaseModel)
        });
        console.log('MPメール登録');
        // MP取引成立
        yield MP.transactionClose({
            transactionId: purchaseModel.transactionMP.id
        });
        console.log('MP取引成立');
    });
}
/**
 * メール内容取得
 * @function getMailContent
 * @param {express.Request} req
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {string}
 */
function getMailContent(req, purchaseModel) {
    if (!purchaseModel.performance)
        throw new Error(req.__('common.error.property'));
    if (!purchaseModel.reserveSeats)
        throw new Error(req.__('common.error.property'));
    if (!purchaseModel.input)
        throw new Error(req.__('common.error.property'));
    if (!purchaseModel.updateReserve)
        throw new Error(req.__('common.error.property'));
    return `${purchaseModel.input.last_name_hira} ${purchaseModel.input.first_name_hira}　様\n
\n
この度は、シネマサンシャイン姶良のオンライン先売りチケットサービスにてご購入頂き、誠にありがとうございます。お客様がご購入されましたチケットの情報は下記の通りです。\n
\n
・予約番号：${purchaseModel.updateReserve.reserve_num}\n
・${moment(purchaseModel.performance.attributes.day).format('YYYY年MM月DD日')}
${req.__('week[' + moment(purchaseModel.performance.attributes.day).format('ddd') + ']')}
${UtilModule.timeFormat(purchaseModel.performance.attributes.time_start)}\n
・${purchaseModel.performance.attributes.film.name.ja}\n
・${purchaseModel.performance.attributes.screen.name.ja}\n
・${purchaseModel.ticketToString()}\n
　合計 ${purchaseModel.getReserveAmount()}\n
・座席番号：${purchaseModel.seatToString()}\n
\n
[チケット発券について]\n
チケットの発券/入場方法は2通りからお選び頂けます。\n
\n
<発券/入場方法1 劇場発券機で発券>\n
劇場に設置されている発券機にて発券頂きます。予約番号をお控えの上ご来場ください。\n
チケットが発券できなかった場合にはチケット売場にお越しください。\n
\n
<発券/入場方法2 入場用QRコードで入場>\n
以下のURLよりチケット情報確認画面へアクセス頂き、「チケットを購入した劇場」「予約番号」「お電話番号」を入力してログインしてください。 ご鑑賞時間の24時間前から入場用QRコードが表示されますので、入場時にそちらのQRコードをご提示ください。\n
http://XXXXXX\n
\n
[ご注意事項]\n
・ご購入されたチケットの変更、キャンセル、払い戻しはいかなる場合でも致しかねます。\n
・チケットの発券にお時間がかかる場合もございますので、お時間の余裕を持ってご来場ください。\n
・メンバーズカード会員のお客様は、ポイントは付与いたしますので、発券したチケットまたは、表示されたQRコードとメンバーズカードをチケット売場までお持ち下さいませ。\n
・年齢や学生など各種証明が必要なチケットを購入された方は、入場時にご提示ください。\n
ご提示頂けない場合は、一般料金との差額を頂きます。\n
\n
なお、このメールは、シネマサンシャイン姶良の予約システムでチケットをご購入頂いた方にお送りしておりますが、チケット購入に覚えのない方に届いております場合は、下記お問い合わせ先までご連絡ください。\n
※尚、このメールアドレスは送信専用となっておりますでので、ご返信頂けません。\n
ご不明な点がございましたら、下記番号までお問合わせ下さい。\n
\n
お問い合わせはこちら\n
シネマサンシャイン姶良\n
TEL：XX-XXXX-XXXX`;
}
/**
 * 購入確定
 * @memberOf Purchase.ConfirmModule
 * @function purchase
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
function purchase(req, res, next) {
    if (!req.session)
        return next(new Error(req.__('common.error.property')));
    const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
    if (!purchaseModel.transactionMP)
        return next(new Error(req.__('common.error.property')));
    //取引id確認
    if (req.body.transaction_id !== purchaseModel.transactionMP.id)
        return next(new Error(req.__('common.error.access')));
    updateReserve(req, purchaseModel).then(() => {
        //購入情報をセッションへ
        if (!req.session)
            throw req.__('common.error.property');
        req.session.complete = {
            updateReserve: purchaseModel.updateReserve,
            performance: purchaseModel.performance,
            input: purchaseModel.input,
            reserveSeats: purchaseModel.reserveSeats,
            reserveTickets: purchaseModel.reserveTickets,
            price: purchaseModel.getReserveAmount()
        };
        //購入セッション削除
        delete req.session.purchase;
        //購入完了情報を返す
        return res.json({
            err: null,
            redirect: false,
            result: req.session.complete.updateReserve
        });
    }).catch((err) => {
        //購入完了情報を返す
        return res.json({
            err: {
                message: (err.error) ? err.error.message : err.message,
                type: (err.type) ? err.type : null
            },
            redirect: (err.error) ? false : true,
            result: null
        });
    });
}
exports.purchase = purchase;
