/**
 * 取引
 * @namespace Purchase.TransactionModule
 */

import * as sasaki from '@motionpicture/sskts-api-nodejs-client';
import * as debug from 'debug';
import { Request, Response } from 'express';
import * as moment from 'moment';
import { AuthModel } from '../../models/Auth/AuthModel';
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
// tslint:disable-next-line:max-func-body-length
export async function start(req: Request, res: Response): Promise<void> {
    try {
        if (req.session === undefined || req.body.performanceId === undefined) {
            throw ErrorUtilModule.ErrorType.Property;
        }
        const authModel = new AuthModel(req.session.auth);
        const options = {
            endpoint: (<string>process.env.SSKTS_API_ENDPOINT),
            auth: authModel.create()
        };
        authModel.save(req.session);
        log('会員判定', authModel.isMember());

        // イベント情報取得
        const individualScreeningEvent = await sasaki.service.event(options).findIndividualScreeningEvent({
            identifier: req.body.performanceId
        });
        log('イベント情報取得', individualScreeningEvent);
        if (individualScreeningEvent === null) throw ErrorUtilModule.ErrorType.Access;
        // awsCognitoIdentityIdを保存
        if (req.body.identityId === undefined) {
            delete req.session.awsCognitoIdentityId;
        } else {
            req.session.awsCognitoIdentityId = req.body.identityId;
            log('awsCognitoIdentityIdを保存', req.session.awsCognitoIdentityId);
        }

        // 開始可能日判定
        if (moment().unix() < moment(individualScreeningEvent.coaInfo.rsvStartDate).unix()) {
            throw ErrorUtilModule.ErrorType.Access;
        }
        log('開始可能日判定');

        // 終了可能日判定
        const limit = (process.env.VIEW_TYPE === UtilModule.VIEW.Fixed) ? END_TIME_FIXED : END_TIME_DEFAULT;
        const limitTime = moment().add(limit, 'minutes');
        if (limitTime.unix() > moment(individualScreeningEvent.startDate).unix()) {
            throw ErrorUtilModule.ErrorType.Access;
        }
        log('終了可能日判定');

        let purchaseModel: PurchaseModel;

        if (!authModel.isMember()) {
            // 非会員なら重複確認
            purchaseModel = new PurchaseModel(req.session.purchase);
            log('重複確認');
            if (purchaseModel.transaction !== null && purchaseModel.seatReservationAuthorization !== null) {
                // 重複確認へ
                res.json({ redirect: `/purchase/${req.body.performanceId}/overlap`, contents: null });
                log('重複確認へ');

                return;
            }
        }

        // セッション削除
        delete req.session.purchase;
        delete req.session.mvtk;
        delete req.session.complete;
        log('セッション削除');

        purchaseModel = new PurchaseModel({
            individualScreeningEvent: individualScreeningEvent
        });

        // 劇場のショップを検索
        purchaseModel.movieTheaterOrganization = await sasaki.service.organization(options).findMovieTheaterByBranchCode({
            branchCode: individualScreeningEvent.coaInfo.theaterCode
        });
        log('劇場のショップを検索', purchaseModel.movieTheaterOrganization);
        if (purchaseModel.movieTheaterOrganization === null) throw ErrorUtilModule.ErrorType.Property;

        // 取引開始
        const valid = (process.env.VIEW_TYPE === UtilModule.VIEW.Fixed) ? VALID_TIME_FIXED : VALID_TIME_DEFAULT;
        purchaseModel.expired = moment().add(valid, 'minutes').toDate();
        purchaseModel.transaction = await sasaki.service.transaction.placeOrder(options).start({
            expires: purchaseModel.expired,
            sellerId: purchaseModel.movieTheaterOrganization.id
        });
        log('SSKTS取引開始', purchaseModel.transaction);

        //セッション更新
        purchaseModel.save(req.session);
        //座席選択へ
        res.json({ redirect: `/purchase/seat/${req.body.performanceId}/`, contents: null });
    } catch (err) {
        log('SSKTS取引開始エラー', err);
        if (err === ErrorUtilModule.ErrorType.Access
            || err === ErrorUtilModule.ErrorType.Property) {
            res.json({ redirect: null, contents: 'access-error' });

            return;
        }
        res.json({ redirect: null, contents: 'access-congestion' });
    }
}
