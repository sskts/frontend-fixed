/**
 * 重複予約
 * @namespace Purchase.OverlapModule
 */
import * as ssktsApi from '@motionpicture/sasaki-api-nodejs';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import { AuthModel } from '../../models/Auth/AuthModel';
import { PurchaseModel } from '../../models/Purchase/PurchaseModel';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';
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
        const authModel = new AuthModel(req.session.auth);
        const auth = authModel.create();
        const purchaseModel = new PurchaseModel(req.session.purchase);

        if (req.params.id === undefined) throw ErrorUtilModule.ERROR_ACCESS;
        if (purchaseModel.individualScreeningEvent === null) throw ErrorUtilModule.ERROR_PROPERTY;
        // イベント情報取得
        const individualScreeningEvent = await ssktsApi.service.event.findIndividualScreeningEvent({
            auth: auth,
            identifier: req.body.performanceId
        });
        log('イベント情報取得', individualScreeningEvent);
        res.locals.individualScreeningEvent = {
            after: individualScreeningEvent,
            before: purchaseModel.individualScreeningEvent
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
        const authModel = new AuthModel(req.session.auth);
        const auth = authModel.create();
        const purchaseModel = new PurchaseModel(req.session.purchase);

        if (purchaseModel.individualScreeningEvent === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.transaction === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.seatReservationAuthorization === null) throw ErrorUtilModule.ERROR_PROPERTY;

        // COA仮予約削除
        await ssktsApi.service.transaction.placeOrder.cancelSeatReservationAuthorization({
            auth: auth,
            transactionId: purchaseModel.transaction.id,
            authorizationId: purchaseModel.seatReservationAuthorization.id
        });

        log('COA仮予約削除');

        //購入スタートへ
        delete req.session.purchase;
        res.redirect(`/purchase?id=${req.body.performanceId}`);

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
    res.redirect(`/purchase/seat/${req.body.performanceId}/`);

    return;
}
