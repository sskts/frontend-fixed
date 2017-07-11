import * as COA from '@motionpicture/coa-service';
import * as GMO from '@motionpicture/gmo-service';
import * as debug from 'debug';
import * as HTTPStatus from 'http-status';
import * as request from 'request-promise-native';
import * as performance from '../services/performance';
import * as util from '../utils/util';

const log = debug('SSKTS:services.transaction');

/**
 * 取引開始in
 * @memberof services.transaction
 * @interface ITransactionStartArgs
 * @extends util.IAuth
 */
export interface ITransactionStartArgs extends util.IAuth {
    expires_at: number;
}
/**
 * 取引開始out
 * @memberof services.transaction
 * @interface ITransactionStartResult
 */
export interface ITransactionStartResult {
    // tslint:disable-next-line:no-reserved-keywords
    type: string;
    id: string;
    attributes: {
        id: string,
        status: string,
        events: any[],
        owners: {
            id: string;
            group: string;
        }[],
        queues: any[],
        expired_at: string,
        inquiry_id: string,
        inquiry_pass: string,
        queues_status: string
    };
}

/**
 * 取引開始
 * @memberof services.transaction
 * @desc 取引を開始します。
 * @function transactionStart
 * @param {TransactionStartArgs} args
 * @returns {Promise<ITransactionStartResult>}
 */
export async function transactionStart(args: ITransactionStartArgs): Promise<ITransactionStartResult> {
    const body = {
        expires_at: args.expires_at
    };
    const response = await request.post({
        url: `${util.endPoint}/transactions/startIfPossible`,
        auth: { bearer: args.accessToken },
        body: body,
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.timeout
    }).promise();
    log('--------------------transaction:', response.body);
    if (response.statusCode !== HTTPStatus.OK) util.errorHandler(body, response);
    const transaction = response.body.data;
    log('transaction:', transaction);

    return transaction;
}

/**
 * COAオーソリ追加in
 * @memberof services.transaction
 * @interface IAddCOAAuthorizationArgs
 * @extends util.IAuth
 */
export interface IAddCOAAuthorizationArgs extends util.IAuth {
    transaction: ITransactionStartResult;
    reserveSeatsTemporarilyResult: COA.services.reserve.IUpdTmpReserveSeatResult;
    salesTicketResults: IReserveTicket[];
    performance: performance.IPerformance;
    theaterCode: string;
    titleCode: string;
    titleBranchNum: string;
    screenCode: string;
    price: number;
}

/**
 * 予約チケット情報
 * @interface IReserveTicket
 */
export interface IReserveTicket {
    /**
     * 座席セクション
     */
    section: string;
    /**
     * 座席番号
     */
    seat_code: string;
    /**
     * チケットコード
     */
    ticket_code: string;
    /**
     * チケット名
     */
    ticket_name: string;
    /**
     * チケット名（英）
     */
    ticket_name_eng: string;
    /**
     * チケット名（カナ）
     */
    ticket_name_kana: string;
    /**
     * 標準単価
     */
    std_price: number;
    /**
     * 加算単価(３Ｄ，ＩＭＡＸ、４ＤＸ等の加算料金)
     */
    add_price: number;
    /**
     * 割引額
     */
    dis_price: number;
    /**
     * 販売単価(標準単価＋加算単価)
     */
    sale_price: number;
    /**
     * メガネ単価
     */
    add_price_glasses: number;
    /**
     * メガネ有り無し(現状ムビチケ)
     */
    glasses: boolean;
    /**
     * ムビチケ購入番号
     */
    mvtk_num: string;
    /**
     * ムビチケ計上単価
     */
    mvtk_app_price: number;
    /**
     * ムビチケ映写方式区分
     */
    kbn_eisyahousiki: string;
    /**
     * ムビチケ電子券区分
     */
    mvtk_kbn_denshiken: string;
    /**
     * ムビチケ前売券区分
     */
    mvtk_kbn_maeuriken: string;
    /**
     * ムビチケ券種区分
     */
    mvtk_kbn_kensyu: string;
    /**
     * ムビチケ販売単価
     */
    mvtk_sales_price: number;
}

