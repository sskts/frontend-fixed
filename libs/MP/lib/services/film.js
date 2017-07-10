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
const oauth = require("../services/oauth");
const util = require("../utils/util");
const log = debug('SSKTS:services.film');
/**
 * 作品取得
 * @desc IDで作品情報を取得します。
 * @memberof services.film
 * @function getFilm
 * @param {GetFilmArgs} args
 * @requires {Promise<IFilm>}
 */
function getFilm(id) {
    return __awaiter(this, void 0, void 0, function* () {
        log('getFilm args:', id);
        const response = yield request.get({
            url: `${util.endPoint}/films/${id}`,
            auth: { bearer: yield oauth.oauthToken() },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.OK)
            util.errorHandler({}, response);
        log('getFilm:', response.body.data);
        return response.body.data;
    });
}
exports.getFilm = getFilm;
