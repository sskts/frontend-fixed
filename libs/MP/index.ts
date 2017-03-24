/**
 * MPサービス
 * @namespace MP
 */

import * as COA from '@motionpicture/coa-service';
import * as GMO from '@motionpicture/gmo-service';
import * as debug from 'debug';
import * as HTTPStatus from 'http-status';
import * as request from 'request-promise-native';

const debugLog = debug('SSKTS ');
const endPoint = process.env.MP_ENDPOINT;

/**
 * 時間切れ
 * @const TIMEOUT
 */
const TIMEOUT = 10000;

/**
 * 言語
 * @interface Language
 */
export interface Language {
    en: string;
    ja: string;
}

/**
 * 劇場詳細
 * @interface Theater
 */
export interface Theater {
    id: string;
    attributes: {
        address: Language;
        name: Language;
        name_kana: string;
        gmo_site_id: string;
        gmo_shop_id: string;
        gmo_shop_pass: string;
    };
}

/**
 * スクリーン詳細
 * @interface Screen
 */
export interface Screen {
    id: string;
    attributes: {
        coa_screen_code: string;
        name: Language;
        seats_numbers_by_seat_grade: any[];
        sections: Section[];
        theater: string;
    };
}

/**
 * セクション
 * @interface Section
 */
export interface Section {
    code: string;
    name: Language;
    seats: Seat[];
}

/**
 * 座席
 * @interface Seat
 */
export interface Seat {
    code: string;
}

/**
 * 作品詳細
 * @interface Film
 */
export interface Film {
    id: string;
    attributes: {
        coa_title_branch_num: string;
        coa_title_code: string;
        created_at: string;
        date_end: string;
        date_start: string;
        film_branch_code: string;
        film_group: string;
        kbn_eirin: string;
        kbn_eizou: string;
        kbn_jimakufukikae: string;
        kbn_joueihousiki: string;
        minutes: number;
        name: Language;
        name_kana: string;
        name_original: string;
        name_short: string;
        theater: string;
    };
}

/**
 * パフォーマンス詳細
 * @interface Performance
 */
export interface Performance {
    id: string;
    attributes: {
        canceled: boolean,
        day: string,
        film: {
            id: string;
            name: Language;
            name_kana: string;
            name_short: string;
            name_original: string;
            minutes: number;
        },
        screen: {
            id: string;
            name: Language;
        },
        theater: {
            id: string;
            name: Language;
        },
        time_end: string,
        time_start: string
    };
}

/**
 * エラー
 * @function errorHandler
 * @param {any} response
 * @requires {void}
 */
function errorHandler(response: any): void {
    if (response.statusCode === HTTPStatus.NOT_FOUND) {
        console.error('NOT_FOUND');
        throw new Error('NOT_FOUND');
    }
    let message: string = '';
    if (response.body.errors && Array.isArray(response.body.errors)) {
        for (const error of response.body.errors) {
            if (error.description) {
                message = error.description;
                break;
            }
        }
        console.error(response.body.errors);
    }
    throw new Error(message);
}

/**
 * アクセストークン取得
 * @memberOf MP
 * @function oauthToken
 * @requires {Promise<Performance[]>}
 */
