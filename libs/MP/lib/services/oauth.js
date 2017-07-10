"use strict";
/**
 * 認証サービス
 * @namespace services.oauth
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
const log = debug('SSKTS:MP-theater');
/**
 * アクセストークン取得
 * @desc OAuth認可エンドポイント。アクセストークンを取得します。
 * @memberof services.oauth
 * @function oauthToken
 * @requires {Promise<Performance[]>}
 */
function oauthToken() {
    return __awaiter(this, void 0, void 0, function* () {
        const body = {
            assertion: process.env.SSKTS_API_REFRESH_TOKEN,
            scope: 'admin'
        };
        const response = yield request.post({
            url: `${util.endPoint}/oauth/token`,
            body: body,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.OK)
            util.errorHandler({}, response);
        log('oauthToken:', response.body.access_token);
        return response.body.access_token;
    });
}
exports.oauthToken = oauthToken;
