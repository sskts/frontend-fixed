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
const util = require("../utils/util");
const log = debug('SSKTS:services.performance');
/**
 * パフォーマンス一覧取得
 * @desc 条件を指定してパフォーマンスを検索します。
 * @memberof services.performance
 * @function getPerformances
 * @param {IGetPerformancesArgs} args
 * @requires {Promise<IPerformance[]>}
 */
function getPerformances(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const qs = {
            theater: args.theater,
            day: args.day
        };
        const response = yield request.get({
            url: `${util.ENDPOINT}/performances`,
            auth: { bearer: args.accessToken },
            qs: qs,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.TIMEOUT
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
 * @param {IGetPerformanceArgs} args
 * @requires {Promise<IPerformance>}
 */
function getPerformance(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield request.get({
            url: `${util.ENDPOINT}/performances/${args.performanceId}`,
            auth: { bearer: args.accessToken },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.TIMEOUT
        }).promise();
        if (response.statusCode !== HTTPStatus.OK)
            util.errorHandler(args, response);
        log('performance:', response.body.data);
        return response.body.data;
    });
}
exports.getPerformance = getPerformance;