/**
 * COAオーソリ追加out
 * @memberof services.transaction
 * @interface IAddCOAAuthorizationResult
 */
export interface IAddCOAAuthorizationResult {
    // tslint:disable-next-line:no-reserved-keywords
    type: string;
    id: string;
}
/**
 * COAオーソリ追加
 * @memberof services.transaction
 * @function addCOAAuthorization
 * @param {IAddCOAAuthorizationArgs} args
 * @returns {Promise<IAddCOAAuthorizationResult>}
 */
export async function addCOAAuthorization(args: IAddCOAAuthorizationArgs): Promise<IAddCOAAuthorizationResult> {
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
                performance: args.performance.id, // パフォーマンスID
                screen_section: tmpReserve.section, // 座席セクション
                seat_code: tmpReserve.seat_code, // 座席番号
                ticket_code: tmpReserve.ticket_code, // チケットコード
                ticket_name: {
                    ja: tmpReserve.ticket_name, // チケット名
                    en: tmpReserve.ticket_name_eng // チケット名（英）
                },
                ticket_name_kana: tmpReserve.ticket_name_kana, // チケット名（カナ）
                std_price: tmpReserve.std_price, // 標準単価
                add_price: tmpReserve.add_price, // 加算単価(３Ｄ，ＩＭＡＸ、４ＤＸ等の加算料金)
                dis_price: tmpReserve.dis_price, // 割引額
                sale_price: tmpReserve.sale_price, // 販売単価(標準単価＋加算単価)
                mvtk_app_price: tmpReserve.mvtk_app_price, // ムビチケ計上単価
                add_glasses: tmpReserve.add_price_glasses, // メガネ単価
                kbn_eisyahousiki: tmpReserve.kbn_eisyahousiki, // ムビチケ映写方式区分
                mvtk_num: tmpReserve.mvtk_num, // ムビチケ購入管理番号
                mvtk_kbn_denshiken: tmpReserve.mvtk_kbn_denshiken, // ムビチケ電子券区分
                mvtk_kbn_maeuriken: tmpReserve.mvtk_kbn_maeuriken, // ムビチケ前売券区分
                mvtk_kbn_kensyu: tmpReserve.mvtk_kbn_kensyu, // ムビチケ券種区分
                mvtk_sales_price: tmpReserve.mvtk_sales_price // ムビチケ販売単価
            };
        }),
        price: args.price
    };

    const response = await request.post({
        url: `${util.endPoint}/transactions/${args.transaction.id}/authorizations/coaSeatReservation`,
        auth: { bearer: args.accessToken },
        body: body,
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.OK) util.errorHandler(body, response);

    log('addCOAAuthorization result');

    return response.body.data;
}

/**
 * COAオーソリ削除in
 * @memberof services.transaction
 * @interface IRemoveCOAAuthorizationArgs
 * @extends util.IAuth
 */
export interface IRemoveCOAAuthorizationArgs extends util.IAuth {
    transactionId: string;
    coaAuthorizationId: string;
}
/**
 * COAオーソリ削除
 * @memberof services.transaction
 * @function removeCOAAuthorization
 * @param {IRemoveCOAAuthorizationArgs} args
 * @requires {Promise<void>}
 */
