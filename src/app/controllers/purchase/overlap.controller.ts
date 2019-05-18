/**
 * 重複予約
 * @namespace Purchase.OverlapModule
 */
import * as sasaki from '@motionpicture/sskts-api-nodejs-client';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as HTTPStatus from 'http-status';
import { getApiOption } from '../../functions';
import { AppError, ErrorType, PurchaseModel } from '../../models';
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
        if (req.session === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        const options = getApiOption(req);
        const purchaseModel = new PurchaseModel(req.session.purchase);

        if (req.params.id === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        if (purchaseModel.screeningEvent === null) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        // イベント情報取得
        const screeningEvent = await new sasaki.service.Event(options).findScreeningEventById({
            id: req.params.id
        });
        log('イベント情報取得', screeningEvent);
        res.locals.after = screeningEvent;
        res.locals.before = purchaseModel.screeningEvent;
        res.render('purchase/overlap');
    } catch (err) {
        next(err);
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
        if (req.session === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        const options = getApiOption(req);
        const purchaseModel = new PurchaseModel(req.session.purchase);

        if (purchaseModel.transaction !== null
            && purchaseModel.seatReservationAuthorization !== null
            && !purchaseModel.isExpired()) {
            try {
                // COA仮予約削除
                await new sasaki.service.transaction.PlaceOrder(options).cancelSeatReservationAuthorization({
                    id: purchaseModel.seatReservationAuthorization.id,
                    purpose: {
                        id: purchaseModel.transaction.id,
                        typeOf: purchaseModel.transaction.typeOf
                    }
                });
                log('COA仮予約削除');
            } catch (err) {
                log('COA仮予約削除失敗', err);
            }
        }

        //購入スタートへ
        delete req.session.purchase;
        let url: string;
        let params: string;
        params = `id=${req.body.performanceId}`;
        url = `${process.env.ENTRANCE_SERVER_URL}/purchase/index.html?${params}`;
        res.redirect(url);
    } catch (err) {
        next(err);
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
        next(new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property));

        return;
    }
    //座席選択へ
    res.redirect(`/purchase/seat/${req.body.performanceId}/`);

    return;
}
