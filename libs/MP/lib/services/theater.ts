/**
 * 劇場サービス
 * @namespace services.theater
 */

import * as debug from 'debug';
import * as HTTPStatus from 'http-status';
import * as request from 'request-promise-native';
import * as oauth from '../services/oauth';
import * as util from '../utils/util';

const log = debug('SSKTS:services.theater');

/**
 * 言語
 * @interface ILanguage
 */
export interface ILanguage {
    en: string;
    ja: string;
}

/**
 * 劇場詳細
 * @interface ITheater
 */
export interface ITheater {
    id: string;
    attributes: {
        address: ILanguage;
        name: ILanguage;
        name_kana: string;
        gmo: {
            site_id: string;
            shop_id: string;
            shop_pass: string;
        };
        websites: {
            group: string;
            name: ILanguage;
            url: string;
        }[];
    };
}

/**
 * 劇場取得
 * @memberof services.theater
 * @function getTheater
 * @param {GetTheaterArgs} args
 * @requires {Promise<ITheater>}
 */
export async function getTheater(id: string): Promise<ITheater> {
    log('getTheater args:', id);
    const response = await request.get({
        url: `${process.env.MP_ENDPOINT}/theaters/${id}`,
        auth: { bearer: await oauth.oauthToken() },
        body: {},
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.OK) util.errorHandler({}, response);
    log('getTheater:', response.body.data);

    return response.body.data;
}

/**
 * 劇場一覧取得
 * @memberof MP
 * @function getTheaters
 * @requires {Promise<ITheater[]>}
 */
export async function getTheaters(): Promise<ITheater[]> {
    const response = await request.get({
        url: `${process.env.MP_ENDPOINT}/theaters`,
        auth: { bearer: await oauth.oauthToken() },
        body: {},
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.OK) util.errorHandler({}, response);
    log('getTheaters:', response.body.data);

    return response.body.data;
}
