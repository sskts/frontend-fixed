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
const oauth = require("../services/oauth");
const util = require("../utils/util");
const log = debug('SSKTS:services.theater');
/**
 * 取引開始
 * @memberof services.transaction
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
            url: `${util.endPoint}/transactions/startIfPossible`,
            auth: { bearer: yield oauth.oauthToken() },
            body: body,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.timeout
        }).promise();
        log('--------------------transaction:', response.body);
        if (response.statusCode !== HTTPStatus.OK)
            util.errorHandler(body, response);
        const transaction = response.body.data;
        log('transaction:', transaction);
        return transaction;
    });
}
exports.transactionStart = transactionStart;
/**
 * COAオーソリ追加
 * @memberof services.transaction
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
            coa_theater_code: args.theaterCode,
            coa_date_jouei: args.performance.attributes.day,
            coa_title_code: args.titleCode,
            coa_title_branch_num: args.titleBranchNum,
            coa_time_begin: args.performance.attributes.time_start,
            coa_screen_code: args.screenCode,
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
            url: `${util.endPoint}/transactions/${args.transaction.id}/authorizations/coaSeatReservation`,
            auth: { bearer: yield oauth.oauthToken() },
            body: body,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.OK)
            util.errorHandler(body, response);
        log('addCOAAuthorization result');
        return response.body.data;
    });
}
exports.addCOAAuthorization = addCOAAuthorization;
/**
 * COAオーソリ削除
 * @memberof services.transaction
 * @function removeCOAAuthorization
 * @param {IRemoveCOAAuthorizationArgs} args
 * @requires {Promise<void>}
 */
function removeCOAAuthorization(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield request.del({
            url: `${util.endPoint}/transactions/${args.transactionId}/authorizations/${args.coaAuthorizationId}`,
            auth: { bearer: yield oauth.oauthToken() },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.NO_CONTENT)
            util.errorHandler({}, response);
        log('removeCOAAuthorization result');
    });
}
exports.removeCOAAuthorization = removeCOAAuthorization;
/**
 * GMOオーソリ追加
 * @memberof services.transaction
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
            url: `${util.endPoint}/transactions/${args.transaction.id}/authorizations/gmo`,
            auth: { bearer: yield oauth.oauthToken() },
            body: body,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.OK)
            util.errorHandler(body, response);
        log('addGMOAuthorization result:');
        return response.body.data;
    });
}
exports.addGMOAuthorization = addGMOAuthorization;
/**
 * GMOオーソリ削除
 * @memberof services.transaction
 * @function removeGMOAuthorization
 * @param {IRemoveGMOAuthorizationArgs} args
 * @returns {Promise<void>}
 */
function removeGMOAuthorization(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield request.del({
            url: `${util.endPoint}/transactions/${args.transactionId}/authorizations/${args.gmoAuthorizationId}`,
            auth: { bearer: yield oauth.oauthToken() },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.NO_CONTENT)
            util.errorHandler({}, response);
        log('removeGMOAuthorization result:');
    });
}
exports.removeGMOAuthorization = removeGMOAuthorization;
/**
 * 取引中所有者更新
 * @desc 取引中の匿名所有者のプロフィールを更新します。
 * @memberof services.transaction
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
            url: `${util.endPoint}/transactions/${args.transactionId}/anonymousOwner`,
            auth: { bearer: yield oauth.oauthToken() },
            body: body,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.NO_CONTENT)
            util.errorHandler(body, response);
        log('ownersAnonymous result:');
    });
}
exports.ownersAnonymous = ownersAnonymous;
/**
 * 照会情報登録(購入番号と電話番号で照会する場合)
 * @memberof services.transaction
 * @function transactionsEnableInquiry
 * @param {ITransactionsInquiryKeyArgs} args
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
            url: `${util.endPoint}/transactions/${args.transactionId}/enableInquiry`,
            auth: { bearer: yield oauth.oauthToken() },
            body: body,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.NO_CONTENT)
            util.errorHandler(body, response);
        log('transactionsEnableInquiry result:');
    });
}
exports.transactionsEnableInquiry = transactionsEnableInquiry;
/**
 * 照会情報登録(購入番号と電話番号で照会する場合)
 * @memberof services.transaction
 * @function transactionsEnableInquiry
 * @param {ITransactionsInquiryKeyArgs} args
 * @returns {Promise<void>}
 */
