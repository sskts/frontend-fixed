/**
 * 取引
 * @namespace Purchase.TransactionModule
 */

import * as debug from 'debug';
import { Request, Response } from 'express';
import * as moment from 'moment';
import * as MP from '../../../libs/MP/sskts-api';
import { PurchaseModel } from '../../models/Purchase/PurchaseModel';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';
import * as UtilModule from '../Util/UtilModule';
const log = debug('SSKTS:Purchase.TransactionModule');
/**
 * 販売終了時間 30分前
 * @memberof Purchase.TransactionModule
 * @const {number} END_TIME_DEFAULT
 */
const END_TIME_DEFAULT = 30;
/**
 * 販売終了時間(券売機) 10分後
 * @memberof Purchase.TransactionModule
 * @const {number} END_TIME_DEFAULT
 */
const END_TIME_FIXED = -10;

/**
 * 取引有効時間 15分間
 * @memberof Purchase.TransactionModule
 * @const {number} END_TIME_DEFAULT
 */
const VALID_TIME_DEFAULT = 15;
/**
 * 取引有効時間(券売機) 5分間
 * @memberof Purchase.TransactionModule
 * @const {number} END_TIME_DEFAULT
 */
const VALID_TIME_FIXED = 5;

/**
 * 取引開始
 * @memberof Purchase.TransactionModule
 * @function start
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
export async function start(req: Request, res: Response): Promise<void> {
    try {
        if (req.session === undefined || req.body.performanceId === undefined) {
            throw ErrorUtilModule.ERROR_PROPERTY;
        }

        // イベント情報取得
        const individualScreeningEvent = await MP.service.event.findIndividualScreeningEvent({
            auth: await UtilModule.createAuth(req),
            identifier: req.body.performanceId
        });
        log('イベント情報取得', individualScreeningEvent);

        // 開始可能日判定
        if (moment().unix() < moment(individualScreeningEvent.coaInfo.coaRsvStartDate).unix()) {
            throw ErrorUtilModule.ERROR_ACCESS;
        }
        log('開始可能日判定');

        // 終了可能日判定
        const limit = (process.env.VIEW_TYPE === 'fixed') ? END_TIME_FIXED : END_TIME_DEFAULT;
        const limitTime = moment().add(limit, 'minutes');
        if (limitTime.unix() > moment(individualScreeningEvent.startDate).unix()) {
            throw ErrorUtilModule.ERROR_ACCESS;
        }
        log('終了可能日判定');

        let purchaseModel = new PurchaseModel(req.session.purchase);
        if (purchaseModel.transaction !== null && purchaseModel.seatReservationAuthorization !== null) {
            // 重複確認へ
            res.json({ redirect: `/purchase/${req.body.performanceId}/overlap`, err: null });
            log('重複確認へ');

            return;
        }

        // セッション削除
        delete req.session.purchase;
        delete req.session.mvtk;
        delete req.session.complete;
        delete req.session.auth;
        log('セッション削除');

        // authセッションへ
        req.session.auth = {
            clientId: 'motionpicture',
            clientSecret: 'motionpicture',
            state: 'teststate',
            scopes: [
                'transactions',
                'events.read-only',
                'organizations.read-only'
            ]
        };
        log('authセッションへ');

        purchaseModel = new PurchaseModel({
            individualScreeningEvent: individualScreeningEvent
        });

        // 劇場ショップ検索
        const movieTheaters = await MP.service.organization.searchMovieTheaters({
            auth: await UtilModule.createAuth(req)
        });
        // 劇場のショップを検索
        purchaseModel.seller = movieTheaters.find((movieTheater: any) => {
            return (movieTheater.location.branchCode === individualScreeningEvent.coaInfo.theaterCode);
        });
        log('劇場のショップを検索', purchaseModel.seller);

        // 取引開始
        const valid = (process.env.VIEW_TYPE === 'fixed') ? VALID_TIME_FIXED : VALID_TIME_DEFAULT;
        purchaseModel.expired = moment().add(valid, 'minutes').toDate();
        purchaseModel.transaction = await MP.service.transaction.placeOrder.start({
            auth: await UtilModule.createAuth(req),
            expires: purchaseModel.expired,
            sellerId: purchaseModel.seller.id
        });
        log('MP取引開始', purchaseModel.transaction);

        //セッション更新
        req.session.purchase = purchaseModel.toSession();
        //座席選択へ
        res.json({ redirect: `/purchase/seat/${req.body.performanceId}/`, contents: null });
    } catch (err) {
        if (err === ErrorUtilModule.ERROR_ACCESS
            || err === ErrorUtilModule.ERROR_PROPERTY) {
            res.json({ redirect: null, contents: 'access-error' });

            return;
        }
        res.json({ redirect: null, contents: 'access-congestion' });
    }
}
