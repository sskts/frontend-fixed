/**
 * 作品サービス
 * @namespace services.film
 */

import * as debug from 'debug';
import * as HTTPStatus from 'http-status';
import * as request from 'request-promise-native';
import * as util from '../utils/util';

const log = debug('SSKTS:services.film');

/**
 * 作品詳細
 * @memberof services.film
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
        name: util.ILanguage;
        name_kana: string;
        name_original: string;
        name_short: string;
        theater: string;
        flg_mvtk_use: string;
        date_mvtk_begin: string;
    };
}

/**
 * 作品取得in
 * @memberof services.film
 * @interface IGetFilmArgs
 */
export interface IGetFilmArgs extends util.IAuth {
    filmId: string;
}

/**
 * 作品取得
 * @desc IDで作品情報を取得します。
 * @memberof services.film
 * @function getFilm
 * @param {IGetFilmArgs} args
 * @requires {Promise<IFilm>}
 */
export async function getFilm(args: IGetFilmArgs): Promise<IFilm> {
    const response = await request.get({
        url: `${util.endPoint}/films/${args.filmId}`,
        auth: { bearer: args.accessToken },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.OK) util.errorHandler(args, response);
    log('getFilm:', response.body.data);

    return response.body.data;
}
