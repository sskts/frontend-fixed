/**
 * MPサービス
 * @namespace MP
 */
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
const GMO = require("@motionpicture/gmo-service");
const debug = require("debug");
const HTTPStatus = require("http-status");
const request = require("request-promise-native");
const debugLog = debug('SSKTS ');
const endPoint = process.env.MP_ENDPOINT;
/**
 * 時間切れ
 * @const TIMEOUT
 */
const TIMEOUT = 1000;
/**
 * エラー
 * @function getErrorMessage
 * @param {any} response
 * @requires {string}
 */
function getErrorMessage(response) {
    let message = '';
    if (response.body.errors && Array.isArray(response.body.errors)) {
        for (const error of response.body.errors) {
            if (error.description) {
                message = error.description;
                break;
            }
        }
        debugLog('errors--------------', response.body.errors);
    }
    return message;
}
/**
 * アクセストークン取得
 * @memberOf MP
 * @function oauthToken
 * @requires {Promise<Performance[]>}
 */
function oauthToken() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield request.post({
            url: `${endPoint}/oauth/token`,
            body: {
                assertion: process.env.SSKTS_API_REFRESH_TOKEN,
                scope: 'admin'
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: TIMEOUT
        });
        if (response.statusCode !== HTTPStatus.OK)
            throw new Error(getErrorMessage(response));
        debugLog('oauthToken:', response.body.access_token);
        return response.body.access_token;
    });
}
exports.oauthToken = oauthToken;
/**
 * 劇場取得
 * @memberOf MP
 * @function getTheater
 * @param {GetTheaterArgs} args
 * @requires {Promise<Theater>}
 */
function getTheater(id) {
    return __awaiter(this, void 0, void 0, function* () {
        debugLog('getTheater args:', id);
        const response = yield request.get({
            url: `${endPoint}/theaters/${id}`,
            auth: { bearer: yield oauthToken() },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: TIMEOUT
        });
        if (response.statusCode !== HTTPStatus.OK)
            throw new Error(getErrorMessage(response));
        debugLog('getTheater:', response.body.data);
        return response.body.data;
    });
}
exports.getTheater = getTheater;
/**
 * スクリーン取得
 * @memberOf MP
 * @function getScreen
 * @param {GetScreenArgs} args
 * @requires {Promise<Screen>}
 */
function getScreen(id) {
    return __awaiter(this, void 0, void 0, function* () {
        debugLog('getScreen args:', id);
        const response = yield request.get({
            url: `${endPoint}/screens/${id}`,
            auth: { bearer: yield oauthToken() },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: TIMEOUT
        });
        if (response.statusCode !== HTTPStatus.OK)
            throw new Error(getErrorMessage(response));
        debugLog('getScreen:', response.body.data);
        return response.body.data;
    });
}
exports.getScreen = getScreen;
/**
 * 作品取得
 * @memberOf MP
 * @function getFilm
 * @param {GetFilmArgs} args
 * @requires {Promise<Film>}
 */
function getFilm(id) {
    return __awaiter(this, void 0, void 0, function* () {
        debugLog('getFilm args:', id);
        const response = yield request.get({
            url: `${endPoint}/films/${id}`,
            auth: { bearer: yield oauthToken() },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: TIMEOUT
        });
        if (response.statusCode !== HTTPStatus.OK)
            throw new Error(getErrorMessage(response));
        debugLog('getFilm:', response.body.data);
        return response.body.data;
    });
}
exports.getFilm = getFilm;
/**
 * パフォーマンス一覧取得
 * @memberOf MP
 * @function getPerformances
 * @param {string} theater 劇場コード
 * @param {string} day 日付
 * @requires {Promise<Performance[]>}
 */
