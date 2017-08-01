"use strict";
/**
 * 組織サービス
 *
 * @namespace service.organization
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
 * 劇場組織検索
 */
function searchMovieTheaters(args) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield apiRequest_1.default({
            uri: '/organizations/movieTheater',
            method: 'GET',
            expectedStatusCodes: [http_status_1.OK],
            auth: { bearer: yield args.auth.getAccessToken() },
            qs: args.searchConditions
        });
    });
}
exports.searchMovieTheaters = searchMovieTheaters;
/**
 * 枝番号で劇場組織検索
 */
function findMovieTheaterByBranchCode(args) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield apiRequest_1.default({
            uri: `/organizations/movieTheater/${args.branchCode}`,
            method: 'GET',
            expectedStatusCodes: [http_status_1.NOT_FOUND, http_status_1.OK],
            auth: { bearer: yield args.auth.getAccessToken() }
        });
    });
}
exports.findMovieTheaterByBranchCode = findMovieTheaterByBranchCode;
