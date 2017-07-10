/**
 * 取引
 * @namespace Purchase.TransactionModule
 */

import * as debug from 'debug';
import { Request, Response } from 'express';
import * as moment from 'moment';
import * as MP from '../../../libs/MP';
import * as PurchaseSession from '../../models/Purchase/PurchaseModel';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';
const log = debug('SSKTS:Purchase.TransactionModule');
/**
 * 販売終了時間 30分前
 * @const {number} END_TIME_DEFAULT
 */
const END_TIME_DEFAULT = 30;
/**
 * 販売終了時間(券売機) 10分後
 * @const {number} END_TIME_DEFAULT
 */
const END_TIME_FIXED = -10;

/**
 * 取引有効時間 15分間
 * @const {number} END_TIME_DEFAULT
 */
const VALID_TIME_DEFAULT = 15;
/**
 * 取引有効時間(券売機) 5分間
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
        if (req.session === undefined || req.body.id === undefined) {
            throw ErrorUtilModule.ERROR_PROPERTY;
        }

        const performance = await MP.services.performance.getPerformance(req.body.id);
        // 開始可能日判定
        if (moment().unix() < moment(`${performance.attributes.coa_rsv_start_date}`).unix()) {
            throw ErrorUtilModule.ERROR_ACCESS;
        }

        // 終了可能日判定
        const limit = (process.env.VIEW_TYPE === 'fixed') ? END_TIME_FIXED : END_TIME_DEFAULT;
        const limitTime = moment().add(limit, 'minutes');
        if (limitTime.unix() > moment(`${performance.attributes.day} ${performance.attributes.time_start}`).unix()) {
            throw ErrorUtilModule.ERROR_ACCESS;
        }

        let purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
        if (purchaseModel.transactionMP !== null && purchaseModel.reserveSeats !== null) {
            //重複確認へ
            res.json({ redirect: `/purchase/${req.body.id}/overlap`, err: null });

            return;
        }
        purchaseModel = new PurchaseSession.PurchaseModel({});
        // 取引開始
        const valid = (process.env.VIEW_TYPE === 'fixed') ? VALID_TIME_FIXED : VALID_TIME_DEFAULT;
        purchaseModel.expired = moment().add(valid, 'minutes').unix();
        purchaseModel.transactionMP = await MP.services.transaction.transactionStart({
            expires_at: purchaseModel.expired
        });
        log('MP取引開始', purchaseModel.transactionMP.attributes.owners);
        delete req.session.purchase;
        delete req.session.mvtk;
        delete req.session.complete;
        //セッション更新
        req.session.purchase = purchaseModel.toSession();
        //座席選択へ
        res.json({ redirect: `/purchase/seat/${req.body.id}/`, contents: null });
    } catch (err) {
        if (err === ErrorUtilModule.ERROR_ACCESS
            || err === ErrorUtilModule.ERROR_PROPERTY) {
            res.json({ redirect: null, contents: 'access-error' });

            return;
        }
        res.json({ redirect: null, contents: 'access-congestion' });
    }
}
