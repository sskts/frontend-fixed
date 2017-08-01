"use strict";
/**
 * APIリクエストモジュール
 */
Object.defineProperty(exports, "__esModule", { value: true });
const createDebug = require("debug");
const request = require("request-promise-native");
// import * as parseString from 'string-template';
const debug = createDebug('sskts-api:apiRequest');
const API_ENDPOINT = process.env.TEST_API_ENDPOINT;
/**
 * Create and send request to API
 */
function createAPIRequest(options) {
    // Parse urls
    // if (options.url) {
    //     options.url = parseString(options.url, params);
    // }
    const expectedStatusCodes = options.expectedStatusCodes;
    delete options.expectedStatusCodes;
    const defaultOptions = {
        baseUrl: API_ENDPOINT,
        headers: {},
        qs: {},
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        useQuerystring: true
    };
    options = Object.assign({}, defaultOptions, options);
    return request(options)
        .then((response) => {
        debug('request processed', response.statusCode, response.body);
        if (expectedStatusCodes.indexOf(response.statusCode) < 0) {
            // todo エラーパターン
            if (typeof response.body === 'string') {
                throw new Error(response.body);
            }
            if (typeof response.body === 'object' && response.body.errors !== undefined) {
                const message = response.body.errors.map((error) => {
                    return `${error.title}:${error.detail}`;
                }).join(', ');
                throw new Error(message);
            }
            throw new Error('An unexpected error occurred');
        }
        if (response.body !== undefined && response.body.data !== undefined) {
            return response.body.data;
        }
    });
}
exports.default = createAPIRequest;
