/**
 * 購入確認
 * @namespace Purchase.ConfirmModule
 */

import * as COA from '@motionpicture/coa-service';
import * as MVTK from '@motionpicture/mvtk-service';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as moment from 'moment';
import * as MP from '../../../../libs/MP';
import * as PurchaseSession from '../../models/Purchase/PurchaseModel';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';
import * as UtilModule from '../Util/UtilModule';
import * as MvtkUtilModule from './Mvtk/MvtkUtilModule';
const debugLog = debug('SSKTS ');

/**
 * 購入者内容確認
 * @memberOf Purchase.ConfirmModule
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
export async function index(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (req.session === undefined) throw ErrorUtilModule.ERROR_PROPERTY;
        if (req.session.purchase === undefined) throw ErrorUtilModule.ERROR_EXPIRE;
        const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
        if (!purchaseModel.accessAuth(PurchaseSession.PurchaseModel.CONFIRM_STATE)) {
            throw ErrorUtilModule.ERROR_EXPIRE;
        }
        if (purchaseModel.transactionMP === null) throw ErrorUtilModule.ERROR_PROPERTY;

        //購入者内容確認表示
        res.locals.gmoTokenObject = (purchaseModel.gmo !== null) ? purchaseModel.gmo : null;
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
        res.locals.prevLink = (purchaseModel.performance !== null)
            ? UtilModule.getTheaterUrl(purchaseModel.performance.attributes.theater.name.en)
            : UtilModule.getPortalUrl();

        //セッション更新
        req.session.purchase = purchaseModel.toSession();
        res.render('purchase/confirm');
        return;
    } catch (err) {
        next(ErrorUtilModule.getError(req, err));
        return;
    }
}

/**
 * ムビチケ決済
 * @memberOf Purchase.ConfirmModule
 * @function reserveMvtk
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {Promise<void>}
 */
