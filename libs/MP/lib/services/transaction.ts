import * as COA from '@motionpicture/coa-service';
import * as GMO from '@motionpicture/gmo-service';
import * as debug from 'debug';
import * as HTTPStatus from 'http-status';
import * as request from 'request-promise-native';
import * as performance from '../services/performance';
import * as util from '../utils/util';

const log = debug('SSKTS:services.transaction');

/**
 * 取引状態
 * @memberof services.transaction
 * @enum TransactionStatus
 */
export enum TransactionStatus {
    Underway = 'UNDERWAY',
    Closed = 'CLOSED',
    Expired = 'EXPIRED'
}

/**
 * 所有者情報
 * @memberof services.transaction
 * @interface IOwnersInfo
 */
export interface IOwnersInfo {
    /**
     * 名
     */
    name_first: string;
    /**
     * 姓
     */
    name_last: string;
    /**
     * 電話番号
     */
    tel: string;
    /**
     * メールアドレス
     */
    email: string;
}

/**
 * 所有者
 * @memberof services.transaction
 * @interface IOwner
 */
export interface IOwner {
    id: string;
    group: string;
}

/**
 * 取引out
 * @memberof services.transaction
 * @interface ITransactionResult
 */
export interface ITransactionResult {
    // tslint:disable-next-line:no-reserved-keywords
    type: string;
    id: string;
    attributes: {
        id: string,
        /**
         * 取引状態
         */
        status: TransactionStatus,
        events: any[],
        owners: IOwner[],
        /**
         * 取引進行期限日時
         */
        expired_at: string,
        /**
         * 取引開始日時
         */
        started_at: string
    };
}

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
 * @type ITransactionStartResult
 */
export type ITransactionStartResult = ITransactionResult;

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
        url: `${util.ENDPOINT}/transactions/startIfPossible`,
        auth: { bearer: args.accessToken },
        body: body,
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.TIMEOUT
    }).promise();
    log('--------------------transaction:', response.body);
    if (response.statusCode !== HTTPStatus.OK) util.errorHandler(body, response);
    log('transaction:', response.body.data);

    return response.body.data;
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
 * 照会取引情報取得out
 * @memberof services.transaction
 * @type IFindByInquiryKeyResult
 */
export type IFindByInquiryKeyResult = ITransactionResult;

/**
 * 照会取引情報取得
 * @desc 照会キーで取引を検索します。具体的には、劇場コード&予約番号&電話番号による照会です。
 * @memberof services.transaction
 * @function findByInquiryKey
 * @param {IMakeInquiryArgs} args
 * @returns {Promise<IFindByInquiryKeyResult | null>}
 */
export async function findByInquiryKey(args: IFindByInquiryKeyArgs): Promise<IFindByInquiryKeyResult | null> {
    const query = {
        theater_code: args.theater_code,
        reserve_num: args.reserve_num,
        tel: args.tel
    };
    const response = await request.get({
        url: `${util.ENDPOINT}/transactions/findByInquiryKey`,
        auth: { bearer: args.accessToken },
        qs: query,
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.TIMEOUT
    }).promise();
    if (response.statusCode === HTTPStatus.NOT_FOUND) return null;
    if (response.statusCode !== HTTPStatus.OK) util.errorHandler(query, response);
    log(`findByInquiryKey result: ${response.body.data}`);

    return response.body.data;
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
 * 照会取引情報取得out
 * @memberof services.transaction
 * @type IMakeInquiryResult
 */
export type IMakeInquiryResult = ITransactionResult;

/**
 * 照会取引情報取得
 * @deprecated findByInquiryKeyへ変更予定
 * @desc 照会キーで取引を検索します。具体的には、劇場コード&予約番号&電話番号による照会です。
 * @memberof services.transaction
 * @function makeInquiry
 * @param {IMakeInquiryArgs} args
 * @returns {Promise<IMakeInquiryResult | null>}
 */
export async function makeInquiry(args: IMakeInquiryArgs): Promise<IMakeInquiryResult | null> {
    const body = {
        inquiry_theater: args.inquiry_theater,
        inquiry_id: args.inquiry_id,
        inquiry_pass: args.inquiry_pass
    };
    const response = await request.post({
        url: `${util.ENDPOINT}/transactions/makeInquiry`,
        auth: { bearer: args.accessToken },
        body: body,
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.TIMEOUT
    }).promise();
    if (response.statusCode === HTTPStatus.NOT_FOUND) return null;
    if (response.statusCode !== HTTPStatus.OK) util.errorHandler(body, response);
    log('makeInquiry result:', response.body.data);

    return response.body.data;
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
        url: `${util.ENDPOINT}/transactions/${args.transactionId}/anonymousOwner`,
        auth: { bearer: args.accessToken },
        body: body,
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.TIMEOUT
    }).promise();
    if (response.statusCode !== HTTPStatus.NO_CONTENT) util.errorHandler(body, response);

    log('ownersAnonymous result:');
}

