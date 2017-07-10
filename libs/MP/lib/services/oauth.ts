/**
 * 認証サービス
 * @namespace services.oauth
 */

import * as debug from 'debug';
import * as HTTPStatus from 'http-status';
import * as request from 'request-promise-native';
import * as util from '../utils/util';

const log = debug('SSKTS:MP-theater');

/**
 * アクセストークン取得
 * @desc OAuth認可エンドポイント。アクセストークンを取得します。
 * @memberof services.oauth
 * @function oauthToken
 * @requires {Promise<Performance[]>}
 */
export async function oauthToken(): Promise<string> {
    const body = {
        assertion: process.env.SSKTS_API_REFRESH_TOKEN,
        scope: 'admin'
    };
    const response = await request.post({
        url: `${util.endPoint}/oauth/token`,
        body: body,
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.timeout
    }).promise();

    if (response.statusCode !== HTTPStatus.OK) util.errorHandler({}, response);
    log('oauthToken:', response.body.access_token);

    return response.body.access_token;
}