async function reserveMvtk(purchaseModel: PurchaseSession.PurchaseModel): Promise<void> {
    if (purchaseModel.reserveTickets === null) throw ErrorUtilModule.ERROR_PROPERTY;
    if (purchaseModel.reserveSeats === null) throw ErrorUtilModule.ERROR_PROPERTY;
    if (purchaseModel.updateReserve === null) throw ErrorUtilModule.ERROR_PROPERTY;
    if (purchaseModel.performance === null) throw ErrorUtilModule.ERROR_PROPERTY;
    if (purchaseModel.mvtk === null) throw ErrorUtilModule.ERROR_PROPERTY;
    if (purchaseModel.performanceCOA === null) throw ErrorUtilModule.ERROR_PROPERTY;
    debugLog('ムビチケ決済開始');
    // 購入管理番号情報
    const mvtkTickets = [];
    // 座席情報
    const reserveSeats = [];
    for (const reserveTicket of purchaseModel.reserveTickets) {
        const mvtk = purchaseModel.mvtk.find((value) => {
            return (value.code === reserveTicket.mvtk_num && value.ticket.ticket_code === reserveTicket.ticket_code);
        });
        if (mvtk === undefined) continue;

        const mvtkTicket = mvtkTickets.find((value) => {
            return (value.KNYKNR_NO === mvtk.code);
        });

        if (mvtkTicket !== undefined) {
            // 券種追加
            const tcket = mvtkTicket.KNSH_INFO.find((value) => {
                return (value.KNSH_TYP === mvtk.ykknInfo.ykknshTyp);
            });
            if (tcket !== undefined) {
                // 枚数追加
                tcket.MI_NUM = String(Number(tcket.MI_NUM) + 1);
            } else {
                // 新規券種作成
                mvtkTicket.KNSH_INFO.push({
                    KNSH_TYP: mvtk.ykknInfo.ykknshTyp, //券種区分
                    MI_NUM: '1' //枚数
                });
            }
        } else {
            // 新規購入番号作成
            mvtkTickets.push({
                KNYKNR_NO: mvtk.code, //購入管理番号（ムビチケ購入番号）
                PIN_CD: UtilModule.base64Decode(mvtk.password), //PINコード（ムビチケ暗証番号）
                KNSH_INFO: [
                    {
                        KNSH_TYP: mvtk.ykknInfo.ykknshTyp, //券種区分
                        MI_NUM: '1' //枚数
                    }
                ]
            });
        }
        reserveSeats.push({
            ZSK_CD: reserveTicket.seat_code //座席コード
        });
    }

    debugLog('購入管理番号情報', mvtkTickets);
    if (mvtkTickets.length === 0 || reserveSeats.length === 0) return;

    // 興行会社システム座席予約番号(劇場コード + 予約番号)
    const reserveNo = `${purchaseModel.performance.attributes.theater.id}${purchaseModel.reserveSeats.tmp_reserve_num}`;
    // 興行会社ユーザー座席予約番号(予約番号)
    const startDate = {
        day: `${moment(purchaseModel.performance.attributes.day).format('YYYY/MM/DD')}`,
        time: `${UtilModule.timeFormat(purchaseModel.performance.attributes.time_start)}:00`
    };
    const seatInfoSyncService = MVTK.createSeatInfoSyncService();

    const result = await seatInfoSyncService.seatInfoSync({
        kgygishCd: MvtkUtilModule.COMPANY_CODE, // 興行会社コード
        yykDvcTyp: MVTK.SeatInfoSyncUtilities.RESERVED_DEVICE_TYPE_ENTERTAINER_SITE_PC, // 予約デバイス区分
        trkshFlg: MVTK.SeatInfoSyncUtilities.DELETE_FLAG_FALSE, // 取消フラグ
        kgygishSstmZskyykNo: reserveNo, // 興行会社システム座席予約番号
        kgygishUsrZskyykNo: String(purchaseModel.updateReserve.reserve_num), // 興行会社ユーザー座席予約番号
        jeiDt: `${startDate.day} ${startDate.time}`, // 上映日時
        kijYmd: startDate.day, // 計上年月日
        stCd: MvtkUtilModule.getSiteCode(purchaseModel.performance.attributes.theater.id), // サイトコード
        screnCd: purchaseModel.performanceCOA.screenCode, // スクリーンコード
        knyknrNoInfo: mvtkTickets, // 購入管理番号情報
        zskInfo: reserveSeats, // 座席情報（itemArray）
        skhnCd: MvtkUtilModule.getfilmCode(
            purchaseModel.performanceCOA.titleCode,
            purchaseModel.performanceCOA.titleBranchNum) // 作品コード
    });

    if (result.zskyykResult !== MVTK.SeatInfoSyncUtilities.RESERVATION_SUCCESS) throw ErrorUtilModule.ERROR_PROPERTY;
}

/**
 * 座席本予約
 * @memberOf Purchase.ConfirmModule
 * @function updateReserve
 * @param {Request} req
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {Promise<void>}
 */