/**
 * 所有者グループ
 * @memberof services.transaction
 * @enum OwnersGroup
 */
export enum OwnersGroup {
    /**
     * プロモーター
     */
    Promoter = 'PROMOTER',
    /**
     * 匿名
     */
    Anonyamous = 'ANONYMOUS',
    /**
     * 会員
     */
    Member = 'MEMBER'
}

/**
 * 取引中所有者更新in
 * @memberof services.transaction
 * @interface IUpdateOwnersArgs
 * @extends util.IAuth
 */
export interface IUpdateOwnersArgs extends util.IAuth, IOwnersInfo {
    /**
     * 所有者id
     */
    ownerId: string;
    /**
     * 取引id
     */
    transactionId: string;
    /**
     * 所有者グループ
     */
    group: OwnersGroup;
    /**
     * ユーザーネーム
     */
    username?: string;
    /**
     * パスワード
     */
    password?: string;
}

/**
 * 取引中所有者更新out
 * @memberof services.transaction
 * @interface IUpdateOwnersResult
 */
export interface IUpdateOwnersResult {
    // tslint:disable-next-line:no-reserved-keywords
    type: string;
    id: string;
    attributes: IOwnersInfo;
}

/**
 * 取引中所有者更新
 * @desc 取引中の匿名所有者のプロフィールを更新します。
 * @memberof services.transaction
 * @function updateOwners
 * @param {IUpdateOwnersArgs} args
 * @returns {Promise<IUpdateOwnersResult>}
 */
export async function updateOwners(args: IUpdateOwnersArgs): Promise<IUpdateOwnersResult> {
    const body = {
        data: {
            type: 'owners',
            id: args.ownerId,
            attributes: {
                name_first: args.name_first,
                name_last: args.name_last,
                tel: args.tel,
                email: args.email,
                group: args.group,
                username: args.username,
                password: args.password
            }
        }
    };
    const response = await request.put({
        url: `${util.ENDPOINT}/transactions/${args.transactionId}/owners/${args.ownerId}`,
        auth: { bearer: args.accessToken },
        body: body,
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.TIMEOUT
    }).promise();
    if (response.statusCode !== HTTPStatus.NO_CONTENT) util.errorHandler(body, response);

    log('ownersAnonymous result:', response.body.data);

    return response.body.data;
}

/**
 * カード情報
 * @memberof services.transaction
 * @interface ICardInfo
 */
export interface ICardInfo {
    /**
     * カード番号
     */
    card_no: string;
    /**
     * 有効期限
     */
    expire: string;
    /**
     * 名義人
     */
    holder_name: string;
}

/**
 * 入力カード情報
 * @memberof services.transaction
 * @interface IImportCardInfo
 * @extends ICardInfo
 */
export interface IImportCardInfo extends ICardInfo {
    /**
     * パスワード
     */
    card_pass: string;
    /**
     * トークン化カード情報
     */
    token: string;
}

/**
 * 出力カード情報
 * @memberof services.transaction
 * @interface IExportCardInfo
 * @extends ICardInfo
 */
export interface IExportCardInfo extends ICardInfo {
    /**
     * カード登録連番
     */
    card_seq: string;
    /**
     * カード会社略称
     */
    card_name: string;
}

/**
 * 取引中所有者カード追加in
 * @memberof services.transaction
 * @interface IAddOwnersCardArgs
 * @extends util.IAuth
 */
