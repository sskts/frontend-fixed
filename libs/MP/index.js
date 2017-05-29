"use strict";
/**
 * MPサービス
 * @namespace MP
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
const GMO = require("@motionpicture/gmo-service");
const debug = require("debug");
const HTTPStatus = require("http-status");
const request = require("request-promise-native");
const logger_1 = require("../../app/middlewares/logger");
const log = debug('SSKTS:MP');
const endPoint = process.env.MP_ENDPOINT;
/**
 * 時間切れ
 * @const timeout
 */
const timeout = 10000;
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
/**
 * アクセストークン取得
 * @memberOf MP
 * @function oauthToken
 * @requires {Promise<Performance[]>}
 */
function oauthToken() {
    return __awaiter(this, void 0, void 0, function* () {
        const body = {
            assertion: process.env.SSKTS_API_REFRESH_TOKEN,
            scope: 'admin'
        };
        const response = yield request.post({
            url: `${endPoint}/oauth/token`,
            body: body,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.OK)
            errorHandler({}, response);
        log('oauthToken:', response.body.access_token);
        return response.body.access_token;
    });
}
exports.oauthToken = oauthToken;
/**
 * 劇場取得
 * @memberOf MP
 * @function getTheater
 * @param {GetTheaterArgs} args
 * @requires {Promise<ITheater>}
 */
function getTheater(id) {
    return __awaiter(this, void 0, void 0, function* () {
        log('getTheater args:', id);
        const response = yield request.get({
            url: `${endPoint}/theaters/${id}`,
            auth: { bearer: yield oauthToken() },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.OK)
            errorHandler({}, response);
        log('getTheater:', response.body.data);
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
        log('getScreen args:', id);
        const response = yield request.get({
            url: `${endPoint}/screens/${id}`,
            auth: { bearer: yield oauthToken() },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.OK)
            errorHandler({}, response);
        log('getScreen:', response.body.data);
        return response.body.data;
    });
}
exports.getScreen = getScreen;
/**
 * 作品取得
 * @memberOf MP
 * @function getFilm
 * @param {GetFilmArgs} args
 * @requires {Promise<IFilm>}
 */
function getFilm(id) {
    return __awaiter(this, void 0, void 0, function* () {
        log('getFilm args:', id);
        const response = yield request.get({
            url: `${endPoint}/films/${id}`,
            auth: { bearer: yield oauthToken() },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.OK)
            errorHandler({}, response);
        log('getFilm:', response.body.data);
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
 * @requires {Promise<IPerformance[]>}
 */
function getPerformances(theater, day) {
    return __awaiter(this, void 0, void 0, function* () {
        const qs = {
            theater: theater,
            day: day
        };
        const response = yield request.get({
            url: `${endPoint}/performances`,
            auth: { bearer: yield oauthToken() },
            qs: qs,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.OK)
            errorHandler(qs, response);
        // log('performances:', response.body.data);
        return response.body.data;
    });
}
exports.getPerformances = getPerformances;
/**
 * パフォーマンス取得
 * @memberOf MP
 * @function getPerformance
 * @param {GetPerformanceArgs} args
 * @requires {Promise<IPerformance>}
 */
function getPerformance(id) {
    return __awaiter(this, void 0, void 0, function* () {
        log('getPerformance args:', id);
        const response = yield request.get({
            url: `${endPoint}/performances/${id}`,
            auth: { bearer: yield oauthToken() },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.OK)
            errorHandler({}, response);
        log('performance:', response.body.data);
        return response.body.data;
    });
}
exports.getPerformance = getPerformance;
/**
 * 取引開始
 * @memberOf MP
 * @function transactionStart
 * @param {TransactionStartArgs} args
 * @returns {Promise<ITransactionStartResult>}
 */
function transactionStart(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = {
            expires_at: args.expires_at
        };
        const response = yield request.post({
            url: `${endPoint}/transactions/startIfPossible`,
            auth: { bearer: yield oauthToken() },
            body: body,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: timeout
        }).promise();
        log('--------------------transaction:', response.body);
        if (response.statusCode !== HTTPStatus.OK)
            errorHandler(body, response);
        const transaction = response.body.data;
        log('transaction:', transaction);
        return transaction;
    });
}
exports.transactionStart = transactionStart;
/**
 * COAオーソリ追加
 * @memberOf MP
 * @function addCOAAuthorization
 * @param {IAddCOAAuthorizationArgs} args
 * @returns {Promise<IAddCOAAuthorizationResult>}
 */
function addCOAAuthorization(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const promoterOwner = args.transaction.attributes.owners.find((owner) => {
            return (owner.group === 'PROMOTER');
        });
        const promoterOwnerId = (promoterOwner !== undefined) ? promoterOwner.id : null;
        const anonymousOwner = args.transaction.attributes.owners.find((owner) => {
            return (owner.group === 'ANONYMOUS');
        });
        const anonymousOwnerId = (anonymousOwner !== undefined) ? anonymousOwner.id : null;
        const body = {
            owner_from: promoterOwnerId,
            owner_to: anonymousOwnerId,
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
                    screen_section: tmpReserve.section,
                    seat_code: tmpReserve.seat_code,
                    ticket_code: tmpReserve.ticket_code,
                    ticket_name: {
                        ja: tmpReserve.ticket_name,
                        en: tmpReserve.ticket_name_eng // チケット名（英）
                    },
                    ticket_name_kana: tmpReserve.ticket_name_kana,
                    std_price: tmpReserve.std_price,
                    add_price: tmpReserve.add_price,
                    dis_price: tmpReserve.dis_price,
                    sale_price: tmpReserve.sale_price,
                    mvtk_app_price: tmpReserve.mvtk_app_price,
                    add_glasses: tmpReserve.add_price_glasses,
                    kbn_eisyahousiki: tmpReserve.kbn_eisyahousiki,
                    mvtk_num: tmpReserve.mvtk_num,
                    mvtk_kbn_denshiken: tmpReserve.mvtk_kbn_denshiken,
                    mvtk_kbn_maeuriken: tmpReserve.mvtk_kbn_maeuriken,
                    mvtk_kbn_kensyu: tmpReserve.mvtk_kbn_kensyu,
                    mvtk_sales_price: tmpReserve.mvtk_sales_price // ムビチケ販売単価
                };
            }),
            price: args.price
        };
        const response = yield request.post({
            url: `${endPoint}/transactions/${args.transaction.id}/authorizations/coaSeatReservation`,
            auth: { bearer: yield oauthToken() },
            body: body,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.OK)
            errorHandler(body, response);
        log('addCOAAuthorization result');
        return response.body.data;
    });
}
exports.addCOAAuthorization = addCOAAuthorization;
/**
 * COAオーソリ削除
 * @memberOf MP
 * @function removeCOAAuthorization
 * @param {IRemoveCOAAuthorizationArgs} args
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
            timeout: timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.NO_CONTENT)
            errorHandler({}, response);
        log('removeCOAAuthorization result');
    });
}
exports.removeCOAAuthorization = removeCOAAuthorization;
/**
 * GMOオーソリ追加
 * @memberOf MP
 * @function addGMOAuthorization
 * @param {IAddGMOAuthorizationArgs} args
 * @requires {Promise<IAddGMOAuthorizationResult>}
 */
function addGMOAuthorization(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const promoterOwner = args.transaction.attributes.owners.find((owner) => {
            return (owner.group === 'PROMOTER');
        });
        const promoterOwnerId = (promoterOwner !== undefined) ? promoterOwner.id : null;
        const anonymousOwner = args.transaction.attributes.owners.find((owner) => {
            return (owner.group === 'ANONYMOUS');
        });
        const anonymousOwnerId = (anonymousOwner !== undefined) ? anonymousOwner.id : null;
        const body = {
            owner_from: anonymousOwnerId,
            owner_to: promoterOwnerId,
            gmo_shop_id: args.gmoShopId,
            gmo_shop_pass: args.gmoShopPassword,
            gmo_order_id: args.orderId,
            gmo_amount: args.amount,
            gmo_access_id: args.entryTranResult.accessId,
            gmo_access_pass: args.entryTranResult.accessPass,
            gmo_job_cd: GMO.Util.JOB_CD_AUTH,
            gmo_pay_type: GMO.Util.PAY_TYPE_CREDIT
        };
        const response = yield request.post({
            url: `${endPoint}/transactions/${args.transaction.id}/authorizations/gmo`,
            auth: { bearer: yield oauthToken() },
            body: body,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.OK)
            errorHandler(body, response);
        log('addGMOAuthorization result:');
        return response.body.data;
    });
}
exports.addGMOAuthorization = addGMOAuthorization;
/**
 * GMOオーソリ削除
 * @memberOf MP
 * @function removeGMOAuthorization
 * @param {IRemoveGMOAuthorizationArgs} args
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
            timeout: timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.NO_CONTENT)
            errorHandler({}, response);
        log('removeGMOAuthorization result:');
    });
}
exports.removeGMOAuthorization = removeGMOAuthorization;
/**
 * 購入者情報登録
 * @memberOf MP
 * @function ownersAnonymous
 * @param {IOwnersAnonymousArgs} args
 * @returns {Promise<void>}
 */
function ownersAnonymous(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = {
            name_first: args.name_first,
            name_last: args.name_last,
            tel: args.tel,
            email: args.email
        };
        const response = yield request.patch({
            url: `${endPoint}/transactions/${args.transactionId}/anonymousOwner`,
            auth: { bearer: yield oauthToken() },
            body: body,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.NO_CONTENT)
            errorHandler(body, response);
        log('ownersAnonymous result:');
    });
}
exports.ownersAnonymous = ownersAnonymous;
/**
 * 照会情報登録(購入番号と電話番号で照会する場合)
 * @memberOf MP
 * @function transactionsEnableInquiry
 * @param {ITransactionsEnableInquiryArgs} args
 * @returns {Promise<void>}
 */
function transactionsEnableInquiry(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = {
            inquiry_theater: args.inquiry_theater,
            inquiry_id: args.inquiry_id,
            inquiry_pass: args.inquiry_pass
        };
        const response = yield request.patch({
            url: `${endPoint}/transactions/${args.transactionId}/enableInquiry`,
            auth: { bearer: yield oauthToken() },
            body: body,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.NO_CONTENT)
            errorHandler(body, response);
        log('transactionsEnableInquiry result:');
    });
}
exports.transactionsEnableInquiry = transactionsEnableInquiry;
/**
 * 取引成立
 * @memberOf MP
 * @function transactionClose
 * @param {ITransactionCloseArgs} args
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
            timeout: timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.NO_CONTENT)
            errorHandler({}, response);
        log('close result:');
    });
}
exports.transactionClose = transactionClose;
/**
 * メール追加
 * @memberOf MP
 * @function addEmail
 * @param {IAddEmailArgs} args
 * @returns {Promise<string>}
 */
