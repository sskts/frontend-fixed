"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 会員サービス
 * @namespace services.owner
 */
const debug = require("debug");
const HTTPStatus = require("http-status");
const request = require("request-promise-native");
const util = require("../utils/util");
const log = debug('SSKTS:services.owner');
/**
 * 会員プロフィール取得
 * @desc ログイン中の会員のプロフィールを取得します。
 * @memberof services.owner
 * @function getProfile
 * @param {IGetProfileArgs} args
 * @returns {Promise<IProfile>}
 */
function getProfile(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield request.get({
            url: `${util.endPoint}/owners/me/profile`,
            auth: { bearer: args.accessToken },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.OK)
            util.errorHandler(undefined, response);
        log('getProfile:', response.body.data);
        return response.body.data;
    });
}
exports.getProfile = getProfile;
/**
 * 会員プロフィール更新
 * @desc ログイン中の会員のプロフィールを更新します。
 * @memberof services.owner
 * @function updateProfile
 * @param {IUpdateProfileArgs} args
 */
function updateProfile(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = args;
        const response = yield request.put({
            url: `${util.endPoint}/owners/me/profile`,
            auth: { bearer: args.accessToken },
            body: body,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.NO_CONTENT)
            util.errorHandler(body, response);
        log('updateProfile:');
        return;
    });
}
exports.updateProfile = updateProfile;
/**
 * 会員カード検索
 * @desc ログイン中の会員のカードを検索します。
 * @memberof services.owner
 * @function searchCards
 * @param {ISearchCardsArgs} args
 * @returns {Promise<ICard[]>}
 */
function searchCards(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield request.get({
            url: `${util.endPoint}/owners/me/cards`,
            auth: { bearer: args.accessToken },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.OK)
            util.errorHandler(undefined, response);
        log('searchCards:', response.body.data);
        return response.body.data;
    });
}
exports.searchCards = searchCards;
/**
 * 会員カード追加
 * @desc ログイン中の会員のカードを作成します。
 * @memberof services.owner
 * @function addCard
 * @param {IAddCardArgs} args
 * @returns {Promise<void>}
 */
function addCard(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = args;
        const response = yield request.post({
            url: `${util.endPoint}/owners/me/cards`,
            auth: { bearer: args.accessToken },
            body: body,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.CREATED)
            util.errorHandler(undefined, response);
        log('addCard:');
        return response.body.data;
    });
}
exports.addCard = addCard;
/**
 * 会員カード削除
 * @desc ログイン中の会員のカードを削除します。
 * @memberof services.owner
 * @function removeCard
 * @param {IRemoveCardArgs} args
 * @returns {Promise<void>}
 */
function removeCard(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield request.delete({
            url: `${util.endPoint}/owners/me/cards${args.cardId}`,
            auth: { bearer: args.accessToken },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.NO_CONTENT)
            util.errorHandler(args, response);
        log('removeCard:');
        return;
    });
}
exports.removeCard = removeCard;
/**
 * 会員座席予約資産検索
 * @desc ログイン中の会員のカードを検索します。
 * @memberof services.owner
 * @function searchSeatReservation
 * @param {ISeatReservationArgs} args
 * @returns {Promise<ISeatReservationResult[]>}
 */
function searchSeatReservation(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield request.get({
            url: `${util.endPoint}/owners/me/assets/seatReservation`,
            auth: { bearer: args.accessToken },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.OK)
            util.errorHandler(undefined, response);
        log('searchSeatReservation:', response.body.data);
        return response.body.data;
    });
}
exports.searchSeatReservation = searchSeatReservation;