export interface IAddOwnersCardArgs extends util.IAuth, IImportCardInfo {
    // tslint:disable-next-line:no-reserved-keywords
    transactionId: string;
    ownerId: string;
}

/**
 * 取引中所有者カード追加out
 * @memberof services.transaction
 * @interface IAddOwnersCardResult
 */
export interface IAddOwnersCardResult {
    // tslint:disable-next-line:no-reserved-keywords
    type: string;
    id: string;
    attributes: IExportCardInfo;
}

/**
 * 取引中所有者カード追加
 * @desc 取引中の所有者のカードを作成します。
 * @memberof services.transaction
 * @function addOwnersCard
 * @param {IAddOwnersCardArgs} args
 * @returns {Promise<IAddOwnersCardResult>}
 */
export async function addOwnersCard(args: IAddOwnersCardArgs): Promise<IAddOwnersCardResult> {
    const body = {
        data: {
            type: 'cards',
            attributes: {
                card_no: args.card_no,
                card_pass: args.card_pass,
                expire: args.expire,
                holder_name: args.holder_name,
                token: args.token
            }
        }
    };
    const response = await request.put({
        url: `${util.ENDPOINT}/transactions/${args.transactionId}/owners/${args.ownerId}/cards`,
        auth: { bearer: args.accessToken },
        body: body,
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.TIMEOUT
    }).promise();
    if (response.statusCode !== HTTPStatus.CREATED) util.errorHandler(body, response);

    log('addOwnersCard result:', response.body.data);

    return response.body.data;
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
 * @returns {Promise<IAddGMOAuthorizationResult>}
 */
export async function addGMOAuthorization(args: IAddGMOAuthorizationArgs): Promise<IAddGMOAuthorizationResult> {
    const promoterOwner = args.transaction.attributes.owners.find((owner) => {
        return (owner.group === OwnersGroup.Promoter);
    });
    const promoterOwnerId = (promoterOwner !== undefined) ? promoterOwner.id : null;
    const anonymousOwner = args.transaction.attributes.owners.find((owner) => {
        return (owner.group === OwnersGroup.Anonyamous);
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
    const response = await request.post({
        url: `${util.ENDPOINT}/transactions/${args.transaction.id}/authorizations/gmo`,
        auth: { bearer: args.accessToken },
        body: body,
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.TIMEOUT
    }).promise();
    if (response.statusCode !== HTTPStatus.OK) util.errorHandler(body, response);

    log('addGMOAuthorization result:');

    return response.body.data;
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
        return (owner.group === OwnersGroup.Promoter);
    });
    const promoterOwnerId = (promoterOwner !== undefined) ? promoterOwner.id : null;
    const anonymousOwner = args.transaction.attributes.owners.find((owner) => {
        return (owner.group === OwnersGroup.Anonyamous);
    });
    const anonymousOwnerId = (anonymousOwner !== undefined) ? anonymousOwner.id : null;
    const body = {
        data: {
            type: 'authorizations',
            attributes: {
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
                            en: tmpReserve.ticket_name_eng
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
                        mvtk_sales_price: tmpReserve.mvtk_sales_price
                    };
                }),
                price: args.price
            }
        }
    };
    const response = await request.post({
        url: `${util.ENDPOINT}/transactions/${args.transaction.id}/authorizations/coaSeatReservation`,
        auth: { bearer: args.accessToken },
        body: body,
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.TIMEOUT
    }).promise();
    if (response.statusCode !== HTTPStatus.OK) util.errorHandler(body, response);

    log('addCOAAuthorization result');

    return response.body.data;
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
 * @interface IMvtkSeat
 */
export interface IMvtkSeat {
    /**
     * ムビチケ座席情報
     */
    ZSK_CD: string;
}

/**
 * 照会取引情報取得in
 * @interface IAuthorizationsMvtkArgs
 * @extends util.IAuth
 */
