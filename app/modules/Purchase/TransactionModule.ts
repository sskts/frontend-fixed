/**
 * 取引
 * @namespace Purchase.TransactionModule
 */

import * as ssktsApi from '@motionpicture/sskts-api';
import * as debug from 'debug';
import { Request, Response } from 'express';
import * as moment from 'moment';
import { AuthModel } from '../../models/Auth/AuthModel';
import { PurchaseModel } from '../../models/Purchase/PurchaseModel';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';
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
        const individualScreeningEvent = await ssktsApi.service.event.findIndividualScreeningEvent({
            auth: new AuthModel(req.session.auth).create(),
            identifier: req.body.performanceId
        });
        log('イベント情報取得', individualScreeningEvent);
        if (individualScreeningEvent === null) throw ErrorUtilModule.ERROR_ACCESS;

        // 開始可能日判定
        if (moment().unix() < moment(individualScreeningEvent.coaInfo.rsvStartDate).unix()) {
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
            clientId: process.env.TEST_CLIENT_ID,
            clientSecret: process.env.TEST_CLIENT_SECRET,
            state: 'teststate',
            scopes: [
                'https://sskts-api-development.azurewebsites.net/transactions',
                'https://sskts-api-development.azurewebsites.net/events.read-only',
                'https://sskts-api-development.azurewebsites.net/organizations.read-only'
            ]
        };
        log('authセッションへ');

        purchaseModel = new PurchaseModel({
            individualScreeningEvent: individualScreeningEvent
        });

        // 劇場のショップを検索
        purchaseModel.movieTheaterOrganization = await ssktsApi.service.organization.findMovieTheaterByBranchCode({
            auth: new AuthModel(req.session.auth).create(),
            branchCode: individualScreeningEvent.coaInfo.theaterCode
        });
        log('劇場のショップを検索', purchaseModel.movieTheaterOrganization);
        if (purchaseModel.movieTheaterOrganization === null) throw ErrorUtilModule.ERROR_PROPERTY;

        // 取引開始
        const valid = (process.env.VIEW_TYPE === 'fixed') ? VALID_TIME_FIXED : VALID_TIME_DEFAULT;
        purchaseModel.expired = moment().add(valid, 'minutes').toDate();
        purchaseModel.transaction = await ssktsApi.service.transaction.placeOrder.start({
            auth: new AuthModel(req.session.auth).create(),
            expires: purchaseModel.expired,
            sellerId: purchaseModel.movieTheaterOrganization.id
        });
        log('SSKTS取引開始', purchaseModel.transaction);

        //セッション更新
        purchaseModel.save(req.session);
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
