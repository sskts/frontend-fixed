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
const util = require("../utils/util");
const log = debug('SSKTS:services.transaction');
/**
 * 取引状態
 * @memberof services.transaction
 * @enum TransactionStatus
 */
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["Underway"] = "UNDERWAY";
    TransactionStatus["Closed"] = "CLOSED";
    TransactionStatus["Expired"] = "EXPIRED";
})(TransactionStatus = exports.TransactionStatus || (exports.TransactionStatus = {}));
/**
 * 取引開始
 * @memberof services.transaction
 * @desc 取引を開始します。
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
            url: `${util.ENDPOINT}/transactions/startIfPossible`,
            auth: { bearer: args.accessToken },
            body: body,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.TIMEOUT
        }).promise();
        log('--------------------transaction:', response.body);
        if (response.statusCode !== HTTPStatus.OK)
            util.errorHandler(body, response);
        log('transaction:', response.body.data);
        return response.body.data;
    });
}
exports.transactionStart = transactionStart;
/**
 * 照会取引情報取得
 * @desc 照会キーで取引を検索します。具体的には、劇場コード&予約番号&電話番号による照会です。
 * @memberof services.transaction
 * @function findByInquiryKey
 * @param {IMakeInquiryArgs} args
 * @returns {Promise<IFindByInquiryKeyResult | null>}
 */
function findByInquiryKey(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            theater_code: args.theaterCode,
            reserve_num: args.reserveNum,
            tel: args.tel
        };
        const response = yield request.get({
            url: `${util.ENDPOINT}/transactions/findByInquiryKey`,
            auth: { bearer: args.accessToken },
            qs: query,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.TIMEOUT
        }).promise();
        if (response.statusCode === HTTPStatus.NOT_FOUND)
            return null;
        if (response.statusCode !== HTTPStatus.OK)
            util.errorHandler(query, response);
        log(`findByInquiryKey result: ${response.body.data}`);
        return response.body.data;
    });
}
exports.findByInquiryKey = findByInquiryKey;
/**
 * 照会取引情報取得
 * @deprecated findByInquiryKeyへ変更予定
 * @desc 照会キーで取引を検索します。具体的には、劇場コード&予約番号&電話番号による照会です。
 * @memberof services.transaction
 * @function makeInquiry
 * @param {IMakeInquiryArgs} args
 * @returns {Promise<IMakeInquiryResult | null>}
 */
function makeInquiry(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = {
            inquiry_theater: args.inquiryTheater,
            inquiry_id: args.inquiryId,
            inquiry_pass: args.inquiryPass
        };
        const response = yield request.post({
            url: `${util.ENDPOINT}/transactions/makeInquiry`,
            auth: { bearer: args.accessToken },
            body: body,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.TIMEOUT
        }).promise();
        log('response.statusCode:', response.statusCode);
        if (response.statusCode === HTTPStatus.NOT_FOUND)
            return null;
        if (response.statusCode !== HTTPStatus.OK)
            util.errorHandler(body, response);
        log('makeInquiry result:', response.body.data);
        return response.body.data;
    });
}
exports.makeInquiry = makeInquiry;
/**
 * 取引中所有者更新
 * @deprecated updateOwnersへ変更予定
 * @desc 取引中の匿名所有者のプロフィールを更新します。
 * @memberof services.transaction
 * @function ownersAnonymous
 * @param {IOwnersAnonymousArgs} args
 * @returns {Promise<void>}
 */
function ownersAnonymous(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = {
            name_first: args.nameFirst,
            name_last: args.nameLast,
            tel: args.tel,
            email: args.email
        };
        const response = yield request.patch({
            url: `${util.ENDPOINT}/transactions/${args.transactionId}/anonymousOwner`,
            auth: { bearer: args.accessToken },
            body: body,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.TIMEOUT
        }).promise();
        if (response.statusCode !== HTTPStatus.NO_CONTENT)
            util.errorHandler(body, response);
        log('ownersAnonymous result:');
    });
}
exports.ownersAnonymous = ownersAnonymous;
/**
 * 所有者グループ
 * @memberof services.transaction
 * @enum OwnersGroup
 */
var OwnersGroup;
(function (OwnersGroup) {
    /**
     * プロモーター
     */
    OwnersGroup["Promoter"] = "PROMOTER";
    /**
     * 匿名
     */
    OwnersGroup["Anonyamous"] = "ANONYMOUS";
    /**
     * 会員
     */
    OwnersGroup["Member"] = "MEMBER";
})(OwnersGroup = exports.OwnersGroup || (exports.OwnersGroup = {}));
/**
 * 取引中所有者更新
 * @desc 取引中の匿名所有者のプロフィールを更新します。
 * @memberof services.transaction
 * @function updateOwners
 * @param {IUpdateOwnersArgs} args
 * @returns {Promise<IUpdateOwnersResult>}
 */
