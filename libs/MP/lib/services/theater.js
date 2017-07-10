"use strict";
/**
 * 劇場サービス
 * @namespace services.theater
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
const log = debug('SSKTS:services.theater');
/**
 * 劇場取得
 * @memberof services.theater
 * @function getTheater
 * @param {GetTheaterArgs} args
 * @requires {Promise<ITheater>}
 */
function getTheater(id) {
    return __awaiter(this, void 0, void 0, function* () {
        log('getTheater args:', id);
        const response = yield request.get({
            url: `${process.env.MP_ENDPOINT}/theaters/${id}`,
            auth: { bearer: yield oauth.oauthToken() },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.OK)
            util.errorHandler({}, response);
        log('getTheater:', response.body.data);
        return response.body.data;
    });
}
exports.getTheater = getTheater;
/**
 * 劇場一覧取得
 * @memberof MP
 * @function getTheaters
 * @requires {Promise<ITheater[]>}
 */
function getTheaters() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield request.get({
            url: `${process.env.MP_ENDPOINT}/theaters`,
            auth: { bearer: yield oauth.oauthToken() },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.OK)
            util.errorHandler({}, response);
        log('getTheaters:', response.body.data);
        return response.body.data;
    });
}
exports.getTheaters = getTheaters;
