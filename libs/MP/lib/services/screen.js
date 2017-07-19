"use strict";
/**
 * スクリーンサービス
 * @namespace services.screen
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
const log = debug('SSKTS:services.screen');
/**
 * スクリーン取得
 * @memberof services.screen
 * @function getScreen
 * @param {IGetScreenArgs} args
 * @requires {Promise<Screen>}
 */
function getScreen(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield request.get({
            url: `${util.ENDPOINT}/screens/${args.screenId}`,
            auth: { bearer: args.accessToken },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.TIMEOUT
        }).promise();
        if (response.statusCode !== HTTPStatus.OK)
            util.errorHandler(args, response);
        log('getScreen:', response.body.data);
        const data = response.body.data;
        return {
            id: data.id,
            attributes: {
                coaScreenCode: data.attributes.coa_screen_code,
                name: data.attributes.name,
                seatsNumbersBySeatGrade: data.attributes.seats_numbers_by_seat_grade,
                sections: data.attributes.sections.map((section) => {
                    return {
                        code: section.code,
                        name: section.name,
                        seats: section.seats.map((seat) => {
                            return {
                                code: seat.code
                            };
                        })
                    };
                }),
                theater: data.attributes.theater
            }
        };
    });
}
exports.getScreen = getScreen;