function updateOwners(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = {
            data: {
                type: 'owners',
                id: args.ownerId,
                attributes: {
                    name_first: args.nameFirst,
                    name_last: args.nameLast,
                    tel: args.tel,
                    email: args.email,
                    group: args.group,
                    username: args.username,
                    password: args.password
                }
            }
        };
        const response = yield request.put({
            url: `${util.ENDPOINT}/transactions/${args.transactionId}/owners/${args.ownerId}`,
            auth: { bearer: args.accessToken },
            body: body,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.TIMEOUT
        }).promise();
        if (response.statusCode !== HTTPStatus.OK)
            util.errorHandler(body, response);
        log('ownersAnonymous result:', response.body.data);
        return response.body.data;
    });
}
exports.updateOwners = updateOwners;
/**
 * 取引中所有者カード追加
 * @desc 取引中の所有者のカードを作成します。
 * @memberof services.transaction
 * @function addOwnersCard
 * @param {IAddOwnersCardArgs} args
 * @returns {Promise<IAddOwnersCardResult>}
 */
function addOwnersCard(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = {
            data: {
                type: 'cards',
                attributes: {
                    card_no: args.cardNo,
                    card_pass: args.cardPass,
                    expire: args.expire,
                    holder_name: args.holderName,
                    token: args.token
                }
            }
        };
        const response = yield request.put({
            url: `${util.ENDPOINT}/transactions/${args.transactionId}/owners/${args.ownerId}/cards`,
            auth: { bearer: args.accessToken },
            body: body,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.TIMEOUT
        }).promise();
        if (response.statusCode !== HTTPStatus.CREATED)
            util.errorHandler(body, response);
        log('addOwnersCard result:', response.body.data);
        return response.body.data;
    });
}
exports.addOwnersCard = addOwnersCard;
/**
 * GMOオーソリ追加
 * @memberof services.transaction
 * @function addGMOAuthorization
 * @param {IAddGMOAuthorizationArgs} args
 * @returns {Promise<IAddGMOAuthorizationResult>}
 */
function addGMOAuthorization(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const promoterOwner = args.transaction.attributes.owners.find((owner) => {
            return (owner.group === OwnersGroup.Promoter);
        });
        const promoterOwnerId = (promoterOwner !== undefined) ? promoterOwner.id : null;
        const anonymousOwner = args.transaction.attributes.owners.find((owner) => {
            return (owner.group === OwnersGroup.Anonyamous || owner.group === OwnersGroup.Member);
        });
        const anonymousOwnerId = (anonymousOwner !== undefined) ? anonymousOwner.id : null;
        const body = {
            data: {
                type: 'authorizations',
                attributes: {
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
                }
            }
        };
        const response = yield request.post({
            url: `${util.ENDPOINT}/transactions/${args.transaction.id}/authorizations/gmo`,
            auth: { bearer: args.accessToken },
            body: body,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.TIMEOUT
        }).promise();
        if (response.statusCode !== HTTPStatus.OK)
            util.errorHandler(body, response);
        log('addGMOAuthorization result:');
        return response.body.data;
    });
}
exports.addGMOAuthorization = addGMOAuthorization;
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
            return (owner.group === OwnersGroup.Promoter);
        });
        const promoterOwnerId = (promoterOwner !== undefined) ? promoterOwner.id : null;
        const anonymousOwner = args.transaction.attributes.owners.find((owner) => {
            return (owner.group === OwnersGroup.Anonyamous || owner.group === OwnersGroup.Member);
        });
        const anonymousOwnerId = (anonymousOwner !== undefined) ? anonymousOwner.id : null;
        const body = {
            data: {
                type: 'authorizations',
                attributes: {
                    owner_from: promoterOwnerId,
                    owner_to: anonymousOwnerId,
                    coa_tmp_reserve_num: args.reserveSeatsTemporarilyResult.tmpReserveNum,
                    coa_theater_code: args.theaterCode,
                    coa_date_jouei: args.performance.attributes.day,
                    coa_title_code: args.titleCode,
                    coa_title_branch_num: args.titleBranchNum,
                    coa_time_begin: args.performance.attributes.timeStart,
                    coa_screen_code: args.screenCode,
                    seats: args.salesTicketResults.map((tmpReserve) => {
                        return {
                            performance: args.performance.id,
                            screen_section: tmpReserve.section,
                            seat_code: tmpReserve.seatCode,
                            ticket_code: tmpReserve.ticketCode,
                            ticket_name: {
                                ja: tmpReserve.ticketName,
                                en: tmpReserve.ticketNameEng
                            },
                            ticket_name_kana: tmpReserve.ticketNameKana,
                            std_price: tmpReserve.stdPrice,
                            add_price: tmpReserve.addPrice,
                            dis_price: tmpReserve.disPrice,
                            sale_price: tmpReserve.salePrice,
                            mvtk_app_price: tmpReserve.mvtkAppPrice,
                            add_glasses: tmpReserve.addPriceGlasses,
                            kbn_eisyahousiki: tmpReserve.kbnEisyahousiki,
                            mvtk_num: tmpReserve.mvtkNum,
                            mvtk_kbn_denshiken: tmpReserve.mvtkKbnDenshiken,
                            mvtk_kbn_maeuriken: tmpReserve.mvtkKbnMaeuriken,
                            mvtk_kbn_kensyu: tmpReserve.mvtkKbnKensyu,
                            mvtk_sales_price: tmpReserve.mvtkSalesPrice
                        };
                    }),
                    price: args.price
                }
            }
        };
        const response = yield request.post({
            url: `${util.ENDPOINT}/transactions/${args.transaction.id}/authorizations/coaSeatReservation`,
            auth: { bearer: args.accessToken },
            body: body,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.TIMEOUT
        }).promise();
        if (response.statusCode !== HTTPStatus.OK)
            util.errorHandler(body, response);
        log('addCOAAuthorization result');
        return response.body.data;
    });
}
exports.addCOAAuthorization = addCOAAuthorization;
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
            return (owner.group === OwnersGroup.Promoter);
        });
        const promoterOwnerId = (promoterOwner !== undefined) ? promoterOwner.id : null;
        const anonymousOwner = args.transaction.attributes.owners.find((owner) => {
            return (owner.group === OwnersGroup.Anonyamous || owner.group === OwnersGroup.Member);
        });
        const anonymousOwnerId = (anonymousOwner !== undefined) ? anonymousOwner.id : null;
        const body = {
            data: {
                type: 'authorizations',
                attributes: {
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
                }
            }
        };
        const response = yield request.post({
            url: `${util.ENDPOINT}/transactions/${args.transaction.id}/authorizations/mvtk`,
            auth: { bearer: args.accessToken },
            body: body,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.TIMEOUT
        }).promise();
        if (response.statusCode !== HTTPStatus.OK)
            util.errorHandler(body, response);
        log('addMvtkauthorization result:');
        return response.body.data;
    });
}
exports.addMvtkauthorization = addMvtkauthorization;
/**
 * 承認解除
 * @desc 進行中の取引から承認を解除します。
 * @memberof services.transaction
 * @function removeAuthorization
 * @param {IRemoveAuthorizationArgs} args
 * @returns {Promise<void>}
 */
