/**
 * 認証サービス
 * @namespace services.oauth
 */

import * as debug from 'debug';
import * as HTTPStatus from 'http-status';
import * as request from 'request-promise-native';
import * as util from '../utils/util';

const log = debug('SSKTS:services.oauth');

/**
 * 認可タイプ
 * @memberof services.oauth
 * @enum GrantType
 */
export enum GrantType {
    clientCredentials = 'client_credentials',
    password = 'password'
}

/**
 * アクセストークン取得in
 * @memberof services.oauth
 * @interface IOauthTokenArgs
 */
export interface IOauthTokenArgs {
    grant_type: GrantType;
    scopes: string[];
    client_id: string;
    state?: string;
    username?: string;
    password?: string;
}

/**
 * アクセストークン取得out
 * @memberof services.oauth
 * @interface IOauthTokenResult
 */
export interface IOauthTokenResult {
    access_token: string;
    token_type: string;
    expires_in: string;
}

/**
 * アクセストークン取得
 * @desc OAuth認可エンドポイント。アクセストークンを取得します。
 * @memberof services.oauth
 * @function oauthToken
 * @param {IOauthTokenArgs} args
 * @requires {Promise<IOauthTokenResult>}
 */
export async function oauthToken(args: IOauthTokenArgs): Promise<IOauthTokenResult> {
    const body = args;
    const response = await request.post({
        url: `${util.endPoint}/oauth/token`,
        body: body,
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.timeout
    }).promise();

    if (response.statusCode !== HTTPStatus.OK) util.errorHandler(body, response);
    log('oauthToken:', response.body);

    return response.body;
}
