/**
 * スクリーンサービス
 * @namespace services.screen
 */

import * as debug from 'debug';
import * as HTTPStatus from 'http-status';
import * as request from 'request-promise-native';
import * as util from '../utils/util';

const log = debug('SSKTS:services.screen');

/**
 * スクリーン詳細
 * @interface IScreen
 */
export interface IScreen {
    id: string;
    attributes: {
        coa_screen_code: string;
        name: util.ILanguage;
        seats_numbers_by_seat_grade: any[];
        sections: {
            code: string;
            name: util.ILanguage;
            seats: {
                code: string;
            }[];
        }[];
        theater: string;
    };
}

/**
 * スクリーン取得in
 * @interface IGetScreenArgs
 */
export interface IGetScreenArgs extends util.IAuth {
    screenId: string;
}

/**
 * スクリーン取得
 * @memberof services.screen
 * @function getScreen
 * @param {IGetScreenArgs} args
 * @requires {Promise<Screen>}
 */
export async function getScreen(args: IGetScreenArgs): Promise<IScreen> {
    const response = await request.get({
        url: `${util.endPoint}/screens/${args.screenId}`,
        auth: { bearer: args.accessToken },
        body: {},
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.OK) util.errorHandler(args, response);
    log('getScreen:', response.body.data);

    return response.body.data;
}
