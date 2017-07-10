"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug");
const HTTPStatus = require("http-status");
const logger_1 = require("../../../../app/middlewares/logger");
const log = debug('SSKTS:MP-util');
/**
 * エンドポイント
 * @const endPoint
 */
exports.endPoint = process.env.MP_ENDPOINT;
/**
 * タイムアウト
 * @const timeout
 */
exports.timeout = 10000;
/**
 * エラー
 * @function errorHandler
 * @param {any} args
 * @param {any} response
 * @requires {void}
 */
function errorHandler(args, response) {
    logger_1.default.error('MP-API:errorHandler', args, response.body, response.statusCode);
    if (response.statusCode === HTTPStatus.NOT_FOUND) {
        throw new Error('NOT_FOUND');
    }
    let message = '';
    if (response.body.errors !== undefined && Array.isArray(response.body.errors)) {
        for (const error of response.body.errors) {
            if (error.description !== undefined) {
                message = error.description;
                break;
            }
        }
        log(response.body.errors);
    }
    throw new Error(message);
}
exports.errorHandler = errorHandler;
