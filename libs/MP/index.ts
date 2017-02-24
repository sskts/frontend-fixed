/**
 * MPサービス
 * @namespace MP
 */

import * as COA from '@motionpicture/coa-service';
import * as GMO from '@motionpicture/gmo-service';
import * as request from 'request-promise-native';

const endPoint = process.env.MP_API_ENDPOINT;

const STATUS_CODE_200 = 200;
const STATUS_CODE_201 = 201;
const STATUS_CODE_204 = 204;

/**
 * Theater
 * @interface Theater
 */
export interface Theater {
    _id: string;
    address: {
        en: string,
        ja: string
    };
    created_at: string;
    name: {
        en: string,
        ja: string
    };
    name_kana: string;
    updated_at: string;
}

/**
 * Screen
 * @interface Screen
 */
export interface Screen {
    _id: string;
    coa_screen_code: string;
    created_at: string;
    name: {
        en: string,
        ja: string
    };
    seats_numbers_by_seat_grade: any[];
    sections: Section[];
    theater: string;
    updated_at: string;
}

/**
 * Section
 * @interface Section
 */
export interface Section {
    code: string;
    name: {
        en: string,
        ja: string
    };
    seats: Seat[];
}

/**
 * Seat
 * @interface Seat
 */
export interface Seat {
    code: string;
}

/**
 * Film
 * @interface Film
 */
export interface Film {
    _id: string;
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
    minutes: string;
    name: {
        en: string,
        ja: string
    };
    name_kana: string;
    name_original: string;
    name_short: string;
    theater: string;
    updated_at: string;
}

/**
 * Performance
 * @interface Performance
 */
export interface Performance {
    _id: string;
    attributes: {
        canceled: boolean,
        day: string,
        film: Film,
        screen: Screen,
        theater: Theater,
        time_end: string,
        time_start: string
    };
    // tslint:disable-next-line:no-reserved-keywords
    type: string;
}

/**
 * パフォーマンス取得in
 * @memberOf MP
 * @interface getPerformanceArgs
 */
export interface GetPerformanceArgs {
    id: string;
}
/**
 * パフォーマンス取得
 * @memberOf MP
 * @function getPerformance
 * @param {GetPerformanceArgs} args
 * @requires {Promise<Performance>}
 */
export async function getPerformance(args: GetPerformanceArgs): Promise<Performance> {
    const response = await request.get({
        url: `${endPoint}/performances/${args.id}`,
        body: {},
        json: true,
        simple: false,
        resolveWithFullResponse: true
    });
    if (response.statusCode !== STATUS_CODE_200) throw new Error(response.body.message);
    console.log('performances:', response.body.data);
    return response.body.data;
}

/**
 * 取引開始in
 * @memberOf MP
 * @interface TransactionStartArgs
 */
export interface TransactionStartArgs {
    expired_at: number;
}
/**
 * 取引開始out
 * @memberOf MP
 * @interface TransactionStartResult
 */
