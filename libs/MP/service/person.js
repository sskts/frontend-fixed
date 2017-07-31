"use strict";
/**
 * 人物サービス
 *
 * @namespace service.person
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
// import * as sskts from '@motionpicture/sskts-domain';
const httpStatus = require("http-status");
const apiRequest_1 = require("../apiRequest");
/**
 * プロフィール取得
 */
function getMyProfile(args) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield apiRequest_1.default({
            uri: '/people/me/profile',
            // qs: args.searchConditions,
            auth: { bearer: yield args.auth.getAccessToken() },
            method: 'GET',
            expectedStatusCodes: [httpStatus.OK]
        });
    });
}
exports.getMyProfile = getMyProfile;
/**
 * プロフィール変更
 */
function updateMyProfile(args) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield apiRequest_1.default({
            uri: '/people/me/profile',
            body: args.profile,
            auth: { bearer: yield args.auth.getAccessToken() },
            method: 'PUT',
            expectedStatusCodes: [httpStatus.NO_CONTENT]
        });
    });
}
exports.updateMyProfile = updateMyProfile;
/**
 * クレジットカード検索
 */
function findMyCreditCards(args) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield apiRequest_1.default({
            uri: '/people/me/creditCards',
            // qs: args.searchConditions,
            auth: { bearer: yield args.auth.getAccessToken() },
            method: 'GET',
            expectedStatusCodes: [httpStatus.OK]
        });
    });
}
exports.findMyCreditCards = findMyCreditCards;
/**
 * クレジットカード追加
 */
function addMyCreditCard(args) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield apiRequest_1.default({
            uri: '/people/me/creditCards',
            body: args.creditCard,
            auth: { bearer: yield args.auth.getAccessToken() },
            method: 'POST',
            expectedStatusCodes: [httpStatus.CREATED]
        });
    });
}
exports.addMyCreditCard = addMyCreditCard;