export interface IAuthorizationsMvtkArgs extends util.IAuth {
    /**
     * 取引情報
     */
    transaction: ITransactionStartResult;
    /**
     * 合計金額
     */
    amount: number;
    /**
     * 興行会社コード
     */
    kgygishCd: string;
    /**
     * 予約デバイス区分
     */
    yykDvcTyp: string;
    /**
     * 取消フラグ
     */
    trkshFlg: string;
    /**
     * 興行会社システム座席予約番号
     */
    kgygishSstmZskyykNo: string;
    /**
     * 興行会社ユーザー座席予約番号
     */
    kgygishUsrZskyykNo: string;
    /**
     * 上映日時
     */
    jeiDt: string;
    /**
     * 計上年月日
     */
    kijYmd: string;
    /**
     * サイトコード
     */
    stCd: string;
    /**
     * スクリーンコード
     */
    screnCd: string;
    /**
     * 購入管理番号情報リスト
     */
    knyknrNoInfo: IMvtkPurchaseNoInfo[];
    /**
     * ムビチケ座席情報リスト
     */
    zskInfo: {
        /**
         * ムビチケ座席情報
         */
        ZSK_CD: string;
    }[];
    /**
     * 作品コード
     */
    skhnCd: string;

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
        return (owner.group === OwnersGroup.Promoter);
    });
    const promoterOwnerId = (promoterOwner !== undefined) ? promoterOwner.id : null;
    const anonymousOwner = args.transaction.attributes.owners.find((owner) => {
        return (owner.group === OwnersGroup.Anonyamous);
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
    const response = await request.post({
        url: `${util.ENDPOINT}/transactions/${args.transaction.id}/authorizations/mvtk`,
        auth: { bearer: args.accessToken },
        body: body,
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.TIMEOUT
    }).promise();
    if (response.statusCode !== HTTPStatus.OK) util.errorHandler(body, response);
    log('addMvtkauthorization result:');

    return response.body.data;
}

/**
 * 承認解除in
 * @memberof services.transaction
 * @interface IRemoveAuthorizationArgs
 * @extends util.IAuth
 */
export interface IRemoveAuthorizationArgs extends util.IAuth {
    transactionId: string;
    authorizationId: string;
}
/**
 * 承認解除
 * @desc 進行中の取引から承認を解除します。
 * @memberof services.transaction
 * @function removeAuthorization
 * @param {IRemoveAuthorizationArgs} args
 * @returns {Promise<void>}
 */
export async function removeAuthorization(args: IRemoveAuthorizationArgs): Promise<void> {
    const response = await request.delete({
        url: `${util.ENDPOINT}/transactions/${args.transactionId}/authorizations/${args.authorizationId}`,
        auth: { bearer: args.accessToken },
        body: {},
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.TIMEOUT
    }).promise();
    if (response.statusCode !== HTTPStatus.NO_CONTENT) util.errorHandler({}, response);

    log('removeAuthorization result:');
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
        data: {
            theater_code: args.theater_code,
            reserve_num: args.reserve_num,
            tel: args.tel
        }
    };
    const response = await request.put({
        url: `${util.ENDPOINT}/transactions/${args.transactionId}/inquiryKey`,
        auth: { bearer: args.accessToken },
        body: body,
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.TIMEOUT
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
        url: `${util.ENDPOINT}/transactions/${args.transactionId}/enableInquiry`,
        auth: { bearer: args.accessToken },
        body: body,
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.TIMEOUT
    }).promise();
    if (response.statusCode !== HTTPStatus.NO_CONTENT) util.errorHandler(body, response);

    log('transactionsEnableInquiry result:');
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
    const response = await request.post({
        url: `${util.ENDPOINT}/transactions/${args.transactionId}/notifications/email`,
        auth: { bearer: args.accessToken },
        body: body,
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.TIMEOUT
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
        url: `${util.ENDPOINT}/transactions/${args.transactionId}/notifications/${args.emailId}`,
        auth: { bearer: args.accessToken },
        body: {},
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.TIMEOUT
    }).promise();
    if (response.statusCode !== HTTPStatus.NO_CONTENT) util.errorHandler({}, response);
    log('removeEmail result:');
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
        url: `${util.ENDPOINT}/transactions/${args.transactionId}/close`,
        auth: { bearer: args.accessToken },
        body: {},
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.TIMEOUT
    }).promise();
    if (response.statusCode !== HTTPStatus.NO_CONTENT) util.errorHandler({}, response);
    log('close result:');
}