async function updateReserve(req: Request, purchaseModel: PurchaseSession.PurchaseModel): Promise<void> {
    debugLog('座席本予約開始');
    if (purchaseModel.performance === null) throw ErrorUtilModule.ERROR_PROPERTY;
    if (purchaseModel.reserveSeats === null) throw ErrorUtilModule.ERROR_PROPERTY;
    if (purchaseModel.input === null) throw ErrorUtilModule.ERROR_PROPERTY;
    if (purchaseModel.reserveTickets === null) throw ErrorUtilModule.ERROR_PROPERTY;
    if (purchaseModel.transactionMP === null) throw ErrorUtilModule.ERROR_PROPERTY;
    if (purchaseModel.expired === null) throw ErrorUtilModule.ERROR_PROPERTY;
    if (purchaseModel.performanceCOA === null) throw ErrorUtilModule.ERROR_PROPERTY;

    const performance = purchaseModel.performance;
    const reserveSeats = purchaseModel.reserveSeats;
    const input = purchaseModel.input;

    // COA本予約
    purchaseModel.updateReserve = await COA.ReserveService.updReserve({
        theater_code: performance.attributes.theater.id,
        date_jouei: performance.attributes.day,
        title_code: purchaseModel.performanceCOA.titleCode,
        title_branch_num: purchaseModel.performanceCOA.titleBranchNum,
        time_begin: performance.attributes.time_start,
        tmp_reserve_num: reserveSeats.tmp_reserve_num,
        reserve_name: `${input.last_name_hira}　${input.first_name_hira}`,
        reserve_name_jkana: `${input.last_name_hira}　${input.first_name_hira}`,
        tel_num: input.tel_num,
        mail_addr: input.mail_addr,
        reserve_amount: purchaseModel.getReserveAmount(),
        list_ticket: purchaseModel.reserveTickets.map((ticket) => {
            let mvtkAppPrice = 0;
            // ムビチケ計上単価取得
            if (purchaseModel.mvtk !== null) {
                const mvtkTicket = purchaseModel.mvtk.find((value) => {
                    return (value.code === ticket.mvtk_num && value.ticket.ticket_code === ticket.ticket_code);
                });
                if (mvtkTicket !== undefined) {
                    mvtkAppPrice = Number(mvtkTicket.ykknInfo.kijUnip);
                }
            }
            return {
                ticket_code: ticket.ticket_code,
                std_price: ticket.std_price,
                add_price: ticket.add_price,
                dis_price: 0,
                sale_price: (ticket.std_price + ticket.add_price),
                ticket_count: 1,
                mvtk_app_price: mvtkAppPrice,
                seat_num: ticket.seat_code,
                add_glasses: (ticket.glasses) ? ticket.add_price_glasses : 0
            };
        })
    });
    debugLog('COA本予約', purchaseModel.updateReserve);

    // ムビチケ使用
    if (purchaseModel.mvtk !== null) {
        await reserveMvtk(purchaseModel);
        debugLog('ムビチケ決済');
    }

    // MP購入者情報登録
    await MP.ownersAnonymous({
        transactionId: purchaseModel.transactionMP.id,
        name_first: input.first_name_hira,
        name_last: input.last_name_hira,
        tel: input.tel_num,
        email: input.mail_addr
    });
    debugLog('MP購入者情報登録');

    // MP照会情報登録
    await MP.transactionsEnableInquiry({
        transactionId: purchaseModel.transactionMP.id,
        inquiry_theater: purchaseModel.performance.attributes.theater.id,
        inquiry_id: purchaseModel.updateReserve.reserve_num,
        inquiry_pass: purchaseModel.input.tel_num
    });
    debugLog('MP照会情報登録');

    // MPメール登録
    await MP.addEmail({
        transactionId: purchaseModel.transactionMP.id,
        from: 'noreply@localhost',
        to: purchaseModel.input.mail_addr,
        subject: '購入完了',
        content: getMailContent(req, purchaseModel)
    });
    debugLog('MPメール登録');

    // MP取引成立
    await MP.transactionClose({
        transactionId: purchaseModel.transactionMP.id
    });
    debugLog('MP取引成立');
}

/**
 * メール内容取得
 * @function getMailContent
 * @param {Request} req
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {string}
 */
