/**
 * 重複予約
 * @namespace Purchase.OverlapModule
 */

import * as COA from '@motionpicture/coa-service';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as MP from '../../../libs/MP/sskts-api';
import { PurchaseModel } from '../../models/Purchase/PurchaseModel';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';
import * as UtilModule from '../Util/UtilModule';
const log = debug('SSKTS:Purchase.OverlapModule');

/**
 * 仮予約重複
 * @memberof Purchase.OverlapModule
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
export async function index(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (req.session === undefined) throw ErrorUtilModule.ERROR_PROPERTY;
        const purchaseModel = new PurchaseModel(req.session.purchase);

        if (req.params.id === undefined) throw ErrorUtilModule.ERROR_ACCESS;
        if (purchaseModel.performance === null) throw ErrorUtilModule.ERROR_PROPERTY;
        //パフォーマンス取得
        const result = await MP.services.performance.getPerformance(req.params.id);
        res.locals.performances = {
            after: result,
            before: purchaseModel.performance
        };
        res.render('purchase/overlap');

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
 * 新規予約へ
 * @memberof Purchase.OverlapModule
 * @function newReserve
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
export async function newReserve(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (req.session === undefined) throw ErrorUtilModule.ERROR_PROPERTY;
        const purchaseModel = new PurchaseModel(req.session.purchase);

        if (purchaseModel.performance === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.transaction === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.reserveSeats === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.authorizationCOA === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.performanceCOA === null) throw ErrorUtilModule.ERROR_PROPERTY;
        const performance = purchaseModel.performance;
        const reserveSeats = purchaseModel.reserveSeats;

        //COA仮予約削除
        await COA.services.reserve.delTmpReserve({
            theaterCode: performance.attributes.theater.id,
            dateJouei: performance.attributes.day,
            titleCode: purchaseModel.performanceCOA.titleCode,
            titleBranchNum: purchaseModel.performanceCOA.titleBranchNum,
            timeBegin: performance.attributes.timeStart,
            tmpReserveNum: reserveSeats.tmpReserveNum
        });
        log('COA仮予約削除');

        // COAオーソリ削除
        await MP.services.transaction.removeAuthorization({
            auth: await UtilModule.createAuth(req),
            transactionId: purchaseModel.transaction.id,
            authorizationId: purchaseModel.authorizationCOA.id
        });
        log('COAオーソリ削除');

        //購入スタートへ
        delete req.session.purchase;
        res.redirect(`/purchase?id=${req.body.performance_id}`);

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
 * 前回の予約へ
 * @memberof Purchase.OverlapModule
 * @function prevReserve
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
export function prevReserve(req: Request, res: Response, next: NextFunction): void {
    if (req.session === undefined) {
        next(new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_PROPERTY, undefined));

        return;
    }
    //座席選択へ
    res.redirect(`/purchase/seat/${req.body.performance_id}/`);

    return;
}