export async function oauthToken(): Promise<string> {
    const response = await request.post({
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

    if (response.statusCode !== HTTPStatus.OK) errorHandler(response);
    debugLog('oauthToken:', response.body.access_token);
    return response.body.access_token;
}

/**
 * 劇場取得
 * @memberOf MP
 * @function getTheater
 * @param {GetTheaterArgs} args
 * @requires {Promise<Theater>}
 */
export async function getTheater(id: string): Promise<Theater> {
    debugLog('getTheater args:', id);
    const response = await request.get({
        url: `${endPoint}/theaters/${id}`,
        auth: { bearer: await oauthToken() },
        body: {},
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: TIMEOUT
    });
    if (response.statusCode !== HTTPStatus.OK) errorHandler(response);
    debugLog('getTheater:', response.body.data);
    return response.body.data;
}

/**
 * スクリーン取得
 * @memberOf MP
 * @function getScreen
 * @param {GetScreenArgs} args
 * @requires {Promise<Screen>}
 */
export async function getScreen(id: string): Promise<Screen> {
    debugLog('getScreen args:', id);
    const response = await request.get({
        url: `${endPoint}/screens/${id}`,
        auth: { bearer: await oauthToken() },
        body: {},
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: TIMEOUT
    });
    if (response.statusCode !== HTTPStatus.OK) errorHandler(response);
    debugLog('getScreen:', response.body.data);
    return response.body.data;
}

/**
 * 作品取得
 * @memberOf MP
 * @function getFilm
 * @param {GetFilmArgs} args
 * @requires {Promise<Film>}
 */
export async function getFilm(id: string): Promise<Film> {
    debugLog('getFilm args:', id);
    const response = await request.get({
        url: `${endPoint}/films/${id}`,
        auth: { bearer: await oauthToken() },
        body: {},
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: TIMEOUT
    });
    if (response.statusCode !== HTTPStatus.OK) errorHandler(response);
    debugLog('getFilm:', response.body.data);
    return response.body.data;
}

/**
 * パフォーマンス一覧取得
 * @memberOf MP
 * @function getPerformances
 * @param {string} theater 劇場コード
 * @param {string} day 日付
 * @requires {Promise<Performance[]>}
 */
export async function getPerformances(theater: string, day: string): Promise<Performance[]> {
    debugLog('getPerformances args:', theater, day);
    const response = await request.get({
        url: `${endPoint}/performances`,
        auth: { bearer: await oauthToken() },
        qs: {
            theater: theater,
            day: day
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: TIMEOUT
    });
    if (response.statusCode !== HTTPStatus.OK) errorHandler(response);
    // debugLog('performances:', response.body.data);
    return response.body.data;
}

/**
 * パフォーマンス取得
 * @memberOf MP
 * @function getPerformance
 * @param {GetPerformanceArgs} args
 * @requires {Promise<Performance>}
 */
export async function getPerformance(id: string): Promise<Performance> {
    debugLog('getPerformance args:', id);
    const response = await request.get({
        url: `${endPoint}/performances/${id}`,
        auth: { bearer: await oauthToken() },
        body: {},
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: TIMEOUT
    });
    if (response.statusCode !== HTTPStatus.OK) errorHandler(response);
    debugLog('performance:', response.body.data);
    return response.body.data;
}

/**
 * 取引開始in
 * @memberOf MP
 * @interface TransactionStartArgs
 */
export interface TransactionStartArgs {
    expires_at: number;
}
/**
 * 取引開始out
 * @memberOf MP
 * @interface TransactionStartResult
 */
export interface TransactionStartResult {
    // tslint:disable-next-line:no-reserved-keywords
    type: string;
    id: string;
    attributes: {
        id: string,
        status: string,
        events: any[],
        owners: Owner[],
        queues: any[],
        expired_at: string,
        inquiry_id: string,
        inquiry_pass: string,
        queues_status: string
    };
}

interface Owner {
    id: string;
    group: string;
}

/**
 * 取引開始
 * @memberOf MP
 * @function transactionStart
 * @param {TransactionStartArgs} args
 * @returns {Promise<TransactionStartResult>}
 */
export async function transactionStart(args: TransactionStartArgs): Promise<TransactionStartResult> {
    debugLog('transactionStart args:', args);
    const response = await request.post({
        url: `${endPoint}/transactions/startIfPossible`,
        auth: { bearer: await oauthToken() },
        body: {
            expires_at: args.expires_at
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: TIMEOUT
    });
    debugLog('--------------------transaction:', response.body);
    if (response.statusCode !== HTTPStatus.OK) errorHandler(response);
    const transaction = response.body.data;
    debugLog('transaction:', transaction);

    return transaction;
}

/**
 * COAオーソリ追加in
 * @memberOf MP
 * @interface AddCOAAuthorizationArgs
 */
export interface AddCOAAuthorizationArgs {
    transaction: TransactionStartResult;
    reserveSeatsTemporarilyResult: COA.ReserveService.IUpdTmpReserveSeatResult;
    salesTicketResults: SalesTicketResult[];
    performance: Performance;
    performanceCOA: PerformanceCOA;
    price: number;

}
/**
 * SalesTicketResult
 * @interface SalesTicketResult
 */
interface SalesTicketResult {
    section: string;
    seat_code: string;
    ticket_code: string;
    ticket_name: string;
    ticket_name_eng: string;
    ticket_name_kana: string;
    std_price: number;
    add_price: number;
    dis_price: number;
    sale_price: number;
}
/**
 * COAオーソリ追加out
 * @memberOf MP
 * @interface AddCOAAuthorizationResult
 */
export interface AddCOAAuthorizationResult {
    // tslint:disable-next-line:no-reserved-keywords
    type: string;
    id: string;
}
/**
 * COAオーソリ追加
 * @memberOf MP
 * @function addCOAAuthorization
 * @param {AddCOAAuthorizationArgs} args
 * @returns {Promise<AddCOAAuthorizationResult>}
 */
export async function addCOAAuthorization(args: AddCOAAuthorizationArgs): Promise<AddCOAAuthorizationResult> {
    debugLog('addCOAAuthorization args:', args);
    const promoterOwner = args.transaction.attributes.owners.find((owner) => {
        return (owner.group === 'PROMOTER');
    });
    const promoterOwnerId = (promoterOwner) ? promoterOwner.id : null;
    const anonymousOwner = args.transaction.attributes.owners.find((owner) => {
        return (owner.group === 'ANONYMOUS');
    });
    const anonymousOwnerId = (anonymousOwner) ? anonymousOwner.id : null;

    const response = await request.post({
        url: `${endPoint}/transactions/${args.transaction.id}/authorizations/coaSeatReservation`,
        auth: { bearer: await oauthToken() },
        body: {
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
    if (response.statusCode !== HTTPStatus.OK) errorHandler(response);

    debugLog('addCOAAuthorization result');
    return response.body.data;
}

/**
 * COAオーソリ削除in
 * @memberOf MP
 * @interface RemoveCOAAuthorizationArgs
 */
export interface RemoveCOAAuthorizationArgs {
    transactionId: string;
    coaAuthorizationId: string;
}
/**
 * COAオーソリ削除
 * @memberOf MP
 * @function removeCOAAuthorization
 * @param {RemoveCOAAuthorizationArgs} args
 * @requires {Promise<void>}
 */
export async function removeCOAAuthorization(args: RemoveCOAAuthorizationArgs): Promise<void> {
    debugLog('removeCOAAuthorization args:', args);
    const response = await request.del({
        url: `${endPoint}/transactions/${args.transactionId}/authorizations/${args.coaAuthorizationId}`,
        auth: { bearer: await oauthToken() },
        body: {
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: TIMEOUT
    });
    if (response.statusCode !== HTTPStatus.NO_CONTENT) errorHandler(response);

    debugLog('addCOAAuthorization result');
}

/**
 * GMOオーソリ追加in
 * @memberOf MP
 * @interface AddGMOAuthorizationArgs
 */
export interface AddGMOAuthorizationArgs {
    transaction: TransactionStartResult;
    orderId: string;
    amount: number;
    entryTranResult: GMO.CreditService.EntryTranResult;
    gmoShopId: string;
    gmoShopPassword: string;
}
/**
 * GMOオーソリ追加out
 * @memberOf MP
 * @interface AddGMOAuthorizationResult
 */
export interface AddGMOAuthorizationResult {
    // tslint:disable-next-line:no-reserved-keywords
    type: string;
    id: string;
}
/**
 * GMOオーソリ追加
 * @memberOf MP
 * @function addGMOAuthorization
 * @param {AddGMOAuthorizationArgs} args
 * @requires {Promise<AddGMOAuthorizationResult>}
 */
export async function addGMOAuthorization(args: AddGMOAuthorizationArgs): Promise<AddGMOAuthorizationResult> {
    debugLog('addGMOAuthorization args:', args);
    const promoterOwner = args.transaction.attributes.owners.find((owner) => {
        return (owner.group === 'PROMOTER');
    });
    const promoterOwnerId = (promoterOwner) ? promoterOwner.id : null;
    const anonymousOwner = args.transaction.attributes.owners.find((owner) => {
        return (owner.group === 'ANONYMOUS');
    });
    const anonymousOwnerId = (anonymousOwner) ? anonymousOwner.id : null;

    const response = await request.post({
        url: `${endPoint}/transactions/${args.transaction.id}/authorizations/gmo`,
        auth: { bearer: await oauthToken() },
        body: {
            owner_from: anonymousOwnerId,
            owner_to: promoterOwnerId,
            gmo_shop_id: args.gmoShopId,
            gmo_shop_pass: args.gmoShopPassword,
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
    if (response.statusCode !== HTTPStatus.OK) errorHandler(response);

    debugLog('addGMOAuthorization result:');
    return response.body.data;
}

/**
 * GMOオーソリ削除in
 * @memberOf MP
 * @interface RemoveGMOAuthorizationArgs
 */
export interface RemoveGMOAuthorizationArgs {
    transactionId: string;
    gmoAuthorizationId: string;
}
/**
 * GMOオーソリ削除
 * @memberOf MP
 * @function removeGMOAuthorization
 * @param {RemoveGMOAuthorizationArgs} args
 * @returns {Promise<void>}
 */
export async function removeGMOAuthorization(args: RemoveGMOAuthorizationArgs): Promise<void> {
    debugLog('removeGMOAuthorization args:', args);
    const response = await request.del({
        url: `${endPoint}/transactions/${args.transactionId}/authorizations/${args.gmoAuthorizationId}`,
        auth: { bearer: await oauthToken() },
        body: {},
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: TIMEOUT
    });
    if (response.statusCode !== HTTPStatus.NO_CONTENT) errorHandler(response);

    debugLog('removeGMOAuthorization result:');
}

/**
 * 購入者情報登録in
 * @memberOf MP
 * @interface OwnersAnonymousArgs
 */
export interface OwnersAnonymousArgs {
    transactionId: string;
    name_first: string;
    name_last: string;
    tel: string;
    email: string;
}
/**
 * 購入者情報登録
 * @memberOf MP
 * @function ownersAnonymous
 * @param {OwnersAnonymousArgs} args
 * @returns {Promise<void>}
 */
export async function ownersAnonymous(args: OwnersAnonymousArgs): Promise<void> {
    debugLog('ownersAnonymous args:', args);
    const response = await request.patch({
        url: `${endPoint}/transactions/${args.transactionId}/anonymousOwner`,
        auth: { bearer: await oauthToken() },
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
    if (response.statusCode !== HTTPStatus.NO_CONTENT) errorHandler(response);

    debugLog('ownersAnonymous result:');
}

/**
 * 照会情報登録in
 * @memberOf MP
 * @interface TransactionsEnableInquiryArgs
 */
export interface TransactionsEnableInquiryArgs {
    transactionId: string;
    inquiry_theater: string;
    inquiry_id: number;
    inquiry_pass: string;
}
/**
 * 照会情報登録(購入番号と電話番号で照会する場合)
 * @memberOf MP
 * @function transactionsEnableInquiry
 * @param {TransactionsEnableInquiryArgs} args
 * @returns {Promise<void>}
 */
export async function transactionsEnableInquiry(args: TransactionsEnableInquiryArgs): Promise<void> {
    debugLog('transactionsEnableInquiry args:', args);
    const response = await request.patch({
        url: `${endPoint}/transactions/${args.transactionId}/enableInquiry`,
        auth: { bearer: await oauthToken() },
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
    if (response.statusCode !== HTTPStatus.NO_CONTENT) errorHandler(response);

    debugLog('transactionsEnableInquiry result:');
}

/**
 * 取引成立in
 * @memberOf MP
 * @interface TransactionCloseArgs
 */
export interface TransactionCloseArgs {
    transactionId: string;
}
/**
 * 取引成立
 * @memberOf MP
 * @function transactionClose
 * @param {TransactionCloseArgs} args
 * @returns {Promise<void>}
 */
export async function transactionClose(args: TransactionCloseArgs): Promise<void> {
    debugLog('transactionClose args:', args);
    const response = await request.patch({
        url: `${endPoint}/transactions/${args.transactionId}/close`,
        auth: { bearer: await oauthToken() },
        body: {

        },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: TIMEOUT
    });
    if (response.statusCode !== HTTPStatus.NO_CONTENT) errorHandler(response);
    debugLog('close result:');
}

/**
 * メール追加in
 * @memberOf MP
 * @interface AddEmailArgs
 */
export interface AddEmailArgs {
    transactionId: string;
    // tslint:disable-next-line:no-reserved-keywords
    from: string;
    to: string;
    subject: string;
    content: string;
}
/**
 * メール追加out
 * @memberOf MP
 * @interface AddEmailResult
 */
export interface AddEmailResult {
    id: string;
}
/**
 * メール追加
 * @memberOf MP
 * @function addEmail
 * @param {AddEmailArgs} args
 * @returns {Promise<AddEmailResult>}
 */
export async function addEmail(args: AddEmailArgs): Promise<AddEmailResult> {
    debugLog('addEmail args:', args);
    const response = await request.post({
        url: `${endPoint}/transactions/${args.transactionId}/notifications/email`,
        auth: { bearer: await oauthToken() },
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
    if (response.statusCode !== HTTPStatus.OK) errorHandler(response);
    debugLog('addEmail result:' + response.body.data);
    return response.body.data;
}

/**
 * メール削除in
 * @memberOf MP
 * @interface RemoveEmailArgs
 */
export interface RemoveEmailArgs {
    transactionId: string;
    emailId: string;
}
/**
 * メール削除
 * @memberOf MP
 * @function removeEmail
 * @param {RemoveEmailArgs} args
 * @returns {Promise<void>}
 */
export async function removeEmail(args: RemoveEmailArgs): Promise<void> {
    debugLog('removeEmail args:', args);
    const response = await request.del({
        url: `${endPoint}/transactions/${args.transactionId}/notifications/${args.emailId}`,
        auth: { bearer: await oauthToken() },
        body: {},
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: TIMEOUT
    });
    if (response.statusCode !== HTTPStatus.NO_CONTENT) errorHandler(response);
    debugLog('removeEmail result:');
}

/**
 * 照会取引情報取得in
 * @memberOf MP
 * @interface makeInquiry
 */
export interface MakeInquiryArgs {
    inquiry_theater: string;
    inquiry_id: number;
    inquiry_pass: string;
}
/**
 * 照会取引情報取得
 * @memberOf MP
 * @function makeInquiry
 * @param {MakeInquiryArgs} args
 * @returns {Promise<string>}
 */
export async function makeInquiry(args: MakeInquiryArgs): Promise<string> {
    debugLog('makeInquiry args:', args);
    const response = await request.post({
        url: `${endPoint}/transactions/makeInquiry`,
        auth: { bearer: await oauthToken() },
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
    if (response.statusCode !== HTTPStatus.OK) errorHandler(response);
    debugLog('makeInquiry result:' + response.body.data);
    return response.body.data.id;
}

/**
 * CAO情報
 * @memberOf MP
 * @interface PerformanceCOA
 */
export interface PerformanceCOA {
    theaterCode: string;
    screenCode: string;
    titleCode: string;
    titleBranchNum: string;
}

/**
 * COA情報取得
 * @memberOf MP
 * @function getPerformanceCOA
 * @param {string} theater 劇場id
 * @param {string} screenId スクリーンid
 * @param {string} filmId 作品id
 * @returns {Promise<COAPerformance>}
 */
export async function getPerformanceCOA(theaterId: string, screenId: string, filmId: string): Promise<PerformanceCOA> {
    debugLog('getPerformanceCOA args:', theaterId, screenId, filmId);
    const theater = await getTheater(theaterId);
    debugLog('劇場取得');
    const screen = await getScreen(screenId);
    debugLog('スクリーン取得');
    const film = await getFilm(filmId);
    debugLog('作品取得');
    return {
        theaterCode: theater.id,
        screenCode: screen.attributes.coa_screen_code,
        titleCode: film.attributes.coa_title_code,
        titleBranchNum: film.attributes.coa_title_branch_num
    };
}