function removeAuthorization(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield request.delete({
            url: `${util.ENDPOINT}/transactions/${args.transactionId}/authorizations/${args.authorizationId}`,
            auth: { bearer: args.accessToken },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.TIMEOUT
        }).promise();
        if (response.statusCode !== HTTPStatus.NO_CONTENT)
            util.errorHandler({}, response);
        log('removeAuthorization result:');
    });
}
exports.removeAuthorization = removeAuthorization;
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
            data: {
                theater_code: args.theaterCode,
                reserve_num: args.reserveNum,
                tel: args.tel
            }
        };
        const response = yield request.put({
            url: `${util.ENDPOINT}/transactions/${args.transactionId}/inquiryKey`,
            auth: { bearer: args.accessToken },
            body: body,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.TIMEOUT
        }).promise();
        if (response.statusCode !== HTTPStatus.NO_CONTENT)
            util.errorHandler(body, response);
        log('transactionsEnableInquiry result:');
    });
}
exports.transactionsInquiryKey = transactionsInquiryKey;
/**
 * 照会情報登録(購入番号と電話番号で照会する場合)
 * @deprecated transactionsInquiryKeyへ変更予定
 * @memberof services.transaction
 * @function transactionsEnableInquiry
 * @param {ITransactionsInquiryKeyArgs} args
 * @returns {Promise<void>}
 */
function transactionsEnableInquiry(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = {
            inquiry_theater: args.inquiryTheater,
            inquiry_id: args.inquiryId,
            inquiry_pass: args.inquiryPass
        };
        const response = yield request.patch({
            url: `${util.ENDPOINT}/transactions/${args.transactionId}/enableInquiry`,
            auth: { bearer: args.accessToken },
            body: body,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.TIMEOUT
        }).promise();
        if (response.statusCode !== HTTPStatus.NO_CONTENT)
            util.errorHandler(body, response);
        log('transactionsEnableInquiry result:');
    });
}
exports.transactionsEnableInquiry = transactionsEnableInquiry;
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
            data: {
                type: 'notifications',
                attributes: {
                    from: args.from,
                    to: args.to,
                    subject: args.subject,
                    content: args.content
                }
            }
        };
        const response = yield request.post({
            url: `${util.ENDPOINT}/transactions/${args.transactionId}/notifications/email`,
            auth: { bearer: args.accessToken },
            body: body,
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.TIMEOUT
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
            url: `${util.ENDPOINT}/transactions/${args.transactionId}/notifications/${args.emailId}`,
            auth: { bearer: args.accessToken },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.TIMEOUT
        }).promise();
        if (response.statusCode !== HTTPStatus.NO_CONTENT)
            util.errorHandler({}, response);
        log('removeEmail result:');
    });
}
exports.removeEmail = removeEmail;
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
            url: `${util.ENDPOINT}/transactions/${args.transactionId}/close`,
            auth: { bearer: args.accessToken },
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            timeout: util.TIMEOUT
        }).promise();
        if (response.statusCode !== HTTPStatus.NO_CONTENT)
            util.errorHandler({}, response);
        log('close result:');
    });
}
exports.transactionClose = transactionClose;
