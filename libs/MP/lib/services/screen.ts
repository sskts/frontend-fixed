/**
 * スクリーンサービス
 * @namespace services.screen
 */

import * as debug from 'debug';
import * as HTTPStatus from 'http-status';
import * as request from 'request-promise-native';
import * as oauth from '../services/oauth';
import * as util from '../utils/util';

const log = debug('SSKTS:services.screen');

/**
 * 言語
 * @interface ILanguage
 */
export interface ILanguage {
    en: string;
    ja: string;
}

/**
 * スクリーン詳細
 * @interface IScreen
 */
export interface IScreen {
    id: string;
    attributes: {
        coa_screen_code: string;
        name: ILanguage;
        seats_numbers_by_seat_grade: any[];
        sections: {
            code: string;
            name: ILanguage;
            seats: {
                code: string;
            }[];
        }[];
        theater: string;
    };
}

/**
 * スクリーン取得
 * @memberof services.screen
 * @function getScreen
 * @param {GetScreenArgs} args
 * @requires {Promise<Screen>}
 */
export async function getScreen(id: string): Promise<IScreen> {
    log('getScreen args:', id);
    const response = await request.get({
        url: `${util.endPoint}/screens/${id}`,
        auth: { bearer: await oauth.oauthToken() },
        body: {},
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.OK) util.errorHandler({}, response);
    log('getScreen:', response.body.data);

    return response.body.data;
}