function getPerformances(theater, day) {
    return __awaiter(this, void 0, void 0, function* () {
        debugLog('getPerformances args:', theater, day);
        const response = yield request.get({
            url: `${endPoint}/performances`,
            auth: { bearer: yield oauthToken() },
            qs: {
                theater: theater,
                day: day
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: TIMEOUT
        });
        if (response.statusCode !== HTTPStatus.OK)
            throw new Error(getErrorMessage(response));
        // debugLog('performances:', response.body.data);
        return response.body.data;
    });
}
exports.getPerformances = getPerformances;
/**
 * パフォーマンス取得
 * @memberOf MP
 * @function getPerformance
 * @param {GetPerformanceArgs} args
 * @requires {Promise<Performance>}
 */
function getPerformance(id) {
    return __awaiter(this, void 0, void 0, function* () {
        debugLog('getPerformance args:', id);
        const response = yield request.get({
            url: `${endPoint}/performances/${id}`,
            auth: { bearer: yield oauthToken() },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: TIMEOUT
        });
        if (response.statusCode !== HTTPStatus.OK)
            throw new Error(getErrorMessage(response));
        debugLog('performance:', response.body.data);
        return response.body.data;
    });
}
exports.getPerformance = getPerformance;
/**
 * 取引開始
 * @memberOf MP
 * @function transactionStart
 * @param {TransactionStartArgs} args
 * @returns {Promise<TransactionStartResult>}
 */
function transactionStart(args) {
    return __awaiter(this, void 0, void 0, function* () {
        debugLog('transactionStart args:', args);
        const response = yield request.post({
            url: `${endPoint}/transactions`,
            auth: { bearer: yield oauthToken() },
            body: {
                expired_at: args.expired_at
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: TIMEOUT
        });
        if (response.statusCode !== HTTPStatus.CREATED)
            throw new Error(getErrorMessage(response));
        const transaction = response.body.data;
        debugLog('transaction:', transaction);
        return transaction;
    });
}
exports.transactionStart = transactionStart;
/**
 * COAオーソリ追加
 * @memberOf MP
 * @function addCOAAuthorization
 * @param {AddCOAAuthorizationArgs} args
 * @returns {Promise<AddCOAAuthorizationResult>}
 */
function addCOAAuthorization(args) {
    return __awaiter(this, void 0, void 0, function* () {
        debugLog('addCOAAuthorization args:', args);
        const promoterOwner = args.transaction.attributes.owners.find((owner) => {
            return (owner.group === 'PROMOTER');
        });
        const promoterOwnerId = (promoterOwner) ? promoterOwner.id : null;
        const anonymousOwner = args.transaction.attributes.owners.find((owner) => {
            return (owner.group === 'ANONYMOUS');
        });
        const anonymousOwnerId = (anonymousOwner) ? anonymousOwner.id : null;
        const response = yield request.post({
            url: `${endPoint}/transactions/${args.transaction.id}/authorizations/coaSeatReservation`,
            auth: { bearer: yield oauthToken() },
            body: {
                owner_id_from: promoterOwnerId,
                owner_id_to: anonymousOwnerId,
                coa_tmp_reserve_num: args.reserveSeatsTemporarilyResult.tmp_reserve_num,
                coa_theater_code: args.performanceCOA.theaterCode,
                coa_date_jouei: args.performance.attributes.day,
                coa_title_code: args.performanceCOA.titleCode,
                coa_title_branch_num: args.performanceCOA.titleBranchNum,
                coa_time_begin: args.performance.attributes.time_start,
                coa_screen_code: args.performanceCOA.screenCode,
                seats: args.salesTicketResults.map((tmpReserve) => {
                    return {
                        performance: args.performance.id,
                        section: tmpReserve.section,
                        seat_code: tmpReserve.seat_code,
                        ticket_code: tmpReserve.ticket_code,
                        ticket_name_ja: tmpReserve.ticket_name,
                        ticket_name_en: tmpReserve.ticket_name_eng,
                        ticket_name_kana: tmpReserve.ticket_name_kana,
                        std_price: tmpReserve.std_price,
                        add_price: tmpReserve.add_price,
                        dis_price: tmpReserve.dis_price,
                        sale_price: tmpReserve.sale_price
                    };
                }),
                price: args.price
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: TIMEOUT
        });
        if (response.statusCode !== HTTPStatus.OK)
            throw new Error(getErrorMessage(response));
        debugLog('addCOAAuthorization result');
        return response.body.data;
    });
}
exports.addCOAAuthorization = addCOAAuthorization;
/**
 * COAオーソリ削除
 * @memberOf MP
 * @function removeCOAAuthorization
 * @param {RemoveCOAAuthorizationArgs} args
 * @requires {Promise<void>}
 */
function removeCOAAuthorization(args) {
    return __awaiter(this, void 0, void 0, function* () {
        debugLog('removeCOAAuthorization args:', args);
        const response = yield request.del({
            url: `${endPoint}/transactions/${args.transactionId}/authorizations/${args.coaAuthorizationId}`,
            auth: { bearer: yield oauthToken() },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: TIMEOUT
        });
        if (response.statusCode !== HTTPStatus.NO_CONTENT)
            throw new Error(getErrorMessage(response));
        debugLog('addCOAAuthorization result');
    });
}
exports.removeCOAAuthorization = removeCOAAuthorization;
/**
 * GMOオーソリ追加
 * @memberOf MP
 * @function addGMOAuthorization
 * @param {AddGMOAuthorizationArgs} args
 * @requires {Promise<AddGMOAuthorizationResult>}
 */
function addGMOAuthorization(args) {
    return __awaiter(this, void 0, void 0, function* () {
        debugLog('addGMOAuthorization args:', args);
        const promoterOwner = args.transaction.attributes.owners.find((owner) => {
            return (owner.group === 'PROMOTER');
        });
        const promoterOwnerId = (promoterOwner) ? promoterOwner.id : null;
        const anonymousOwner = args.transaction.attributes.owners.find((owner) => {
            return (owner.group === 'ANONYMOUS');
        });
        const anonymousOwnerId = (anonymousOwner) ? anonymousOwner.id : null;
        const gmoShopId = 'tshop00026096';
        const gmoShopPassword = 'xbxmkaa6';
        const response = yield request.post({
            url: `${endPoint}/transactions/${args.transaction.id}/authorizations/gmo`,
            auth: { bearer: yield oauthToken() },
            body: {
                owner_id_from: anonymousOwnerId,
                owner_id_to: promoterOwnerId,
                gmo_shop_id: gmoShopId,
                gmo_shop_pass: gmoShopPassword,
                gmo_order_id: args.orderId,
                gmo_amount: args.amount,
                gmo_access_id: args.entryTranResult.accessId,
                gmo_access_pass: args.entryTranResult.accessPass,
                gmo_job_cd: GMO.Util.JOB_CD_SALES,
                gmo_pay_type: GMO.Util.PAY_TYPE_CREDIT
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: TIMEOUT
        });
        if (response.statusCode !== HTTPStatus.OK)
            throw new Error(getErrorMessage(response));
        debugLog('addGMOAuthorization result:');
        return response.body.data;
    });
}
exports.addGMOAuthorization = addGMOAuthorization;
/**
 * GMOオーソリ削除
 * @memberOf MP
 * @function removeGMOAuthorization
 * @param {RemoveGMOAuthorizationArgs} args
 * @returns {Promise<void>}
 */
function removeGMOAuthorization(args) {
    return __awaiter(this, void 0, void 0, function* () {
        debugLog('removeGMOAuthorization args:', args);
        const response = yield request.del({
            url: `${endPoint}/transactions/${args.transactionId}/authorizations/${args.gmoAuthorizationId}`,
            auth: { bearer: yield oauthToken() },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: TIMEOUT
        });
        if (response.statusCode !== HTTPStatus.NO_CONTENT)
            throw new Error(getErrorMessage(response));
        debugLog('removeGMOAuthorization result:');
    });
}
exports.removeGMOAuthorization = removeGMOAuthorization;
/**
 * 購入者情報登録
 * @memberOf MP
 * @function ownersAnonymous
 * @param {OwnersAnonymousArgs} args
 * @returns {Promise<void>}
 */
function ownersAnonymous(args) {
    return __awaiter(this, void 0, void 0, function* () {
        debugLog('ownersAnonymous args:', args);
        const response = yield request.patch({
            url: `${endPoint}/transactions/${args.transactionId}/anonymousOwner`,
            auth: { bearer: yield oauthToken() },
            body: {
                name_first: args.name_first,
                name_last: args.name_last,
                tel: args.tel,
                email: args.email
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: TIMEOUT
        });
        if (response.statusCode !== HTTPStatus.NO_CONTENT)
            throw new Error(getErrorMessage(response));
        debugLog('ownersAnonymous result:');
    });
}
exports.ownersAnonymous = ownersAnonymous;
/**
 * 照会情報登録(購入番号と電話番号で照会する場合)
 * @memberOf MP
 * @function transactionsEnableInquiry
 * @param {TransactionsEnableInquiryArgs} args
 * @returns {Promise<void>}
 */
function transactionsEnableInquiry(args) {
    return __awaiter(this, void 0, void 0, function* () {
        debugLog('transactionsEnableInquiry args:', args);
        const response = yield request.patch({
            url: `${endPoint}/transactions/${args.transactionId}/enableInquiry`,
            auth: { bearer: yield oauthToken() },
            body: {
                inquiry_theater: args.inquiry_theater,
                inquiry_id: args.inquiry_id,
                inquiry_pass: args.inquiry_pass
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: TIMEOUT
        });
        if (response.statusCode !== HTTPStatus.NO_CONTENT)
            throw new Error(getErrorMessage(response));
        debugLog('transactionsEnableInquiry result:');
    });
}
exports.transactionsEnableInquiry = transactionsEnableInquiry;
/**
 * 取引成立
 * @memberOf MP
 * @function transactionClose
 * @param {TransactionCloseArgs} args
 * @returns {Promise<void>}
 */
function transactionClose(args) {
    return __awaiter(this, void 0, void 0, function* () {
        debugLog('transactionClose args:', args);
        const response = yield request.patch({
            url: `${endPoint}/transactions/${args.transactionId}/close`,
            auth: { bearer: yield oauthToken() },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: TIMEOUT
        });
        if (response.statusCode !== HTTPStatus.NO_CONTENT)
            throw new Error(getErrorMessage(response));
        debugLog('close result:');
    });
}
exports.transactionClose = transactionClose;
/**
 * メール追加
 * @memberOf MP
 * @function addEmail
 * @param {AddEmailArgs} args
 * @returns {Promise<AddEmailResult>}
 */
function addEmail(args) {
    return __awaiter(this, void 0, void 0, function* () {
        debugLog('addEmail args:', args);
        const response = yield request.post({
            url: `${endPoint}/transactions/${args.transactionId}/notifications/email`,
            auth: { bearer: yield oauthToken() },
            body: {
                from: args.from,
                to: args.to,
                subject: args.subject,
                content: args.content
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: TIMEOUT
        });
        if (response.statusCode !== HTTPStatus.OK)
            throw new Error(getErrorMessage(response));
        debugLog('addEmail result:' + response.body.data);
        return response.body.data;
    });
}
exports.addEmail = addEmail;
/**
 * メール削除
 * @memberOf MP
 * @function removeEmail
 * @param {RemoveEmailArgs} args
 * @returns {Promise<void>}
 */
function removeEmail(args) {
    return __awaiter(this, void 0, void 0, function* () {
        debugLog('removeEmail args:', args);
        const response = yield request.del({
            url: `${endPoint}/transactions/${args.transactionId}/notifications/${args.emailId}`,
            auth: { bearer: yield oauthToken() },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: TIMEOUT
        });
        if (response.statusCode !== HTTPStatus.NO_CONTENT)
            throw new Error(getErrorMessage(response));
        debugLog('removeEmail result:');
    });
}
exports.removeEmail = removeEmail;
/**
 * 照会取引情報取得
 * @memberOf MP
 * @function makeInquiry
 * @param {MakeInquiryArgs} args
 * @returns {Promise<string>}
 */
function makeInquiry(args) {
    return __awaiter(this, void 0, void 0, function* () {
        debugLog('makeInquiry args:', args);
        const response = yield request.post({
            url: `${endPoint}/transactions/makeInquiry`,
            auth: { bearer: yield oauthToken() },
            body: {
                inquiry_theater: args.inquiry_theater,
                inquiry_id: args.inquiry_id,
                inquiry_pass: args.inquiry_pass
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: TIMEOUT
        });
        if (response.statusCode !== HTTPStatus.OK)
            throw new Error(getErrorMessage(response));
        debugLog('makeInquiry result:' + response.body.data);
        return response.body.data.id;
    });
}
exports.makeInquiry = makeInquiry;
/**
 * COA情報取得
 * @memberOf MP
 * @function getPerformanceCOA
 * @param {string} theater 劇場id
 * @param {string} screenId スクリーンid
 * @param {string} filmId 作品id
 * @returns {Promise<COAPerformance>}
 */
function getPerformanceCOA(theaterId, screenId, filmId) {
    return __awaiter(this, void 0, void 0, function* () {
        debugLog('getPerformanceCOA args:', theaterId, screenId, filmId);
        const theater = yield getTheater(theaterId);
        debugLog('劇場取得');
        const screen = yield getScreen(screenId);
        debugLog('スクリーン取得');
        const film = yield getFilm(filmId);
        debugLog('作品取得');
        return {
            theaterCode: theater.id,
            screenCode: screen.attributes.coa_screen_code,
            titleCode: film.attributes.coa_title_code,
            titleBranchNum: film.attributes.coa_title_branch_num
        };
    });
}
exports.getPerformanceCOA = getPerformanceCOA;
