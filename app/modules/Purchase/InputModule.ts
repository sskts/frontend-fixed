/**
 * 購入情報入力
 * @namespace Purchase.InputModule
 */

import * as COA from '@motionpicture/coa-service';
import * as GMO from '@motionpicture/gmo-service';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as moment from 'moment';
import * as MP from '../../../libs/MP';
import InputForm from '../../forms/Purchase/InputForm';
import logger from '../../middlewares/logger';
import * as PurchaseSession from '../../models/Purchase/PurchaseModel';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';
import * as UtilModule from '../Util/UtilModule';
const log = debug('SSKTS:Purchase.InputModule');

/**
 * 購入者情報入力
 * @memberof Purchase.InputModule
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
export function index(req: Request, res: Response, next: NextFunction): void {
    try {
        if (req.session === undefined) throw ErrorUtilModule.ERROR_PROPERTY;
        if (req.session.purchase === undefined) throw ErrorUtilModule.ERROR_EXPIRE;
        const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
        if (purchaseModel.isExpired()) throw ErrorUtilModule.ERROR_EXPIRE;
        if (!purchaseModel.accessAuth(PurchaseSession.PurchaseModel.INPUT_STATE)) {
            throw ErrorUtilModule.ERROR_EXPIRE;
        }
        if (purchaseModel.theater === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.transactionMP === null) throw ErrorUtilModule.ERROR_PROPERTY;

        //購入者情報入力表示
        res.locals.error = null;
        res.locals.gmoError = null;
        res.locals.gmoModuleUrl = process.env.GMO_CLIENT_MODULE;
        res.locals.gmoShopId = purchaseModel.theater.attributes.gmo.shop_id;
        res.locals.price = purchaseModel.getReserveAmount();
        res.locals.transactionId = purchaseModel.transactionMP.id;
        res.locals.performance = purchaseModel.performance;
        if (purchaseModel.input !== null) {
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
        // if (process.env.NODE_ENV === 'development' && purchaseModel.input === null) {
        //     res.locals.input = {
        //         last_name_hira: 'はたぐち',
        //         first_name_hira: 'あきと',
        //         mail_addr: 'hataguchi@motionpicture.jp',
        //         mail_confirm: 'hataguchi@motionpicture.jp',
        //         tel_num: '09040007648'
        //     };
        // }
        //セッション更新
        req.session.purchase = purchaseModel.toSession();
        res.locals.step = PurchaseSession.PurchaseModel.INPUT_STATE;
        res.render('purchase/input', { layout: 'layouts/purchase/layout' });

        return;

    } catch (err) {
        const error = (err instanceof Error)
            ? new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message)
            : new ErrorUtilModule.CustomError(err, undefined);
        next(error);

        return;
    }
}

/**
 * 購入者情報入力完了
 * @memberof Purchase.InputModule
 * @function submit
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
// tslint:disable-next-line:max-func-body-length
// tslint:disable-next-line:cyclomatic-complexity
export async function submit(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (req.session === undefined) {
        next(new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_PROPERTY, undefined));

        return;
    }
    try {
        if (req.session.purchase === undefined) throw ErrorUtilModule.ERROR_EXPIRE;
        const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
        if (purchaseModel.isExpired()) throw ErrorUtilModule.ERROR_EXPIRE;
        if (purchaseModel.theater === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.transactionMP === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.performance === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.reserveSeats === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.reserveTickets === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.performanceCOA === null) throw ErrorUtilModule.ERROR_PROPERTY;
        //取引id確認
        if (req.body.transaction_id !== purchaseModel.transactionMP.id) {
            throw ErrorUtilModule.ERROR_ACCESS;
        }
        //バリデーション
        InputForm(req);
        const validationResult = await req.getValidationResult();
        const accessToken = await UtilModule.getAccessToken(req);
        if (!validationResult.isEmpty()) {
            res.locals.error = validationResult.mapped();
            res.locals.gmoError = null;
            res.locals.input = req.body;
            res.locals.gmoModuleUrl = process.env.GMO_CLIENT_MODULE;
            res.locals.gmoShopId = purchaseModel.theater.attributes.gmo.shop_id;
            res.locals.price = purchaseModel.getReserveAmount();
            res.locals.transactionId = purchaseModel.transactionMP.id;
            res.locals.performance = purchaseModel.performance;
            res.locals.step = PurchaseSession.PurchaseModel.INPUT_STATE;
            res.render('purchase/input', { layout: 'layouts/purchase/layout' });

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
        if (purchaseModel.transactionGMO !== null
            && purchaseModel.authorizationGMO !== null
            && purchaseModel.orderId !== null) {
            await removeAuthorization(purchaseModel, accessToken);
            log('GMOオーソリ削除');
        }
        if (purchaseModel.getReserveAmount() > 0) {
            res.locals.gmoError = null;
            // クレジット決済
            purchaseModel.gmo = JSON.parse(req.body.gmo_token_object);
            await addAuthorization(req, res, purchaseModel, accessToken);
            log('オーソリ追加');
        }
        await MP.services.transaction.ownersAnonymous({
            accessToken: accessToken,
            transactionId: purchaseModel.transactionMP.id,
            name_first: purchaseModel.input.first_name_hira,
            name_last: purchaseModel.input.last_name_hira,
            tel: purchaseModel.input.tel_num,
            email: purchaseModel.input.mail_addr
        });
        log('MP購入者情報登録');
        await MP.services.transaction.transactionsEnableInquiry({
            accessToken: accessToken,
            transactionId: purchaseModel.transactionMP.id,
            inquiry_theater: purchaseModel.performance.attributes.theater.id,
            inquiry_id: purchaseModel.reserveSeats.tmp_reserve_num,
            inquiry_pass: purchaseModel.input.tel_num
        });
        // await MP.services.transaction.transactionsInquiryKey({
        //     transactionId: purchaseModel.transactionMP.id,
        //     theater_code: purchaseModel.performance.attributes.theater.id,
        //     reserve_num: purchaseModel.reserveSeats.tmp_reserve_num,
        //     tel: purchaseModel.input.tel_num
        // });
        log('MP照会情報登録');
        const reserveSeatsString = purchaseModel.reserveTickets.map((ticket) => {
            return `${ticket.seat_code} ${ticket.ticket_name} ￥${UtilModule.formatPrice(ticket.sale_price)}`;
        });
        if (purchaseModel.completeMailId !== null) {
            await MP.services.transaction.removeEmail({
                accessToken: accessToken,
                transactionId: purchaseModel.transactionMP.id,
                emailId: purchaseModel.completeMailId
            });
            log('MPメール削除');
        }
        // APIへ移行予定
        const theater = await COA.services.master.theater({
            theater_code: purchaseModel.theater.id
        });
        if (process.env.VIEW_TYPE !== 'fixed') {
            const locals = {
                performance: purchaseModel.performance,
                reserveSeats: purchaseModel.reserveSeats,
                input: purchaseModel.input,
                reserveSeatsString: reserveSeatsString,
                amount: UtilModule.formatPrice(purchaseModel.getReserveAmount()),
                domain: req.headers.host,
                theaterTelNumber: theater.theater_tel_num,
                moment: moment,
                timeFormat: UtilModule.timeFormat,
                __: req.__,
                layout: false
            };
            const emailTemplate = await UtilModule.getEmailTemplate(res, `email/complete/${req.__('lang')}`, locals);
            purchaseModel.completeMailId = await MP.services.transaction.addEmail({
                accessToken: accessToken,
                transactionId: purchaseModel.transactionMP.id,
                from: 'noreply@ticket-cinemasunshine.com',
                to: purchaseModel.input.mail_addr,
                subject: `${purchaseModel.theater.attributes.name.ja} 購入完了のお知らせ`,
                content: emailTemplate
            });
            log('MPメール登録');
        }
        // セッション更新
        req.session.purchase = purchaseModel.toSession();
        // 購入者内容確認へ
        res.redirect('/purchase/confirm');

        return;
    } catch (err) {
        if (err === ErrorUtilModule.ERROR_VALIDATION) {
            const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
            if (purchaseModel.theater === null || purchaseModel.transactionMP === null) {
                next(new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_PROPERTY, undefined));

                return;
            }
            const gmoShopId = purchaseModel.theater.attributes.gmo.shop_id;
            log('GMO処理エラー');
            res.locals.error = { gmo: { parm: 'gmo', msg: req.__('common.error.gmo'), value: '' } };
            res.locals.input = req.body;
            res.locals.gmoModuleUrl = process.env.GMO_CLIENT_MODULE;
            res.locals.gmoShopId = gmoShopId;
            res.locals.price = purchaseModel.getReserveAmount();
            res.locals.transactionId = purchaseModel.transactionMP.id;
            res.locals.performance = purchaseModel.performance;
            res.locals.step = PurchaseSession.PurchaseModel.INPUT_STATE;
            res.render('purchase/input', { layout: 'layouts/purchase/layout' });

            return;
        }
        const error = (err instanceof Error)
            ? new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message)
            : new ErrorUtilModule.CustomError(err, undefined);
        next(error);

        return;
    }
}

/**
 * オーソリ追加
 * @memberof Purchase.InputModule
 * @function addAuthorization
 * @param {Reqest} req
 * @param {Response} res
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @param {string} accessToken
 * @returns {void}
 */
