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
const util = require("../utils/util");
const log = debug('SSKTS:services.theater');
/**
 * 劇場取得
 * @memberof services.theater
 * @function getTheater
 * @param {IGetTheaterArgs} args
 * @requires {Promise<IGetTheaterResult>}
 */
function getTheater(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield request.get({
            url: `${process.env.MP_ENDPOINT}/theaters/${args.theaterId}`,
            auth: { bearer: args.accessToken },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.TIMEOUT
        }).promise();
        if (response.statusCode !== HTTPStatus.OK)
            util.errorHandler(args, response);
        log('getTheater:', response.body.data);
        const data = response.body.data;
        return {
            id: data.id,
            attributes: {
                address: data.attributes.address,
                name: data.attributes.name,
                nameKana: data.attributes.name_kana,
                gmo: {
                    siteId: data.attributes.gmo.site_id,
                    shopId: data.attributes.gmo.shop_id,
                    shopPass: data.attributes.gmo.shop_pass
                },
                websites: data.attributes.websites.map((website) => {
                    return {
                        group: website.group,
                        name: website.name,
                        url: website.url
                    };
                })
            }
        };
    });
}
exports.getTheater = getTheater;
/**
 * 劇場一覧取得
 * @memberof MP
 * @function getTheaters
 * @param {IGetTheatersArgs} args
 * @returns {Promise<ITheater[]>}
 */
function getTheaters(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield request.get({
            url: `${process.env.MP_ENDPOINT}/theaters`,
            auth: { bearer: args.accessToken },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.TIMEOUT
        }).promise();
        if (response.statusCode !== HTTPStatus.OK)
            util.errorHandler(args, response);
        log('getTheaters:', response.body.data);
        return response.body.data.map((data) => {
            return {
                id: data.id,
                attributes: {
                    address: data.attributes.address,
                    name: data.attributes.name,
                    nameKana: data.attributes.name_kana,
                    websites: data.attributes.websites.map((website) => {
                        return {
                            group: website.group,
                            name: website.name,
                            url: website.url
                        };
                    })
                }
            };
        });
    });
}
exports.getTheaters = getTheaters;
