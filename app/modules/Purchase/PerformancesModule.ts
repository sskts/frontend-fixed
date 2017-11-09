/**
 * パフォーマンス一覧
 * @namespace Purchase.PerformancesModule
 */
import * as sasaki from '@motionpicture/sskts-api-nodejs-client';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as HTTPStatus from 'http-status';
import * as moment from 'moment';
import { AuthModel } from '../../models/Auth/AuthModel';
import { PurchaseModel } from '../../models/Purchase/PurchaseModel';
import { AppError, ErrorType } from '../Util/ErrorUtilModule';
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
        const authModel = new AuthModel(req.session.auth);
        const options = {
            endpoint: (<string>process.env.SSKTS_API_ENDPOINT),
            auth: authModel.create()
        };
        const purchaseModel = new PurchaseModel(req.session.purchase);

        if (purchaseModel.seatReservationAuthorization !== null
            && purchaseModel.transaction !== null
            && !purchaseModel.isExpired()) {
            await sasaki.service.transaction.placeOrder(options)
                .cancelSeatReservationAuthorization({
                    transactionId: purchaseModel.transaction.id,
                    actionId: purchaseModel.seatReservationAuthorization.id
                });
            log('仮予約削除');
        }

        if (process.env.VIEW_TYPE === 'fixed') {
            // セッション削除
            delete req.session.purchase;
            delete req.session.mvtk;
            delete req.session.complete;
            delete req.session.auth;
        }

        if (process.env.VIEW_TYPE === undefined) {
            res.locals.movieTheaters = await sasaki.service.organization(options).searchMovieTheaters();
            log(res.locals.movieTheaters);
        }
        res.locals.step = PurchaseModel.PERFORMANCE_STATE;
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
        const authModel = new AuthModel(req.session.auth);
        const options = {
            endpoint: (<string>process.env.SSKTS_API_ENDPOINT),
            auth: authModel.create()
        };
        const individualScreeningEvents = await sasaki.service.event(options).searchIndividualScreeningEvent({
            theater: req.query.theater,
            day: moment(req.query.day).format('YYYYMMDD')
        });
        log('上映イベント検索');

        if (req.query.callback === undefined) {
            res.json({ error: null, result: individualScreeningEvents });
        } else {
            res.jsonp({ error: null, result: individualScreeningEvents });
        }
    } catch (err) {
        if (req.query.callback === undefined) {
            res.json({ error: err, result: null });
        } else {
            res.jsonp({ error: err, result: null });
        }
    }
}

/**
 * スケジュールリスト取得
 * @memberof Purchase.PerformancesModule
 * @function getSchedule
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getSchedule(req: Request, res: Response): Promise<void> {
    try {
        if (req.session === undefined
            || req.query.beginDate === undefined
            || req.query.endDate === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        const authModel = new AuthModel(req.session.auth);
        const options = {
            endpoint: (<string>process.env.SSKTS_API_ENDPOINT),
            auth: authModel.create()
        };
        const diff = moment(req.query.endDate).diff(moment(req.query.beginDate), 'days');
        const limitDays = 100;
        if (diff > limitDays) {
            throw new Error('It exceeds the upper limit');
        }
        const schedule: any[] = [];
        const movieTheaters = await sasaki.service.organization(options).searchMovieTheaters();
        for (const theater of movieTheaters) {
            schedule.push({
                theater: theater,
                schedule: []
            });
            const theaterCode = theater.location.branchCode;
            for (let i = 0; i < diff; i += 1) {
                const date = moment(req.query.beginDate).add(i, 'days').format('YYYYMMDD');
                const individualScreeningEvents = await sasaki.service.event(options).searchIndividualScreeningEvent({
                    theater: theaterCode,
                    day: date
                });
                const theaterSchedule = schedule.find((targetSchedule) => {
                    return (targetSchedule.theater.branchCode === theater.branchCode);
                });
                if (theaterSchedule !== undefined) {
                    theaterSchedule.schedule.push({
                        date: date,
                        individualScreeningEvents: individualScreeningEvents
                    });
                }
            }
        }

        if (req.query.callback === undefined) {
            res.json({ error: null, result: schedule });
        } else {
            res.jsonp({ error: null, result: schedule });
        }
    } catch (err) {
        if (req.query.callback === undefined) {
            res.json({ error: err, result: null });
        } else {
            res.jsonp({ error: err, result: null });
        }
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
        const authModel = new AuthModel(req.session.auth);
        const options = {
            endpoint: (<string>process.env.SSKTS_API_ENDPOINT),
            auth: authModel.create()
        };
        const movieTheaters = await sasaki.service.organization(options).searchMovieTheaters();
        log('劇場検索');
        if (req.query.callback === undefined) {
            res.json({ error: null, result: movieTheaters });
        } else {
            res.jsonp({ error: null, result: movieTheaters });
        }
    } catch (err) {
        if (req.query.callback === undefined) {
            res.json({ error: err, result: null });
        } else {
            res.jsonp({ error: err, result: null });
        }
    }
}
