"use strict";
/**
 * 作品サービス
 * @namespace services.film
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug");
const HTTPStatus = require("http-status");
const request = require("request-promise-native");
const util = require("../utils/util");
const log = debug('SSKTS:services.film');
/**
 * 作品取得
 * @desc IDで作品情報を取得します。
 * @memberof services.film
 * @function getFilm
 * @param {IGetFilmArgs} args
 * @requires {Promise<IFilm>}
 */
function getFilm(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield request.get({
            url: `${util.ENDPOINT}/films/${args.filmId}`,
            auth: { bearer: args.accessToken },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.TIMEOUT
        }).promise();
        if (response.statusCode !== HTTPStatus.OK)
            util.errorHandler(args, response);
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
    });
}
exports.getFilm = getFilm;