async function addAuthorization(
    req: Request,
    res: Response,
    purchaseModel: PurchaseSession.PurchaseModel,
    accessToken: string
): Promise<void> {
    if (req.session === undefined) throw ErrorUtilModule.ERROR_PROPERTY;
    if (purchaseModel.transactionMP === null) throw ErrorUtilModule.ERROR_PROPERTY;
    if (purchaseModel.gmo === null) throw ErrorUtilModule.ERROR_PROPERTY;
    if (purchaseModel.performance === null) throw ErrorUtilModule.ERROR_PROPERTY;
    if (purchaseModel.reserveSeats === null) throw ErrorUtilModule.ERROR_PROPERTY;
    if (purchaseModel.theater === null) throw ErrorUtilModule.ERROR_PROPERTY;
    const gmoShopId = purchaseModel.theater.attributes.gmo.shop_id;
    const gmoShopPassword = purchaseModel.theater.attributes.gmo.shop_pass;
    const amount: number = purchaseModel.getReserveAmount();
    // GMOオーソリ取得
    const theaterId = `000${purchaseModel.performance.attributes.theater.id}`.slice(UtilModule.DIGITS_03);
    const reservenum = `00000000${purchaseModel.reserveSeats.tmp_reserve_num}`.slice(UtilModule.DIGITS_08);
    // オーダーID 予約日 + 劇場ID(3桁) + 予約番号(8桁) + オーソリカウント(2桁)
    purchaseModel.orderId = `${moment().format('YYYYMMDD')}${theaterId}${reservenum}${purchaseModel.authorizationCountGMOToString()}`;
    const entryTranIn = {
        shopId: gmoShopId,
        shopPass: gmoShopPassword,
        orderId: purchaseModel.orderId,
        jobCd: GMO.Util.JOB_CD_AUTH,
        amount: amount
    };
    log('GMO取引作成In', entryTranIn);
    purchaseModel.authorizationCountGMO += 1;
    log('GMOオーソリカウント加算', purchaseModel.authorizationCountGMOToString());
    log('オーダーID', purchaseModel.orderId);
    // セッション更新
    req.session.purchase = purchaseModel.toSession();
    try {
        purchaseModel.transactionGMO = await GMO.CreditService.entryTran(entryTranIn);
        log('GMO取引作成Out', purchaseModel.orderId);
    } catch (err) {
        logger.error('SSKTS-APP:InputModule.addAuthorization', 'orderId', entryTranIn.orderId, 'entryTranResult', err);
        res.locals.gmoError = err;
        throw ErrorUtilModule.ERROR_VALIDATION;
    }
    const execTranIn = {
        accessId: purchaseModel.transactionGMO.accessId,
        accessPass: purchaseModel.transactionGMO.accessPass,
        orderId: purchaseModel.orderId,
        method: '1',
        token: purchaseModel.gmo.token
    };
    log('GMOオーソリ取得In', execTranIn);
    try {
        const execTranResult = await GMO.CreditService.execTran(execTranIn);
        log('GMOオーソリ取得Out', execTranResult);
    } catch (err) {
        logger.error('SSKTS-APP:InputModule.addAuthorization orderId', entryTranIn.orderId, 'execTranResult', err);
        res.locals.gmoError = err;
        throw ErrorUtilModule.ERROR_VALIDATION;
    }
    // GMOオーソリ追加
    purchaseModel.authorizationGMO = await MP.services.transaction.addGMOAuthorization({
        accessToken: accessToken,
        transaction: purchaseModel.transactionMP,
        orderId: purchaseModel.orderId,
        amount: amount,
        entryTranResult: purchaseModel.transactionGMO,
        gmoShopId: purchaseModel.theater.attributes.gmo.shop_id,
        gmoShopPassword: purchaseModel.theater.attributes.gmo.shop_pass
    });
}

