/**
 * 重複予約
 * @namespace Purchase.OverlapModule
 */
import * as sasaki from '@motionpicture/sasaki-api-nodejs';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import { AuthModel } from '../../models/Auth/AuthModel';
import { PurchaseModel } from '../../models/Purchase/PurchaseModel';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';
const log = debug('SSKTS:Purchase.OverlapModule');

/**
 * 仮予約重複
 * @memberof Purchase.OverlapModule
 * @function render
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
export async function render(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (req.session === undefined) throw ErrorUtilModule.ErrorType.Property;
        const authModel = new AuthModel(req.session.auth);
        const options = {
            endpoint: (<string>process.env.SSKTS_API_ENDPOINT),
            auth: authModel.create()
        };
        const purchaseModel = new PurchaseModel(req.session.purchase);

        if (req.params.id === undefined) throw ErrorUtilModule.ErrorType.Access;
        if (purchaseModel.individualScreeningEvent === null) throw ErrorUtilModule.ErrorType.Property;
        // イベント情報取得
        const individualScreeningEvent = await sasaki.service.event(options).findIndividualScreeningEvent({
            identifier: req.body.performanceId
        });
        log('イベント情報取得', individualScreeningEvent);
        res.locals.individualScreeningEvent = {
            after: individualScreeningEvent,
            before: purchaseModel.individualScreeningEvent
        };
        res.render('purchase/overlap');
    } catch (err) {
        const error = (err instanceof Error) ? err : new ErrorUtilModule.AppError(err, undefined);
        next(error);
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
        if (req.session === undefined) throw ErrorUtilModule.ErrorType.Property;
        const authModel = new AuthModel(req.session.auth);
        const options = {
            endpoint: (<string>process.env.SSKTS_API_ENDPOINT),
            auth: authModel.create()
        };
        const purchaseModel = new PurchaseModel(req.session.purchase);

        if (purchaseModel.individualScreeningEvent === null) throw ErrorUtilModule.ErrorType.Property;
        if (purchaseModel.transaction === null) throw ErrorUtilModule.ErrorType.Property;
        if (purchaseModel.seatReservationAuthorization === null) throw ErrorUtilModule.ErrorType.Property;

        // COA仮予約削除
        await sasaki.service.transaction.placeOrder(options).cancelSeatReservationAuthorization({
            transactionId: purchaseModel.transaction.id,
            authorizationId: purchaseModel.seatReservationAuthorization.id
        });

        log('COA仮予約削除');

        //購入スタートへ
        delete req.session.purchase;
        res.redirect(`/purchase?id=${req.body.performanceId}`);

        return;
    } catch (err) {
        const error = (err instanceof Error) ? err : new ErrorUtilModule.AppError(err, undefined);
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
        next(new ErrorUtilModule.AppError(ErrorUtilModule.ErrorType.Property, undefined));

        return;
    }
    //座席選択へ
    res.redirect(`/purchase/seat/${req.body.performanceId}/`);

    return;
}
