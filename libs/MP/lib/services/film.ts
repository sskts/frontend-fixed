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
        coaTitleBranchNum: string;
        coaTitleCode: string;
        createdAt: string;
        dateEnd: string;
        dateStart: string;
        filmBranchCode: string;
        filmGroup: string;
        kbnEirin: string;
        kbnEizou: string;
        kbnJimakufukikae: string;
        kbnJoueihousiki: string;
        minutes: number;
        name: util.ILanguage;
        nameKana: string;
        nameOriginal: string;
        nameShort: string;
        theater: string;
        flgMvtkUse: string;
        dateMvtkBegin: string;
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
        url: `${util.ENDPOINT}/films/${args.filmId}`,
        auth: { bearer: args.accessToken },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.TIMEOUT
    }).promise();
    if (response.statusCode !== HTTPStatus.OK) util.errorHandler(args, response);
    log('getFilm:', response.body.data);
    const data = response.body.data;

    return {
        id: data.id,
        attributes: {
            coaTitleBranchNum: data.attributes.coa_title_branch_num,
            coaTitleCode: data.attributes.coa_title_code,
            createdAt: data.attributes.created_at,
            dateEnd: data.attributes.date_end,
            dateStart: data.attributes.date_start,
            filmBranchCode: data.attributes.film_branch_code,
            filmGroup: data.attributes.film_group,
            kbnEirin: data.attributes.kbn_eirin,
            kbnEizou: data.attributes.kbn_eizou,
            kbnJimakufukikae: data.attributes.kbn_jimakufukikae,
            kbnJoueihousiki: data.attributes.kbn_joueihousiki,
            minutes: data.attributes.minutes,
            name: data.attributes.name,
            nameKana: data.attributes.name_kana,
            nameOriginal: data.attributes.name_original,
            nameShort: data.attributes.name_short,
            theater: data.attributes.theater,
            flgMvtkUse: data.attributes.flg_mvtk_use,
            dateMvtkBegin: data.attributes.date_mvtk_begin
        }
    };
}
