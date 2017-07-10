/**
 * パフォーマンスサービス
 * @namespace services.performance
 */

import * as debug from 'debug';
import * as HTTPStatus from 'http-status';
import * as request from 'request-promise-native';
import * as oauth from '../services/oauth';
import * as util from '../utils/util';

const log = debug('SSKTS:services.performance');

/**
 * 言語
 * @interface ILanguage
 */
export interface ILanguage {
    en: string;
    ja: string;
}

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
            name: ILanguage;
            minutes: number;
        },
        screen: {
            id: string;
            name: ILanguage;
        },
        theater: {
            id: string;
            name: ILanguage;
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
 * パフォーマンス一覧取得
 * @desc 条件を指定してパフォーマンスを検索します。
 * @memberof services.performance
 * @function getPerformances
 * @param {string} theater 劇場コード
 * @param {string} day 日付
 * @requires {Promise<IPerformance[]>}
 */
export async function getPerformances(theater: string, day: string): Promise<IPerformance[]> {
    const qs = {
        theater: theater,
        day: day
    };
    const response = await request.get({
        url: `${util.endPoint}/performances`,
        auth: { bearer: await oauth.oauthToken() },
        qs: qs,
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.OK) util.errorHandler(qs, response);
    // log('performances:', response.body.data);

    return response.body.data;
}

/**
 * パフォーマンス取得
 * @desc IDでパフォーマンス情報を取得します。
 * @memberof services.performance
 * @function getPerformance
 * @param {GetPerformanceArgs} args
 * @requires {Promise<IPerformance>}
 */
export async function getPerformance(id: string): Promise<IPerformance> {
    log('getPerformance args:', id);
    const response = await request.get({
        url: `${util.endPoint}/performances/${id}`,
        auth: { bearer: await oauth.oauthToken() },
        body: {},
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.OK) util.errorHandler({}, response);
    log('performance:', response.body.data);

    return response.body.data;
}
