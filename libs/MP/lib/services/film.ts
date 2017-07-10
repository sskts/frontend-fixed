/**
 * 作品サービス
 * @namespace services.film
 */

import * as debug from 'debug';
import * as HTTPStatus from 'http-status';
import * as request from 'request-promise-native';
import * as oauth from '../services/oauth';
import * as util from '../utils/util';

const log = debug('SSKTS:services.film');

/**
 * 言語
 * @interface ILanguage
 */
export interface ILanguage {
    en: string;
    ja: string;
}

/**
 * 作品詳細
 * @interface IFilm
 */
export interface IFilm {
    id: string;
    attributes: {
        coa_title_branch_num: string;
        coa_title_code: string;
        created_at: string;
        date_end: string;
        date_start: string;
        film_branch_code: string;
        film_group: string;
        kbn_eirin: string;
        kbn_eizou: string;
        kbn_jimakufukikae: string;
        kbn_joueihousiki: string;
        minutes: number;
        name: ILanguage;
        name_kana: string;
        name_original: string;
        name_short: string;
        theater: string;
        flg_mvtk_use: string;
        date_mvtk_begin: string;
    };
}

/**
 * 作品取得
 * @desc IDで作品情報を取得します。
 * @memberof services.film
 * @function getFilm
 * @param {GetFilmArgs} args
 * @requires {Promise<IFilm>}
 */
export async function getFilm(id: string): Promise<IFilm> {
    log('getFilm args:', id);
    const response = await request.get({
        url: `${util.endPoint}/films/${id}`,
        auth: { bearer: await oauth.oauthToken() },
        body: {},
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.OK) util.errorHandler({}, response);
    log('getFilm:', response.body.data);

    return response.body.data;
}
