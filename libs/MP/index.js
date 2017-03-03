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
const GMO = require("@motionpicture/gmo-service");
const debug = require("debug");
const request = require("request-promise-native");
const debugLog = debug('SSKTS: ');
const endPoint = process.env.MP_ENDPOINT;
/**
 * ステータスコード200
 * @const STATUS_CODE_200
 */
const STATUS_CODE_200 = 200;
/**
 * ステータスコード201
 * @const STATUS_CODE_201
 */
const STATUS_CODE_201 = 201;
/**
 * ステータスコード204
 * @const STATUS_CODE_204
 */
const STATUS_CODE_204 = 204;
/**
 * 時間切れ
 * @const TIMEOUT
 */
const TIMEOUT = 1000;
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
        if (response.statusCode !== STATUS_CODE_200)
            throw new Error(response.body.message);
        debugLog('oauthToken:', response.body.access_token);
        return response.body.access_token;
    });
}
exports.oauthToken = oauthToken;
/**
 * パフォーマンス一覧取得
 * @memberOf MP
 * @function getPerformances
 * @param {GetPerformancesArgs} args
 * @requires {Promise<Performance[]>}
 */
function getPerformances(day) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield request.get({
            url: `${endPoint}/performances/?day=${day}`,
            auth: { bearer: yield oauthToken() },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: TIMEOUT
        });
        if (response.statusCode !== STATUS_CODE_200)
            throw new Error(response.body.message);
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
function getPerformance(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield request.get({
            url: `${endPoint}/performances/${args.id}`,
            auth: { bearer: yield oauthToken() },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: TIMEOUT
        });
        if (response.statusCode !== STATUS_CODE_200)
            throw new Error(response.body.message);
        debugLog('performances:', response.body.data);
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
        if (response.statusCode !== STATUS_CODE_201)
            throw new Error(response.body.message);
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
                coa_theater_code: args.performance.attributes.theater.id,
                coa_date_jouei: args.performance.attributes.day,
                coa_title_code: args.performance.attributes.film.coa_title_code,
                coa_title_branch_num: args.performance.attributes.film.coa_title_branch_num,
                coa_time_begin: args.performance.attributes.time_start,
                coa_screen_code: args.performance.attributes.screen.coa_screen_code,
                seats: args.salesTicketResults.map((tmpReserve) => {
                    return {
                        performance: args.performance.id,
                        section: tmpReserve.section,
                        seat_code: tmpReserve.seat_code,
                        ticket_code: tmpReserve.ticket_code,
                        ticket_name_ja: tmpReserve.ticket_name_ja,
                        ticket_name_en: tmpReserve.ticket_name_en,
                        ticket_name_kana: tmpReserve.ticket_name_kana,
                        std_price: tmpReserve.std_price,
                        add_price: tmpReserve.add_price,
                        dis_price: tmpReserve.dis_price,
                        sale_price: tmpReserve.sale_price
                    };
                }),
                price: args.totalPrice
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: TIMEOUT
        });
        if (response.statusCode !== STATUS_CODE_200)
            throw new Error(response.body.message);
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
        const response = yield request.del({
            url: `${endPoint}/transactions/${args.transactionId}/authorizations/${args.coaAuthorizationId}`,
            auth: { bearer: yield oauthToken() },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: TIMEOUT
        });
        if (response.statusCode !== STATUS_CODE_204)
            throw new Error(response.body.message);
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
        const promoterOwner = args.transaction.attributes.owners.find((owner) => {
            return (owner.group === 'PROMOTER');
        });
        const promoterOwnerId = (promoterOwner) ? promoterOwner.id : null;
        const anonymousOwner = args.transaction.attributes.owners.find((owner) => {
            return (owner.group === 'ANONYMOUS');
        });
        const anonymousOwnerId = (anonymousOwner) ? anonymousOwner.id : null;
        const response = yield request.post({
            url: `${endPoint}/transactions/${args.transaction.id}/authorizations/gmo`,
            auth: { bearer: yield oauthToken() },
            body: {
                owner_id_from: anonymousOwnerId,
                owner_id_to: promoterOwnerId,
                gmo_shop_id: process.env.GMO_SHOP_ID,
                gmo_shop_password: process.env.GMO_SHOP_PASSWORD,
                gmo_order_id: args.orderId,
                gmo_amount: args.amount,
                gmo_access_id: args.entryTranResult.accessId,
                gmo_access_password: args.entryTranResult.accessPass,
                gmo_job_cd: GMO.Util.JOB_CD_SALES,
                gmo_pay_type: GMO.Util.PAY_TYPE_CREDIT
            },
            json: true,
            resolveWithFullResponse: true,
            timeout: TIMEOUT
        });
        if (response.statusCode !== STATUS_CODE_200)
            throw new Error(response.body.message);
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
        const response = yield request.del({
            url: `${endPoint}/transactions/${args.transactionId}/authorizations/${args.gmoAuthorizationId}`,
            auth: { bearer: yield oauthToken() },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: TIMEOUT
        });
        if (response.statusCode !== STATUS_CODE_204)
            throw new Error(response.body.message);
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
        if (response.statusCode !== STATUS_CODE_204)
            throw new Error(response.body.message);
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
        if (response.statusCode !== STATUS_CODE_204)
            throw new Error(response.body.message);
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
        const response = yield request.patch({
            url: `${endPoint}/transactions/${args.transactionId}/close`,
            auth: { bearer: yield oauthToken() },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: TIMEOUT
        });
        if (response.statusCode !== STATUS_CODE_204)
            throw new Error(response.body.message);
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
        if (response.statusCode !== STATUS_CODE_200)
            throw new Error(response.body.message);
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
        const response = yield request.del({
            url: `${endPoint}/transactions/${args.transactionId}/notifications/${args.emailId}`,
            auth: { bearer: yield oauthToken() },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: TIMEOUT
        });
        if (response.statusCode !== STATUS_CODE_204)
            throw new Error(response.body.message);
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
        if (response.statusCode !== STATUS_CODE_200)
            throw new Error(response.body.message);
        debugLog('makeInquiry result:' + response.body.data);
        return response.body.data.id;
    });
}
exports.makeInquiry = makeInquiry;
