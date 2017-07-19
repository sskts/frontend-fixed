/**
 * パフォーマンスサービス
 * @namespace services.performance
 */

import * as debug from 'debug';
import * as HTTPStatus from 'http-status';
import * as request from 'request-promise-native';
import * as util from '../utils/util';

const log = debug('SSKTS:services.performance');

/**
 * パフォーマンス詳細
 * @interface IPerformance
 */
export interface IPerformance {
    id: string;
    attributes: {
        canceled: boolean,
        day: string,
        film: {
            id: string;
            name: util.ILanguage;
            minutes: number;
        },
        screen: {
            id: string;
            name: util.ILanguage;
        },
        theater: {
            id: string;
            name: util.ILanguage;
        },
        stockStatus: number;
        timeEnd: string;
        timeStart: string;
        coaTrailerTime: number;
        coaKbnService: string;
        coaKbnAcoustic: string;
        coaNameServiceDay: string;
        coaAvailableNum: string;
        coaRsvStartDate: string;
        coaRsvEndDate: string;
        coaFlgEarlyBooking: string;
    };
}

/**
 * パフォーマンス一覧取得in
 * @interface IGetPerformancesArgs
 */
export interface IGetPerformancesArgs extends util.IAuth {
    theater: string;
    day: string;
}

/**
 * パフォーマンス一覧取得
 * @desc 条件を指定してパフォーマンスを検索します。
 * @memberof services.performance
 * @function getPerformances
 * @param {IGetPerformancesArgs} args
 * @requires {Promise<IPerformance[]>}
 */
export async function getPerformances(args: IGetPerformancesArgs): Promise<IPerformance[]> {
    const qs = {
        theater: args.theater,
        day: args.day
    };
    const response = await request.get({
        url: `${util.ENDPOINT}/performances`,
        auth: { bearer: args.accessToken },
        qs: qs,
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.TIMEOUT
    }).promise();
    if (response.statusCode !== HTTPStatus.OK) util.errorHandler(qs, response);
    // log('performances:', response.body.data);

    return response.body.data.map((data: any) => {
        return {
            id: data.id,
            attributes: {
                canceled: data.attributes.canceled,
                day: data.attributes.day,
                film: {
                    id: data.attributes.film.id,
                    name: data.attributes.film.name,
                    minutes: data.attributes.film.minutes
                },
                screen: {
                    id: data.attributes.screen.id,
                    name: data.attributes.screen.name
                },
                theater: {
                    id: data.attributes.theater.id,
                    name: data.attributes.theater.name
                },
                stockStatus: data.attributes.stock_status,
                timeEnd: data.attributes.time_end,
                timeStart: data.attributes.time_start,
                coaTrailerTime: data.attributes.coa_trailer_time,
                coaKbnService: data.attributes.coa_kbn_service,
                coaKbnAcoustic: data.attributes.coa_kbn_acoustic,
                coaNameServiceDay: data.attributes.coa_name_service_day,
                coaAvailableNum: data.attributes.coa_available_num,
                coaRsvStartDate: data.attributes.coa_rsv_start_date,
                coaRsvEndDate: data.attributes.coa_rsv_end_date,
                coaFlgEarlyBooking: data.attributes.coa_flg_early_booking
            }
        };
    });
}

/**
 * パフォーマンス取得in
 * @interface IGetPerformanceArgs
 */
export interface IGetPerformanceArgs extends util.IAuth {
    performanceId: string;
}

/**
 * パフォーマンス取得
 * @desc IDでパフォーマンス情報を取得します。
 * @memberof services.performance
 * @function getPerformance
 * @param {IGetPerformanceArgs} args
 * @requires {Promise<IPerformance>}
 */
export async function getPerformance(args: IGetPerformanceArgs): Promise<IPerformance> {
    const response = await request.get({
        url: `${util.ENDPOINT}/performances/${args.performanceId}`,
        auth: { bearer: args.accessToken },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.TIMEOUT
    }).promise();
    if (response.statusCode !== HTTPStatus.OK) util.errorHandler(args, response);
    log('performance:', response.body.data);
    const data = response.body.data;

    return {
        id: data.id,
        attributes: {
            canceled: data.attributes.canceled,
            day: data.attributes.day,
            film: {
                id: data.attributes.film.id,
                name: data.attributes.film.name,
                minutes: data.attributes.film.minutes
            },
            screen: {
                id: data.attributes.screen.id,
                name: data.attributes.screen.name
            },
            theater: {
                id: data.attributes.theater.id,
                name: data.attributes.theater.name
            },
            stockStatus: data.attributes.stock_status,
            timeEnd: data.attributes.time_end,
            timeStart: data.attributes.time_start,
            coaTrailerTime: data.attributes.coa_trailer_time,
            coaKbnService: data.attributes.coa_kbn_service,
            coaKbnAcoustic: data.attributes.coa_kbn_acoustic,
            coaNameServiceDay: data.attributes.coa_name_service_day,
            coaAvailableNum: data.attributes.coa_available_num,
            coaRsvStartDate: data.attributes.coa_rsv_start_date,
            coaRsvEndDate: data.attributes.coa_rsv_end_date,
            coaFlgEarlyBooking: data.attributes.coa_flg_early_booking
        }
    };
}
