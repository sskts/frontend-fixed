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
        stock_status: number;
        time_end: string;
        time_start: string;
        coa_trailer_time: number;
        coa_kbn_service: string;
        coa_kbn_acoustic: string;
        coa_name_service_day: string;
        coa_available_num: string;
        coa_rsv_start_date: string;
        coa_rsv_end_date: string;
        coa_flg_early_booking: string;
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

    return response.body.data;
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

    return response.body.data;
}
