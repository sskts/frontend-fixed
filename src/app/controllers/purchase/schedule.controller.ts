/**
 * パフォーマンス一覧
 * @namespace Purchase.PerformancesModule
 */
import * as sasaki from '@motionpicture/sskts-api-nodejs-client';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as HTTPStatus from 'http-status';
import * as moment from 'moment';
import { getApiOption } from '../../functions';
import { AppError, ErrorType, PurchaseModel } from '../../models';
const log = debug('SSKTS:Purchase.PerformancesModule');

/**
 * パフォーマンス一覧表示
 * @memberof Purchase.PerformancesModule
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

        if (purchaseModel.seatReservationAuthorization !== null
            && purchaseModel.transaction !== null
            && !purchaseModel.isExpired()) {
            try {
                await new sasaki.service.transaction.PlaceOrder(options).cancelSeatReservationAuthorization({
                    id: purchaseModel.seatReservationAuthorization.id,
                    purpose: {
                        id: purchaseModel.transaction.id,
                        typeOf: purchaseModel.transaction.typeOf
                    }
                });
                log('仮予約削除');
            } catch (err) {
                log('仮予約削除失敗', err);
            }
        }

        // セッション削除
        delete req.session.purchase;
        delete req.session.mvtk;
        delete req.session.complete;
        delete req.session.auth;

        // if (process.env.VIEW_TYPE === undefined) {
        //     const searchResult = await new sasaki.service.Seller(options).search({});
        //     res.locals.sellers = searchResult.data;
        //     log('劇場検索');
        // }
        res.locals.step = PurchaseModel.PERFORMANCE_STATE;
        res.locals.entranceServerUrl = process.env.ENTRANCE_SERVER_URL;
        res.render('purchase/performances', { layout: 'layouts/purchase/layout' });

    } catch (err) {
        next(err);
    }
}

/**
 * パフォーマンスリスト取得
 * @memberof Purchase.PerformancesModule
 * @function getPerformances
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getPerformances(req: Request, res: Response): Promise<void> {
    try {
        if (req.session === undefined
            || req.query.theater === undefined
            || req.query.day === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        const options = getApiOption(req);
        const limit = 100;
        let page = 1;
        let roop = true;
        let screeningEvents: sasaki.factory.chevre.event.screeningEvent.IEvent[] = [];
        while (roop) {
            const screeningEventsResult = await new sasaki.service.Event(options).searchScreeningEvents({
                page,
                limit,
                typeOf: sasaki.factory.chevre.eventType.ScreeningEvent,
                superEvent: {
                    locationBranchCodes: [req.query.theater]
                },
                startFrom: moment(req.query.day).toDate(),
                startThrough: moment(req.query.day).add(1, 'day').toDate()
            });
            screeningEvents = screeningEvents.concat(screeningEventsResult.data);
            const lastPage = Math.ceil(screeningEventsResult.totalCount / limit);
            page += 1;
            roop = !(page > lastPage);
        }
        log('上映イベント検索');

        res.json({ result: screeningEvents });
    } catch (err) {
        if (err.code !== undefined) {
            res.status(err.code);
        } else {
            res.status(httpStatus.BAD_REQUEST);
        }
        res.json({ error: err });
    }
}

/**
 * 劇場一覧検索
 * @memberof Purchase.PerformancesModule
 * @function getMovieTheaters
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getMovieTheaters(req: Request, res: Response) {
    try {
        if (req.session === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        const options = getApiOption(req);
        const searchResult = await new sasaki.service.Seller(options).search({});
        const sellers = searchResult.data;
        log('劇場検索');
        res.json({ result: sellers });
    } catch (err) {
        if (err.code !== undefined) {
            res.status(err.code);
        } else {
            res.status(httpStatus.BAD_REQUEST);
        }
        res.json({ error: err });
    }
}