function addEmail(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = {
            from: args.from,
            to: args.to,
            subject: args.subject,
            content: args.content
        };
        const response = yield request.post({
            url: `${endPoint}/transactions/${args.transactionId}/notifications/email`,
            auth: { bearer: yield oauthToken() },
            body: body,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.OK)
            errorHandler(body, response);
        log('addEmail result:' + response.body.data);
        return response.body.data.id;
    });
}
exports.addEmail = addEmail;
/**
 * メール削除
 * @memberOf MP
 * @function removeEmail
 * @param {IRemoveEmailArgs} args
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
            timeout: timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.NO_CONTENT)
            errorHandler({}, response);
        log('removeEmail result:');
    });
}
exports.removeEmail = removeEmail;
/**
 * 照会取引情報取得
 * @memberOf MP
 * @function makeInquiry
 * @param {IMakeInquiryArgs} args
 * @returns {Promise<string | null>}
 */
function makeInquiry(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = {
            inquiry_theater: args.inquiry_theater,
            inquiry_id: args.inquiry_id,
            inquiry_pass: args.inquiry_pass
        };
        const response = yield request.post({
            url: `${endPoint}/transactions/makeInquiry`,
            auth: { bearer: yield oauthToken() },
            body: body,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: timeout
        }).promise();
        if (response.statusCode === HTTPStatus.NOT_FOUND)
            return null;
        if (response.statusCode !== HTTPStatus.OK)
            errorHandler(body, response);
        log('makeInquiry result:' + response.body.data);
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
 * @returns {Promise<ICOAPerformance>}
 */
function getPerformanceCOA(theaterId, screenId, filmId) {
    return __awaiter(this, void 0, void 0, function* () {
        log('getPerformanceCOA args:', theaterId, screenId, filmId);
        const theater = yield getTheater(theaterId);
        log('劇場取得');
        const screen = yield getScreen(screenId);
        log('スクリーン取得');
        const film = yield getFilm(filmId);
        log('作品取得');
        return {
            theaterCode: theater.id,
            screenCode: screen.attributes.coa_screen_code,
            titleCode: film.attributes.coa_title_code,
            titleBranchNum: film.attributes.coa_title_branch_num,
            flgMvtkUse: film.attributes.flg_mvtk_use,
            dateMvtkBegin: film.attributes.date_mvtk_begin,
            kbnJoueihousiki: film.attributes.kbn_joueihousiki
        };
    });
}
exports.getPerformanceCOA = getPerformanceCOA;
/**
 * 照会取引情報取得
 * @memberOf MP
 * @function addMvtkauthorization
 * @param {IMakeInquiryArgs} args
 * @returns {Promise<void>}
 */
function addMvtkauthorization(args) {
    return __awaiter(this, void 0, void 0, function* () {
        log('addMvtkauthorization args:', args);
        const promoterOwner = args.transaction.attributes.owners.find((owner) => {
            return (owner.group === 'PROMOTER');
        });
        const promoterOwnerId = (promoterOwner !== undefined) ? promoterOwner.id : null;
        const anonymousOwner = args.transaction.attributes.owners.find((owner) => {
            return (owner.group === 'ANONYMOUS');
        });
        const anonymousOwnerId = (anonymousOwner !== undefined) ? anonymousOwner.id : null;
        const body = {
            owner_from: anonymousOwnerId,
            owner_to: promoterOwnerId,
            price: args.amount,
            kgygish_cd: args.kgygishCd,
            yyk_dvc_typ: args.yykDvcTyp,
            trksh_flg: args.trkshFlg,
            kgygish_sstm_zskyyk_no: args.kgygishSstmZskyykNo,
            kgygish_usr_zskyyk_no: args.kgygishUsrZskyykNo,
            jei_dt: args.jeiDt,
            kij_ymd: args.kijYmd,
            st_cd: args.stCd,
            scren_cd: args.screnCd,
            knyknr_no_info: args.knyknrNoInfo.map((purchaseNoInfo) => {
                return {
                    knyknr_no: purchaseNoInfo.KNYKNR_NO,
                    pin_cd: purchaseNoInfo.PIN_CD,
                    knsh_info: purchaseNoInfo.KNSH_INFO.map((ticketInfo) => {
                        return { knsh_typ: ticketInfo.KNSH_TYP, mi_num: ticketInfo.MI_NUM };
                    })
                };
            }),
            zsk_info: args.zskInfo.map((seat) => {
                return { zsk_cd: seat.ZSK_CD };
            }),
            skhn_cd: args.screnCd
        };
        const response = yield request.post({
            url: `${endPoint}/transactions/${args.transaction.id}/authorizations/mvtk`,
            auth: { bearer: yield oauthToken() },
            body: body,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.OK)
            errorHandler(body, response);
        log('addMvtkauthorization result:');
        return response.body.data;
    });
}
exports.addMvtkauthorization = addMvtkauthorization;
/**
 * ムビチケオーソリ削除
 * @memberOf MP
 * @function removeCOAAuthorization
 * @param {IRemoveMvtkAuthorizationArgs} args
 * @requires {Promise<void>}
 */
function removeMvtkAuthorization(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield request.del({
            url: `${endPoint}/transactions/${args.transactionId}/authorizations/${args.mvtkAuthorizationId}`,
            auth: { bearer: yield oauthToken() },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.NO_CONTENT)
            errorHandler({}, response);
        log('removeMvtkAuthorization result');
    });
}
exports.removeMvtkAuthorization = removeMvtkAuthorization;
