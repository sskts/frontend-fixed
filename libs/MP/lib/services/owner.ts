/**
 * 会員サービス
 * @namespace services.owner
 */
import * as debug from 'debug';
import * as HTTPStatus from 'http-status';
import * as request from 'request-promise-native';
import * as transaction from '../services/transaction';
import * as util from '../utils/util';

const log = debug('SSKTS:services.owner');

/**
 * 会員プロフィール
 * @memberof services.owner
 * @interface IProfile
 */
export interface IProfile {
    // tslint:disable-next-line:no-reserved-keywords
    type: string;
    id: string;
    attributes: {
        name_first: string;
        name_last: string;
        email: string;
        tel: string;
    };
}

/**
 * 会員プロフィール取得in
 * @type IUpdateProfileArgs
 */
export type IGetProfileArgs = util.IAuth;

/**
 * 会員プロフィール取得
 * @desc ログイン中の会員のプロフィールを取得します。
 * @memberof services.owner
 * @function getProfile
 * @param {IGetProfileArgs} args
 * @returns {Promise<IProfile>}
 */
export async function getProfile(args: IGetProfileArgs): Promise<IProfile> {
    const response = await request.get({
        url: `${util.ENDPOINT}/owners/me/profile`,
        auth: { bearer: args.accessToken },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.TIMEOUT
    }).promise();
    if (response.statusCode !== HTTPStatus.OK) util.errorHandler(undefined, response);

    log('getProfile:', response.body.data);

    return response.body.data;
}

/**
 * 会員プロフィール更新in
 * @type IUpdateProfileArgs
 */
export interface IUpdateProfileArgs extends util.IAuth {
    profile: IProfile;
}

/**
 * 会員プロフィール更新
 * @desc ログイン中の会員のプロフィールを更新します。
 * @memberof services.owner
 * @function updateProfile
 * @param {IUpdateProfileArgs} args
 */
export async function updateProfile(args: IUpdateProfileArgs): Promise<void> {
    const body = {
        type: 'owners',
        id: args.profile.id,
        attributes: args.profile.attributes
    };
    const response = await request.put({
        url: `${util.ENDPOINT}/owners/me/profile`,
        auth: { bearer: args.accessToken },
        body: body,
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.TIMEOUT
    }).promise();
    if (response.statusCode !== HTTPStatus.NO_CONTENT) util.errorHandler(body, response);

    log('updateProfile:');

    return;
}

/**
 * 会員プロフィール
 * @memberof services.owner
 * @interface ICard
 */
export interface ICard {
    // tslint:disable-next-line:no-reserved-keywords
    type: string;
    id: string;
    attributes: transaction.IExportCardInfo;
}

/**
 * 会員カード検索in
 * @type ISearchCardsArgs
 */
export type ISearchCardsArgs = util.IAuth;

/**
 * 会員カード検索
 * @desc ログイン中の会員のカードを検索します。
 * @memberof services.owner
 * @function searchCards
 * @param {ISearchCardsArgs} args
 * @returns {Promise<ICard[]>}
 */
export async function searchCards(args: ISearchCardsArgs): Promise<ICard[]> {
    const response = await request.get({
        url: `${util.ENDPOINT}/owners/me/cards`,
        auth: { bearer: args.accessToken },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.TIMEOUT
    }).promise();
    if (response.statusCode !== HTTPStatus.OK) util.errorHandler(undefined, response);

    log('searchCards:', response.body.data);

    return response.body.data;
}

/**
 * 会員カード追加in
 * @type IAddCardArgs
 */
export interface IAddCardArgs extends util.IAuth {
    card: ICard;
}

/**
 * 会員カード追加
 * @desc ログイン中の会員のカードを作成します。
 * @memberof services.owner
 * @function addCard
 * @param {IAddCardArgs} args
 * @returns {Promise<void>}
 */
export async function addCard(args: IAddCardArgs): Promise<void> {
    const body = {
        data: {
            type: 'cards',
            attributes: args.card.attributes
        }
    };
    const response = await request.post({
        url: `${util.ENDPOINT}/owners/me/cards`,
        auth: { bearer: args.accessToken },
        body: body,
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.TIMEOUT
    }).promise();
    if (response.statusCode !== HTTPStatus.CREATED) util.errorHandler(undefined, response);

    log('addCard:');

    return response.body.data;
}

/**
 * 会員カード削除in
 * @interface IRemoveCardArgs
 */
export interface IRemoveCardArgs extends util.IAuth {
    cardId: string;
}

/**
 * 会員カード削除
 * @desc ログイン中の会員のカードを削除します。
 * @memberof services.owner
 * @function removeCard
 * @param {IRemoveCardArgs} args
 * @returns {Promise<void>}
 */
export async function removeCard(args: IRemoveCardArgs): Promise<void> {
    const response = await request.delete({
        url: `${util.ENDPOINT}/owners/me/cards${args.cardId}`,
        auth: { bearer: args.accessToken },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.TIMEOUT
    }).promise();
    if (response.statusCode !== HTTPStatus.NO_CONTENT) util.errorHandler(args, response);

    log('removeCard:');

    return;
}

/**
 * 会員座席予約資産検索in
 * @type ISeatReservationArgs
 */
export type ISeatReservationArgs = util.IAuth;

/**
 * 会員座席予約資産検索out
 * @memberof services.owner
 * @interface ISeatReservationResult
 */
export interface ISeatReservationResult {
    // tslint:disable-next-line:no-reserved-keywords
    type: string;
    id: string;
    attributes: {
        performance: string;
        screen_section: string;
        seat_code: string;
        ticket_code: string;
        ticket_name: util.ILanguage;
        ticket_name_kana: string;
        std_price: number;
        add_price: number;
        dis_price: number;
        sale_price: number;
        add_glasses: number;
        mvtk_app_price: number;
        kbn_eisyahousiki: string;
        mvtk_num: string;
        mvtk_kbn_denshiken: string;
        mvtk_kbn_maeuriken: string;
        mvtk_kbn_kensyu: string;
        mvtk_sales_price: number;
        theater: string;
        screen: string;
        film: string;
        performance_day: string;
        performance_time_start: string;
        performance_time_end: string;
        theater_name: util.ILanguage;
        theater_name_kana: string;
        theater_address: util.ILanguage;
        screen_name: util.ILanguage;
        film_name: util.ILanguage;
        film_name_kana: string;
        film_name_short: string;
        film_name_original: string;
        film_minutes: number;
        film_kbn_eirin: string;
        film_kbn_eizou: string;
        film_kbn_joueihousiki: string;
        film_kbn_jimakufukikae: string;
        film_copyright: string
    };
}

/**
 * 会員座席予約資産検索
 * @desc ログイン中の会員のカードを検索します。
 * @memberof services.owner
 * @function searchSeatReservation
 * @param {ISeatReservationArgs} args
 * @returns {Promise<ISeatReservationResult[]>}
 */
export async function searchSeatReservation(args: ISeatReservationArgs): Promise<ISeatReservationResult[]> {
    const response = await request.get({
        url: `${util.ENDPOINT}/owners/me/assets/seatReservation`,
        auth: { bearer: args.accessToken },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: util.TIMEOUT
    }).promise();
    if (response.statusCode !== HTTPStatus.OK) util.errorHandler(undefined, response);

    log('searchSeatReservation:', response.body.data);

    return response.body.data;
}
