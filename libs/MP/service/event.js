"use strict";
/**
 * イベントサービス
 *
 * @namespace service.event
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
const http_status_1 = require("http-status");
const apiRequest_1 = require("../apiRequest");
/**
 * 上映イベント検索
 */
function searchIndividualScreeningEvent(args) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield apiRequest_1.default({
            uri: '/events/individualScreeningEvent',
            qs: args.searchConditions,
            auth: { bearer: yield args.auth.getAccessToken() },
            method: 'GET',
            expectedStatusCodes: [http_status_1.OK]
        });
    });
}
exports.searchIndividualScreeningEvent = searchIndividualScreeningEvent;
/**
 * 上映イベント情報取得
 * 存在しなければnullを返します。
 */
function findIndividualScreeningEvent(args) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield apiRequest_1.default({
            uri: `/events/individualScreeningEvent/${args.identifier}`,
            auth: { bearer: yield args.auth.getAccessToken() },
            method: 'GET',
            expectedStatusCodes: [http_status_1.OK, http_status_1.NOT_FOUND]
        });
    });
}
exports.findIndividualScreeningEvent = findIndividualScreeningEvent;
