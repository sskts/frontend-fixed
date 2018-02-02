/**
 * パフォーマンス一覧
 * @namespace Purchase.PerformancesModule
 */
import * as COA from '@motionpicture/coa-service';
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
            try {
                await sasaki.service.transaction.placeOrder(options)
                    .cancelSeatReservationAuthorization({
                        transactionId: purchaseModel.transaction.id,
                        actionId: purchaseModel.seatReservationAuthorization.id
                    });
                log('仮予約削除');
            } catch (err) {
                log('仮予約削除失敗', err);
            }
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
            log('劇場検索');
        }
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

        res.json({ result: individualScreeningEvents });
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
            || req.query.startFrom === undefined
            || req.query.startThrough === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        const authModel = new AuthModel(req.session.auth);
        const options = {
            endpoint: (<string>process.env.SSKTS_API_ENDPOINT),
            auth: authModel.create()
        };
        const args = {
            startFrom: req.query.startFrom,
            startThrough: req.query.startThrough
        };
        const theaters = await sasaki.service.organization(options).searchMovieTheaters();
        // theaters = theaters.filter((theater) => {
        //     return (theater.location.branchCode === '018');
        // });
        // const add = 5;
        // const args = {
        //     theater: theaters[0].location.branchCode,
        //     startFrom: <any>moment('20180202').toISOString(),
        //     startThrough: <any>moment('20180202').add(add, 'week').toISOString()
        // };
        // log(args);
        const screeningEvents = await sasaki.service.event(options).searchIndividualScreeningEvent(args);
        const checkedScreeningEvents = await checkedSchedules({
            theaters: theaters,
            screeningEvents: screeningEvents
        });
        const result = {
            theaters: theaters,
            screeningEvents: checkedScreeningEvents
        };
        res.json({ result: result });
    } catch (err) {
        if (err.code !== undefined) {
            res.status(err.code);
        } else {
            res.status(httpStatus.BAD_REQUEST);
        }
        res.json({ error: err });
    }
}

type IEventWithOffer = sasaki.factory.event.individualScreeningEvent.IEventWithOffer;

interface ICoaSchedule {
    theater: sasaki.factory.organization.movieTheater.IPublicFields;
    schedules: COA.services.master.IScheduleResult[];
}

let coaSchedules: ICoaSchedule[] = [];
coaSchedulesUpdate();

/**
 * COAスケジュール更新
 * @function coaSchedulesUpdate
 */
async function coaSchedulesUpdate(): Promise<void> {
    log('coaSchedulesUpdate start', coaSchedules.length);
    try {
        const result: ICoaSchedule[] = [];
        const authModel = new AuthModel();
        const options = {
            endpoint: (<string>process.env.SSKTS_API_ENDPOINT),
            auth: authModel.create()
        };
        const theaters = await sasaki.service.organization(options).searchMovieTheaters();
        const end = 5;
        for (const theater of theaters) {
            const scheduleArgs = {
                theaterCode: theater.location.branchCode,
                begin: moment().format('YYYYMMDD'),
                end: moment().add(end, 'week').format('YYYYMMDD')
            };
            const schedules = await COA.services.master.schedule(scheduleArgs);
            result.push({
                theater: theater,
                schedules: schedules
            });
        }
        coaSchedules = result;
        const upDateTime = 3600000; // 1000 * 60 * 60
        setTimeout(async () => { await coaSchedulesUpdate(); }, upDateTime);
    } catch (err) {
        log(err);
        await coaSchedulesUpdate();
    }
    log('coaSchedulesUpdate end', coaSchedules.length);
}

/**
 * COAスケジュール更新待ち
 * @function waitCoaSchedulesUpdate
 */
async function waitCoaSchedulesUpdate() {
    const timer = 1000;
    const limit = 10000;
    let count = 0;

    return new Promise<void>((resolve, reject) => {
        const check = setInterval(
            () => {
                if (count > limit) {
                    clearInterval(check);
                    reject();
                }
                if (coaSchedules.length > 0) {
                    clearInterval(check);
                    resolve();
                }
                count += 1;
            },
            timer
        );
    });
}

/**
 * スケジュール整合性確認
 * @function checkedSchedules
 */
async function checkedSchedules(args: {
    theaters: sasaki.factory.organization.movieTheater.IPublicFields[];
    screeningEvents: IEventWithOffer[];
}): Promise<IEventWithOffer[]> {
    if (coaSchedules.length === 0) {
        await waitCoaSchedulesUpdate();
    }
    const screeningEvents: IEventWithOffer[] = [];
    for (const coaSchedule of coaSchedules) {
        for (const schedule of coaSchedule.schedules) {
            const id = [
                coaSchedule.theater.location.branchCode,
                schedule.titleCode,
                schedule.titleBranchNum,
                schedule.dateJouei,
                schedule.screenCode,
                schedule.timeBegin
            ].join('');
            const screeningEvent = args.screeningEvents.find((event) => {
                return (event.identifier === id);
            });
            if (screeningEvent !== undefined) {
                screeningEvents.push(screeningEvent);
            }
        }
    }
    // const diffList = diffScreeningEvents(args.screeningEvents, screeningEvents);
    // for (const diff of diffList) {
    //     log('diff', diff.identifier);
    // }
    // log('all length', screeningEvents.length + diffList.length);
    // log('screeningEvents length', screeningEvents.length);
    // log('diffList length', diffList.length);

    return screeningEvents;
}

/**
 * 差分抽出
 * @function diffScreeningEvents
 * @param　{IEventWithOffer[]} array1
 * @param {IEventWithOffer[]} array2
 */
export function diffScreeningEvents(array1: IEventWithOffer[], array2: IEventWithOffer[]) {
    const diffArray: IEventWithOffer[] = [];

    for (const array of array1) {
        const target = array2.find((event) => {
            return (event.identifier === array.identifier);
        });
        if (target === undefined) {
            diffArray.push(array);
        }
    }

    return diffArray;
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
        res.json({ result: movieTheaters });
    } catch (err) {
        if (err.code !== undefined) {
            res.status(err.code);
        } else {
            res.status(httpStatus.BAD_REQUEST);
        }
        res.json({ error: err });
    }
}