export async function removeCOAAuthorization(args: IRemoveCOAAuthorizationArgs): Promise<void> {
    const response = await request.del({
        url: `${util.endPoint}/transactions/${args.transactionId}/authorizations/${args.coaAuthorizationId}`,
        auth: { bearer: args.accessToken },
        body: {},
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.NO_CONTENT) util.errorHandler({}, response);

    log('removeCOAAuthorization result');
}

/**
 * GMOオーソリ追加in
 * @memberof services.transaction
 * @interface AddGMOAuthorizationArgs
 * @extends util.IAuth
 */
export interface IAddGMOAuthorizationArgs extends util.IAuth {
    transaction: ITransactionStartResult;
    orderId: string;
    amount: number;
    entryTranResult: GMO.CreditService.EntryTranResult;
    gmoShopId: string;
    gmoShopPassword: string;
}
/**
 * GMOオーソリ追加out
 * @memberof services.transaction
 * @interface IAddGMOAuthorizationResult
 */
export interface IAddGMOAuthorizationResult {
    // tslint:disable-next-line:no-reserved-keywords
    type: string;
    id: string;
}
/**
 * GMOオーソリ追加
 * @memberof services.transaction
 * @function addGMOAuthorization
 * @param {IAddGMOAuthorizationArgs} args
 * @requires {Promise<IAddGMOAuthorizationResult>}
 */
export async function addGMOAuthorization(args: IAddGMOAuthorizationArgs): Promise<IAddGMOAuthorizationResult> {
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
    const response = await request.post({
        url: `${util.endPoint}/transactions/${args.transaction.id}/authorizations/gmo`,
        auth: { bearer: args.accessToken },
        body: body,
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.OK) util.errorHandler(body, response);

    log('addGMOAuthorization result:');

    return response.body.data;
}

/**
 * GMOオーソリ削除in
 * @memberof services.transaction
 * @interface IRemoveGMOAuthorizationArgs
 * @extends util.IAuth
 */
export interface IRemoveGMOAuthorizationArgs extends util.IAuth {
    transactionId: string;
    gmoAuthorizationId: string;
}
/**
 * GMOオーソリ削除
 * @memberof services.transaction
 * @function removeGMOAuthorization
 * @param {IRemoveGMOAuthorizationArgs} args
 * @returns {Promise<void>}
 */
export async function removeGMOAuthorization(args: IRemoveGMOAuthorizationArgs): Promise<void> {
    const response = await request.del({
        url: `${util.endPoint}/transactions/${args.transactionId}/authorizations/${args.gmoAuthorizationId}`,
        auth: { bearer: args.accessToken },
        body: {},
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.NO_CONTENT) util.errorHandler({}, response);

    log('removeGMOAuthorization result:');
}

/**
 * 購入者情報登録in
 * @memberof services.transaction
 * @interface OwnersAnonymousArgs
 * @extends util.IAuth
 */
export interface IOwnersAnonymousArgs extends util.IAuth {
    transactionId: string;
    name_first: string;
    name_last: string;
    tel: string;
    email: string;
}
/**
 * 取引中所有者更新
 * @deprecated updateOwnersへ変更予定
 * @desc 取引中の匿名所有者のプロフィールを更新します。
 * @memberof services.transaction
 * @function ownersAnonymous
 * @param {IOwnersAnonymousArgs} args
 * @returns {Promise<void>}
 */
export async function ownersAnonymous(args: IOwnersAnonymousArgs): Promise<void> {
    const body = {
        name_first: args.name_first,
        name_last: args.name_last,
        tel: args.tel,
        email: args.email
    };
    const response = await request.patch({
        url: `${util.endPoint}/transactions/${args.transactionId}/anonymousOwner`,
        auth: { bearer: args.accessToken },
        body: body,
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.NO_CONTENT) util.errorHandler(body, response);

    log('ownersAnonymous result:');
}

/**
 * 所有者
 * @memberof services.transaction
 * @enum OwnersGroup
 */
export enum OwnersGroup {
    /**
     * 匿名
     */
    ANONYMOUS = 'ANONYMOUS',
    /**
     * 会員
     */
    MEMBER = 'MEMBER'
}

/**
 * 取引中所有者更新in
 * @memberof services.transaction
 * @interface IUpdateOwnersArgs
 * @extends util.IAuth
 */
export interface IUpdateOwnersArgs extends util.IAuth {
    ownerId: string;
    transactionId: string;
    name_first: string;
    name_last: string;
    tel: string;
    email: string;
    group: OwnersGroup;
    username?: string;
    password?: string;
}
/**
 * 取引中所有者更新
 * @desc 取引中の匿名所有者のプロフィールを更新します。
 * @memberof services.transaction
 * @function updateOwners
 * @param {IUpdateOwnersArgs} args
 * @returns {Promise<void>}
 */
export async function updateOwners(args: IUpdateOwnersArgs): Promise<void> {
    const body = {
        name_first: args.name_first,
        name_last: args.name_last,
        tel: args.tel,
        email: args.email,
        group: args.group,
        username: args.username,
        password: args.password
    };
    const response = await request.put({
        url: `${util.endPoint}/transactions/${args.transactionId}/owners/${args.ownerId}`,
        auth: { bearer: args.accessToken },
        body: body,
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.NO_CONTENT) util.errorHandler(body, response);

    log('ownersAnonymous result:');
}

/**
 * 照会情報登録in
 * @memberof services.transaction
 * @interface ITransactionsInquiryKeyArgs
 * @extends util.IAuth
 */
export interface ITransactionsEnableInquiryArgs extends util.IAuth {
    transactionId: string;
    inquiry_theater: string;
    inquiry_id: number;
    inquiry_pass: string;
}
/**
 * 照会情報登録(購入番号と電話番号で照会する場合)
 * @deprecated transactionsInquiryKeyへ変更予定
 * @memberof services.transaction
 * @function transactionsEnableInquiry
 * @param {ITransactionsInquiryKeyArgs} args
 * @returns {Promise<void>}
 */
export async function transactionsEnableInquiry(args: ITransactionsEnableInquiryArgs): Promise<void> {
    const body = {
        inquiry_theater: args.inquiry_theater,
        inquiry_id: args.inquiry_id,
        inquiry_pass: args.inquiry_pass
    };
    const response = await request.patch({
        url: `${util.endPoint}/transactions/${args.transactionId}/enableInquiry`,
        auth: { bearer: args.accessToken },
        body: body,
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.NO_CONTENT) util.errorHandler(body, response);

    log('transactionsEnableInquiry result:');
}

/**
 * 照会情報登録in
 * @memberof services.transaction
 * @interface ITransactionsInquiryKeyArgs
 * @extends util.IAuth
 */
export interface ITransactionsInquiryKeyArgs extends util.IAuth {
    transactionId: string;
    theater_code: string;
    reserve_num: number;
    tel: string;
}
/**
 * 照会情報登録(購入番号と電話番号で照会する場合)
 * @memberof services.transaction
 * @function transactionsEnableInquiry
 * @param {ITransactionsInquiryKeyArgs} args
 * @returns {Promise<void>}
 */
export async function transactionsInquiryKey(args: ITransactionsInquiryKeyArgs): Promise<void> {
    const body = {
        theater_code: args.theater_code,
        reserve_num: args.reserve_num,
        tel: args.tel
    };
    const response = await request.put({
        url: `${util.endPoint}/transactions/${args.transactionId}/inquiryKey`,
        auth: { bearer: args.accessToken },
        body: body,
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.NO_CONTENT) util.errorHandler(body, response);

    log('transactionsEnableInquiry result:');
}

/**
 * 取引成立in
 * @memberof services.transaction
 * @interface ITransactionCloseArgs
 * @extends util.IAuth
 */
export interface ITransactionCloseArgs extends util.IAuth {
    transactionId: string;
}
/**
 * 取引成立
 * @memberof services.transaction
 * @function transactionClose
 * @param {ITransactionCloseArgs} args
 * @returns {Promise<void>}
 */
export async function transactionClose(args: ITransactionCloseArgs): Promise<void> {
    const response = await request.patch({
        url: `${util.endPoint}/transactions/${args.transactionId}/close`,
        auth: { bearer: args.accessToken },
        body: {},
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.NO_CONTENT) util.errorHandler({}, response);
    log('close result:');
}

/**
 * メール追加in
 * @memberof services.transaction
 * @interface IAddEmailArgs
 * @extends util.IAuth
 */
export interface IAddEmailArgs extends util.IAuth {
    transactionId: string;
    // tslint:disable-next-line:no-reserved-keywords
    from: string;
    to: string;
    subject: string;
    content: string;
}

/**
 * メール追加
 * @memberof services.transaction
 * @function addEmail
 * @param {IAddEmailArgs} args
 * @returns {Promise<string>}
 */
export async function addEmail(args: IAddEmailArgs): Promise<string> {
    const body = {
        from: args.from,
        to: args.to,
        subject: args.subject,
        content: args.content
    };
    const response = await request.post({
        url: `${util.endPoint}/transactions/${args.transactionId}/notifications/email`,
        auth: { bearer: args.accessToken },
        body: body,
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.OK) util.errorHandler(body, response);
    log(`addEmail result: ${response.body.data}`);

    return response.body.data.id;
}

/**
 * メール削除in
 * @memberof services.transaction
 * @interface IRemoveEmailArgs
 * @extends util.IAuth
 */
export interface IRemoveEmailArgs extends util.IAuth {
    transactionId: string;
    emailId: string;
}
/**
 * メール削除
 * @memberof services.transaction
 * @function removeEmail
 * @param {IRemoveEmailArgs} args
 * @returns {Promise<void>}
 */
export async function removeEmail(args: IRemoveEmailArgs): Promise<void> {
    const response = await request.del({
        url: `${util.endPoint}/transactions/${args.transactionId}/notifications/${args.emailId}`,
        auth: { bearer: args.accessToken },
        body: {},
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.NO_CONTENT) util.errorHandler({}, response);
    log('removeEmail result:');
}

/**
 * 照会取引情報取得in
 * @memberof services.transaction
 * @interface IMakeInquiryArgs
 * @extends util.IAuth
 */
export interface IMakeInquiryArgs extends util.IAuth {
    inquiry_theater: string;
    inquiry_id: number;
    inquiry_pass: string;
}
/**
 * 照会取引情報取得
 * @deprecated findByInquiryKeyへ変更予定
 * @desc 照会キーで取引を検索します。具体的には、劇場コード&予約番号&電話番号による照会です。
 * @memberof services.transaction
 * @function makeInquiry
 * @param {IMakeInquiryArgs} args
 * @returns {Promise<string | null>}
 */
export async function makeInquiry(args: IMakeInquiryArgs): Promise<string | null> {
    const body = {
        inquiry_theater: args.inquiry_theater,
        inquiry_id: args.inquiry_id,
        inquiry_pass: args.inquiry_pass
    };
    const response = await request.post({
        url: `${util.endPoint}/transactions/makeInquiry`,
        auth: { bearer: args.accessToken },
        body: body,
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.timeout
    }).promise();
    if (response.statusCode === HTTPStatus.NOT_FOUND) return null;
    if (response.statusCode !== HTTPStatus.OK) util.errorHandler(body, response);
    log(`makeInquiry result: ${response.body.data}`);

    return response.body.data.id;
}

/**
 * 照会取引情報取得in
 * @memberof services.transaction
 * @interface IFindByInquiryKeyArgs
 * @extends util.IAuth
 */
export interface IFindByInquiryKeyArgs extends util.IAuth {
    theater_code: string;
    reserve_num: number;
    tel: string;
}
/**
 * 照会取引情報取得
 * @desc 照会キーで取引を検索します。具体的には、劇場コード&予約番号&電話番号による照会です。
 * @memberof services.transaction
 * @function findByInquiryKey
 * @param {IMakeInquiryArgs} args
 * @returns {Promise<string | null>}
 */
export async function findByInquiryKey(args: IFindByInquiryKeyArgs): Promise<string | null> {
    const query = {
        theater_code: args.theater_code,
        reserve_num: args.reserve_num,
        tel: args.tel
    };
    const response = await request.get({
        url: `${util.endPoint}/transactions/findByInquiryKey`,
        auth: { bearer: args.accessToken },
        qs: query,
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.timeout
    }).promise();
    if (response.statusCode === HTTPStatus.NOT_FOUND) return null;
    if (response.statusCode !== HTTPStatus.OK) util.errorHandler(query, response);
    log(`makeInquiry result: ${response.body.data}`);

    return response.body.data.id;
}

/**
 * ムビチケ購入管理番号情報
 */
export interface IMvtkPurchaseNoInfo {
    KNYKNR_NO: string;
    PIN_CD: string;
    KNSH_INFO: IMvtkTicket[];
}

/**
 * ムビチケ券種情報
 */
export interface IMvtkTicket {
    KNSH_TYP: string;
    MI_NUM: string;
}

/**
 * ムビチケ座席情報
 */
export interface IMvtkSeat {
    ZSK_CD: string;
}

/**
 * 照会取引情報取得in
 * @interface IAuthorizationsMvtkArgs
 * @extends util.IAuth
 */
export interface IAuthorizationsMvtkArgs extends util.IAuth {
    transaction: ITransactionStartResult; // 取引情報
    amount: number; // 合計金額
    kgygishCd: string; // 興行会社コード
    yykDvcTyp: string; // 予約デバイス区分
    trkshFlg: string; // 取消フラグ
    kgygishSstmZskyykNo: string; // 興行会社システム座席予約番号
    kgygishUsrZskyykNo: string; // 興行会社ユーザー座席予約番号
    jeiDt: string; // 上映日時
    kijYmd: string; // 計上年月日
    stCd: string; // サイトコード
    screnCd: string; // スクリーンコード
    knyknrNoInfo: IMvtkPurchaseNoInfo[]; // 購入管理番号情報
    zskInfo: IMvtkSeat[]; // 座席情報（itemArray）
    skhnCd: string; // 作品コード

}

/**
 * ムビチケオーソリ追加out
 * @memberof services.transaction
 * @interface IAddMvtkAuthorizationResult
 */
export interface IAddMvtkAuthorizationResult {
    // tslint:disable-next-line:no-reserved-keywords
    type: string;
    id: string;
}

/**
 * 照会取引情報取得
 * @memberof services.transaction
 * @function addMvtkauthorization
 * @param {IMakeInquiryArgs} args
 * @returns {Promise<void>}
 */
export async function addMvtkauthorization(args: IAuthorizationsMvtkArgs): Promise<IAddMvtkAuthorizationResult> {
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
    const response = await request.post({
        url: `${util.endPoint}/transactions/${args.transaction.id}/authorizations/mvtk`,
        auth: { bearer: args.accessToken },
        body: body,
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.OK) util.errorHandler(body, response);
    log('addMvtkauthorization result:');

    return response.body.data;
}

/**
 * ムビチケオーソリ削除in
 * @memberof services.transaction
 * @interface IRemoveCOAAuthorizationArgs
 * @extends util.IAuth
 */
export interface IRemoveMvtkAuthorizationArgs extends util.IAuth {
    transactionId: string;
    mvtkAuthorizationId: string;
}
/**
 * ムビチケオーソリ削除
 * @memberof services.transaction
 * @function removeCOAAuthorization
 * @param {IRemoveMvtkAuthorizationArgs} args
 * @requires {Promise<void>}
 */
export async function removeMvtkAuthorization(args: IRemoveMvtkAuthorizationArgs): Promise<void> {
    const response = await request.del({
        url: `${util.endPoint}/transactions/${args.transactionId}/authorizations/${args.mvtkAuthorizationId}`,
        auth: { bearer: args.accessToken },
        body: {},
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.NO_CONTENT) util.errorHandler({}, response);

    log('removeMvtkAuthorization result');
}
