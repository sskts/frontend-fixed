"use strict";
/**
 * パフォーマンスサービス
 * @namespace services.performance
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
const log = debug('SSKTS:services.performance');
/**
 * パフォーマンス一覧取得
 * @desc 条件を指定してパフォーマンスを検索します。
 * @memberof services.performance
 * @function getPerformances
 * @param {string} theater 劇場コード
 * @param {string} day 日付
 * @requires {Promise<IPerformance[]>}
 */
function getPerformances(theater, day) {
    return __awaiter(this, void 0, void 0, function* () {
        const qs = {
            theater: theater,
            day: day
        };
        const response = yield request.get({
            url: `${util.endPoint}/performances`,
            auth: { bearer: yield oauth.oauthToken() },
            qs: qs,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.OK)
            util.errorHandler(qs, response);
        // log('performances:', response.body.data);
        return response.body.data;
    });
}
exports.getPerformances = getPerformances;
/**
 * パフォーマンス取得
 * @desc IDでパフォーマンス情報を取得します。
 * @memberof services.performance
 * @function getPerformance
 * @param {GetPerformanceArgs} args
 * @requires {Promise<IPerformance>}
 */
function getPerformance(id) {
    return __awaiter(this, void 0, void 0, function* () {
        log('getPerformance args:', id);
        const response = yield request.get({
            url: `${util.endPoint}/performances/${id}`,
            auth: { bearer: yield oauth.oauthToken() },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.OK)
            util.errorHandler({}, response);
        log('performance:', response.body.data);
        return response.body.data;
    });
}
exports.getPerformance = getPerformance;