export interface TransactionStartResult {
    // tslint:disable-next-line:no-reserved-keywords
    type: string;
    _id: string;
    attributes: {
        _id: string,
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
    _id: string;
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
    const response = await request.post({
        url: `${endPoint}/transactions`,
        body: {
            expired_at: args.expired_at
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    });
    if (response.statusCode !== STATUS_CODE_201) throw new Error(response.body.message);
    const transaction = response.body.data;
    console.log('transaction:', transaction);

    return transaction;
}

/**
 * COAオーソリ追加in
 * @memberOf MP
 * @interface AddCOAAuthorizationArgs
 */
export interface AddCOAAuthorizationArgs {
    transaction: TransactionStartResult;
    reserveSeatsTemporarilyResult: COA.ReserveService.UpdTmpReserveSeatResult;
    salesTicketResults: SalesTicketResult[];
    performance: Performance;
    totalPrice: number;

}
/**
 * SalesTicketResult
 * @interface SalesTicketResult
 */
interface SalesTicketResult {
    section: string;
    seat_code: string;
    ticket_code: string;
    ticket_name_ja: string;
    ticket_name_en: string;
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
    _id: string;
}
/**
 * COAオーソリ追加
 * @memberOf MP
 * @function addCOAAuthorization
 * @param {AddCOAAuthorizationArgs} args
 * @returns {Promise<AddCOAAuthorizationResult>}
 */
export async function addCOAAuthorization(args: AddCOAAuthorizationArgs): Promise<AddCOAAuthorizationResult> {
    const promoterOwner = args.transaction.attributes.owners.find((owner) => {
        return (owner.group === 'PROMOTER');
    });
    const promoterOwnerId = (promoterOwner) ? promoterOwner._id : null;
    const anonymousOwner = args.transaction.attributes.owners.find((owner) => {
        return (owner.group === 'ANONYMOUS');
    });
    const anonymousOwnerId = (anonymousOwner) ? anonymousOwner._id : null;

    const response = await request.post({
        url: `${endPoint}/transactions/${args.transaction._id}/authorizations/coaSeatReservation`,
        body: {
            owner_id_from: promoterOwnerId,
            owner_id_to: anonymousOwnerId,
            coa_tmp_reserve_num: args.reserveSeatsTemporarilyResult.tmp_reserve_num,
            coa_theater_code: args.performance.attributes.theater._id,
            coa_date_jouei: args.performance.attributes.day,
            coa_title_code: args.performance.attributes.film.coa_title_code,
            coa_title_branch_num: args.performance.attributes.film.coa_title_branch_num,
            coa_time_begin: args.performance.attributes.time_start,
            coa_screen_code: args.performance.attributes.screen.coa_screen_code,
            seats: args.salesTicketResults.map((tmpReserve) => {
                return {
                    performance: args.performance._id,
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
        resolveWithFullResponse: true
    });
    if (response.statusCode !== STATUS_CODE_200) throw new Error(response.body.message);

    console.log('addCOAAuthorization result');
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
    const response = await request.del({
        url: `${endPoint}/transactions/${args.transactionId}/authorizations/${args.coaAuthorizationId}`,
        body: {
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    });
    if (response.statusCode !== STATUS_CODE_204) throw new Error(response.body.message);

    console.log('addCOAAuthorization result');
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
}
/**
 * GMOオーソリ追加out
 * @memberOf MP
 * @interface AddGMOAuthorizationResult
 */
export interface AddGMOAuthorizationResult {
    // tslint:disable-next-line:no-reserved-keywords
    type: string;
    _id: string;
}
/**
 * GMOオーソリ追加
 * @memberOf MP
 * @function addGMOAuthorization
 * @param {AddGMOAuthorizationArgs} args
 * @requires {Promise<AddGMOAuthorizationResult>}
 */
export async function addGMOAuthorization(args: AddGMOAuthorizationArgs): Promise<AddGMOAuthorizationResult> {
    const promoterOwner = args.transaction.attributes.owners.find((owner) => {
        return (owner.group === 'PROMOTER');
    });
    const promoterOwnerId = (promoterOwner) ? promoterOwner._id : null;
    const anonymousOwner = args.transaction.attributes.owners.find((owner) => {
        return (owner.group === 'ANONYMOUS');
    });
    const anonymousOwnerId = (anonymousOwner) ? anonymousOwner._id : null;
    const response = await request.post({
        url: `${endPoint}/transactions/${args.transaction._id}/authorizations/gmo`,
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
        resolveWithFullResponse: true
    });
    if (response.statusCode !== STATUS_CODE_200) throw new Error(response.body.message);

    console.log('addGMOAuthorization result:');
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
    const response = await request.del({
        url: `${endPoint}/transactions/${args.transactionId}/authorizations/${args.gmoAuthorizationId}`,
        body: {

        },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    });
    if (response.statusCode !== STATUS_CODE_204) throw new Error(response.body.message);

    console.log('removeGMOAuthorization result:');

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
    const response = await request.patch({
        url: `${endPoint}/transactions/${args.transactionId}/anonymousOwner`,
        body: {
            name_first: args.name_first,
            name_last: args.name_last,
            tel: args.tel,
            email: args.email
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    });
    if (response.statusCode !== STATUS_CODE_204) throw new Error(response.body.message);

    console.log('ownersAnonymous result:');
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
    const response = await request.patch({
        url: `${endPoint}/transactions/${args.transactionId}/enableInquiry`,
        body: {
            inquiry_theater: args.inquiry_theater,
            inquiry_id: args.inquiry_id,
            inquiry_pass: args.inquiry_pass
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    });
    if (response.statusCode !== STATUS_CODE_204) throw new Error(response.body.message);

    console.log('transactionsEnableInquiry result:');
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
    const response = await request.patch({
        url: `${endPoint}/transactions/${args.transactionId}/close`,
        body: {

        },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    });
    if (response.statusCode !== STATUS_CODE_204) throw new Error(response.body.message);
    console.log('close result:');
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
    _id: string;
}
/**
 * メール追加
 * @memberOf MP
 * @function addEmail
 * @param {AddEmailArgs} args
 * @returns {Promise<AddEmailResult>}
 */
export async function addEmail(args: AddEmailArgs): Promise<AddEmailResult> {
    const response = await request.post({
        url: `${endPoint}/transactions/${args.transactionId}/notifications/email`,
        body: {
            from: args.from,
            to: args.to,
            subject: args.subject,
            content: args.content
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    });
    if (response.statusCode !== STATUS_CODE_200) throw new Error(response.body.message);
    console.log('addEmail result:' + response.body.data);
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
    const response = await request.del({
        url: `${endPoint}/transactions/${args.transactionId}/notifications/${args.emailId}`,
        body: {},
        json: true,
        simple: false,
        resolveWithFullResponse: true
    });
    if (response.statusCode !== STATUS_CODE_204) throw new Error(response.body.message);
    console.log('removeEmail result:');
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
    const response = await request.post({
        url: `${endPoint}/transactions/makeInquiry`,
        body: {
            inquiry_theater: args.inquiry_theater,
            inquiry_id: args.inquiry_id,
            inquiry_pass: args.inquiry_pass
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    });
    if (response.statusCode !== STATUS_CODE_200) throw new Error(response.body.message);
    console.log('makeInquiry result:' + response.body.data);
    return response.body.data._id;
}