/**
 * オーソリ削除
 * @memberof Purchase.InputModule
 * @function removeAuthorization
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @param {string} accessToken
 * @returns {void}
 */
async function removeAuthorization(purchaseModel: PurchaseSession.PurchaseModel, accessToken: string): Promise<void> {
    if (purchaseModel.transactionMP === null) throw ErrorUtilModule.ERROR_PROPERTY;
    if (purchaseModel.authorizationGMO === null) throw ErrorUtilModule.ERROR_PROPERTY;
    if (purchaseModel.transactionGMO === null) throw ErrorUtilModule.ERROR_PROPERTY;
    if (purchaseModel.theater === null) throw ErrorUtilModule.ERROR_PROPERTY;
    const gmoShopId = purchaseModel.theater.attributes.gmo.shop_id;
    const gmoShopPassword = purchaseModel.theater.attributes.gmo.shop_pass;
    //GMOオーソリ取消
    const alterTranIn = {
        shopId: gmoShopId,
        shopPass: gmoShopPassword,
        accessId: purchaseModel.transactionGMO.accessId,
        accessPass: purchaseModel.transactionGMO.accessPass,
        jobCd: GMO.Util.JOB_CD_VOID
    };
    try {
        const alterTranResult = await GMO.CreditService.alterTran(alterTranIn);
        log('GMOオーソリ取消', alterTranResult);
    } catch (err) {
        logger.error('SSKTS-APP:InputModule.removeAuthorization alterTranIn', alterTranIn, 'alterTranResult', err);
        throw ErrorUtilModule.ERROR_VALIDATION;
    }
    // GMOオーソリ削除
    await MP.services.transaction.removeGMOAuthorization({
        accessToken: accessToken,
        transactionId: purchaseModel.transactionMP.id,
        gmoAuthorizationId: purchaseModel.authorizationGMO.id
    });
}