function transactionsInquiryKey(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = {
            theater_code: args.theater_code,
            reserve_num: args.reserve_num,
            tel: args.tel
        };
        const response = yield request.put({
            url: `${util.endPoint}/transactions/${args.transactionId}/inquiryKey`,
            auth: { bearer: yield oauth.oauthToken() },
            body: body,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.NO_CONTENT)
            util.errorHandler(body, response);
        log('transactionsEnableInquiry result:');
    });
}
exports.transactionsInquiryKey = transactionsInquiryKey;
/**
 * 取引成立
 * @memberof services.transaction
 * @function transactionClose
 * @param {ITransactionCloseArgs} args
 * @returns {Promise<void>}
 */
function transactionClose(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield request.patch({
            url: `${util.endPoint}/transactions/${args.transactionId}/close`,
            auth: { bearer: yield oauth.oauthToken() },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.NO_CONTENT)
            util.errorHandler({}, response);
        log('close result:');
    });
}
exports.transactionClose = transactionClose;
/**
 * メール追加
 * @memberof services.transaction
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
            url: `${util.endPoint}/transactions/${args.transactionId}/notifications/email`,
            auth: { bearer: yield oauth.oauthToken() },
            body: body,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.OK)
            util.errorHandler(body, response);
        log(`addEmail result: ${response.body.data}`);
        return response.body.data.id;
    });
}
exports.addEmail = addEmail;
/**
 * メール削除
 * @memberof services.transaction
 * @function removeEmail
 * @param {IRemoveEmailArgs} args
 * @returns {Promise<void>}
 */
function removeEmail(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield request.del({
            url: `${util.endPoint}/transactions/${args.transactionId}/notifications/${args.emailId}`,
            auth: { bearer: yield oauth.oauthToken() },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.NO_CONTENT)
            util.errorHandler({}, response);
        log('removeEmail result:');
    });
}
exports.removeEmail = removeEmail;
/**
 * 照会取引情報取得
 * @desc 照会キーで取引を検索します。具体的には、劇場コード&予約番号&電話番号による照会です。
 * @memberof services.transaction
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
            url: `${util.endPoint}/transactions/makeInquiry`,
            auth: { bearer: yield oauth.oauthToken() },
            body: body,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.timeout
        }).promise();
        if (response.statusCode === HTTPStatus.NOT_FOUND)
            return null;
        if (response.statusCode !== HTTPStatus.OK)
            util.errorHandler(body, response);
        log(`makeInquiry result: ${response.body.data}`);
        return response.body.data.id;
    });
}
exports.makeInquiry = makeInquiry;
/**
 * 照会取引情報取得
 * @desc 照会キーで取引を検索します。具体的には、劇場コード&予約番号&電話番号による照会です。
 * @memberof services.transaction
 * @function findByInquiryKey
 * @param {IMakeInquiryArgs} args
 * @returns {Promise<string | null>}
 */
function findByInquiryKey(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            theater_code: args.theater_code,
            reserve_num: args.reserve_num,
            tel: args.tel
        };
        const response = yield request.get({
            url: `${util.endPoint}/transactions/findByInquiryKey`,
            auth: { bearer: yield oauth.oauthToken() },
            qs: query,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.timeout
        }).promise();
        if (response.statusCode === HTTPStatus.NOT_FOUND)
            return null;
        if (response.statusCode !== HTTPStatus.OK)
            util.errorHandler(query, response);
        log(`makeInquiry result: ${response.body.data}`);
        return response.body.data.id;
    });
}
exports.findByInquiryKey = findByInquiryKey;
/**
 * 照会取引情報取得
 * @memberof services.transaction
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
            url: `${util.endPoint}/transactions/${args.transaction.id}/authorizations/mvtk`,
            auth: { bearer: yield oauth.oauthToken() },
            body: body,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.OK)
            util.errorHandler(body, response);
        log('addMvtkauthorization result:');
        return response.body.data;
    });
}
exports.addMvtkauthorization = addMvtkauthorization;
/**
 * ムビチケオーソリ削除
 * @memberof services.transaction
 * @function removeCOAAuthorization
 * @param {IRemoveMvtkAuthorizationArgs} args
 * @requires {Promise<void>}
 */
function removeMvtkAuthorization(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield request.del({
            url: `${util.endPoint}/transactions/${args.transactionId}/authorizations/${args.mvtkAuthorizationId}`,
            auth: { bearer: yield oauth.oauthToken() },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.timeout
        }).promise();
        if (response.statusCode !== HTTPStatus.NO_CONTENT)
            util.errorHandler({}, response);
        log('removeMvtkAuthorization result');
    });
}
exports.removeMvtkAuthorization = removeMvtkAuthorization;