function getMailContent(req: Request, purchaseModel: PurchaseSession.PurchaseModel): string {
    if (purchaseModel.performance === null) throw ErrorUtilModule.ERROR_PROPERTY;
    if (purchaseModel.reserveSeats === null) throw ErrorUtilModule.ERROR_PROPERTY;
    if (purchaseModel.input === null) throw ErrorUtilModule.ERROR_PROPERTY;
    if (purchaseModel.updateReserve === null) throw ErrorUtilModule.ERROR_PROPERTY;
    return `${purchaseModel.input.last_name_hira} ${purchaseModel.input.first_name_hira} 様\n
\n
この度は、シネマサンシャイン姶良のオンライン先売りチケットサービスにてご購入頂き、誠にありがとうございます。お客様がご購入されましたチケットの情報は下記の通りです。\n
\n
・[予約番号] ${purchaseModel.updateReserve.reserve_num}\n
・[鑑賞日時] ${moment(purchaseModel.performance.attributes.day).format('YYYY年MM月DD日')} 
${req.__('week[' + moment(purchaseModel.performance.attributes.day).format('ddd') + ']')} 
${UtilModule.timeFormat(purchaseModel.performance.attributes.time_start)}\n
・[作品名] ${purchaseModel.performance.attributes.film.name.ja}\n
・[スクリーン名] ${purchaseModel.performance.attributes.screen.name.ja}\n
・[券種] ${purchaseModel.ticketToString()}\n
・[合計] ￥${purchaseModel.getReserveAmount()}\n
・[座席番号] ${purchaseModel.seatToString()}\n
\n
【チケット発券について】\n
チケットの発券/入場方法は2通りからお選び頂けます。\n
\n
<発券/入場方法1 劇場発券機で発券>\n
劇場に設置されている発券機にて発券頂きます。予約番号をお控えの上ご来場ください。\n
チケットが発券できなかった場合にはチケット売場にお越しください。\n
\n
<発券/入場方法2 入場用QRコードで入場>\n
以下のURLよりチケット情報確認画面へアクセス頂き、「チケットを購入した劇場」「予約番号」「お電話番号」を入力してログインしてください。 ご鑑賞時間の24時間前から入場用QRコードが表示されますので、入場時にそちらのQRコードをご提示ください。\n
https://${(<any>req.headers).host}/inquiry/login\n
\n
【ご注意事項】\n
・ご購入されたチケットの変更、キャンセル、払い戻しはいかなる場合でも致しかねます。\n
・チケットの発券にお時間がかかる場合もございますので、お時間の余裕を持ってご来場ください。\n
・メンバーズカード会員のお客様は、ポイントは付与いたしますので、発券したチケットまたは、表示されたQRコードとメンバーズカードをチケット売場までお持ち下さいませ。\n
・年齢や学生など各種証明が必要なチケットを購入された方は、入場時にご提示ください。\n
ご提示頂けない場合は、一般料金との差額を頂きます。\n
\n
なお、このメールは、${purchaseModel.performance.attributes.theater.name.ja}の予約システムでチケットをご購入頂いた方にお送りしておりますが、
チケット購入に覚えのない方に届いております場合は、下記お問い合わせ先までご連絡ください。\n
※なお、このメールアドレスは送信専用となっておりますでので、ご返信頂けません。\n
ご不明な点がございましたら、下記番号までお問合わせ下さい。\n
\n
お問い合わせはこちら\n
${purchaseModel.performance.attributes.theater.name.ja}\n
TEL：XX-XXXX-XXXX`;
}

/**
 * 購入確定
 * @memberOf Purchase.ConfirmModule
 * @function purchase
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<Response>}
 * @description フロー(本予約成功、本予約失敗、購入期限切れ)
 */
// tslint:disable-next-line:variable-name
export async function purchase(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
        if (req.session === undefined) throw ErrorUtilModule.ERROR_PROPERTY;
        if (req.session.purchase === undefined) throw ErrorUtilModule.ERROR_EXPIRE;
        const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
        if (purchaseModel.transactionMP === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.expired === null) throw ErrorUtilModule.ERROR_EXPIRE;

        //取引id確認
        if (req.body.transaction_id !== purchaseModel.transactionMP.id) throw ErrorUtilModule.ERROR_ACCESS;

        //購入期限切れ
        const minutes = 5;
        if (purchaseModel.expired < moment().add(minutes, 'minutes').unix()) {
            debugLog('購入期限切れ');
            //購入セッション削除
            delete req.session.purchase;
            throw ErrorUtilModule.ERROR_ACCESS;
        }

        await updateReserve(req, purchaseModel);
        //購入情報をセッションへ
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
        return res.json({ err: null, result: req.session.complete.updateReserve });
    } catch (err) {
        debugLog('ERROR', err);
        //購入セッション削除
        delete (<any>req.session).purchase;
        const msg = ErrorUtilModule.getError(req, err).message;
        return res.json({ err: msg, result: null });
    }
}

/**
 * 完了情報取得
 * @function getCompleteData
 * @returns {Response}
 */
// tslint:disable-next-line:variable-name
export function getCompleteData(req: Request, res: Response, _next: NextFunction): Response {
    try {
        if (req.session === undefined) throw ErrorUtilModule.ERROR_PROPERTY;
        if (req.session.complete === undefined) throw ErrorUtilModule.ERROR_EXPIRE;
        return res.json({ err: null, result: (<any>req.session).complete });
    } catch (err) {
        const msg = ErrorUtilModule.getError(req, err).message;
        return res.json({ err: msg, result: null });
    }
}
