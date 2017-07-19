/**
 * 劇場サービス
 * @namespace services.theater
 */

import * as debug from 'debug';
import * as HTTPStatus from 'http-status';
import * as request from 'request-promise-native';
import * as util from '../utils/util';

const log = debug('SSKTS:services.theater');

/**
 * 劇場詳細
 * @interface ITheater
 */
export interface ITheater {
    id: string;
    attributes: {
        address: util.ILanguage;
        name: util.ILanguage;
        nameKana: string;
        gmo?: {
            siteId: string;
            shopId: string;
            shopPass: string;
        };
        websites: {
            group: string;
            name: util.ILanguage;
            url: string;
        }[];
    };
}

/**
 * 劇場取得in
 * @interface IGetTheaterArgs
 */
export interface IGetTheaterArgs extends util.IAuth {
    theaterId: string;
}

/**
 * 劇場取得
 * @memberof services.theater
 * @function getTheater
 * @param {IGetTheaterArgs} args
 * @requires {Promise<ITheater>}
 */
export async function getTheater(args: IGetTheaterArgs): Promise<ITheater> {
    const response = await request.get({
        url: `${process.env.MP_ENDPOINT}/theaters/${args.theaterId}`,
        auth: { bearer: args.accessToken },
        body: {},
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.TIMEOUT
    }).promise();
    if (response.statusCode !== HTTPStatus.OK) util.errorHandler(args, response);
    log('getTheater:', response.body.data);
    const data = response.body.data;

    return {
        id: data.id,
        attributes: {
            address: data.attributes.address,
            name: data.attributes.name,
            nameKana: data.attributes.name_kana,
            gmo: {
                siteId: data.attributes.gmo.site_id,
                shopId: data.attributes.gmo.shop_id,
                shopPass: data.attributes.gmo.shop_pass
            },
            websites: data.attributes.websites.map((website: any) => {
                return {
                    group: website.group,
                    name: website.name,
                    url: website.url
                };
            })
        }
    };
}

/**
 * 劇場一覧取得in
 * @type IGetTheatersArgs
 */
export type IGetTheatersArgs = util.IAuth;

/**
 * 劇場一覧取得
 * @memberof MP
 * @function getTheaters
 * @param {IGetTheatersArgs} args
 * @returns {Promise<ITheater[]>}
 */
export async function getTheaters(args: IGetTheatersArgs): Promise<ITheater[]> {
    const response = await request.get({
        url: `${process.env.MP_ENDPOINT}/theaters`,
        auth: { bearer: args.accessToken },
        body: {},
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.TIMEOUT
    }).promise();
    if (response.statusCode !== HTTPStatus.OK) util.errorHandler(args, response);
    log('getTheaters:', response.body.data);

    return response.body.data.map((data: any) => {
        return {
            id: data.id,
            attributes: {
                address: data.attributes.address,
                name: data.attributes.name,
                nameKana: data.attributes.name_kana,
                websites: data.attributes.websites.map((website: any) => {
                    return {
                        group: website.group,
                        name: website.name,
                        url: website.url
                    };
                })
            }
        };
    });
}
