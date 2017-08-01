/**
 * 人物サービス
 *
 * @namespace service.person
 */

import * as sskts from '@motionpicture/sskts-domain';
import { CREATED, NO_CONTENT, OK } from 'http-status';
import apiRequest from '../apiRequest';

import OAuth2client from '../auth/oAuth2client';

/**
 * プロフィール取得
 */
export async function getProfile(args: {
    auth: OAuth2client;
    /**
     * 人物ID
     * ログイン中の人物の場合、'me'を指定してください。
     */
    personId: string;
}): Promise<sskts.factory.person.IProfile> {
    return await apiRequest({
        uri: `/people/${args.personId}/profile`,
        auth: { bearer: await args.auth.getAccessToken() },
        method: 'GET',
        expectedStatusCodes: [OK]
    });
}

/**
 * プロフィール変更
 */
export async function updateProfile(args: {
    auth: OAuth2client;
    /**
     * 人物ID
     * ログイン中の人物の場合、'me'を指定してください。
     */
    personId: string;
    /**
     * プロフィール
     */
    profile: sskts.factory.person.IProfile
}): Promise<void> {
    return await apiRequest({
        uri: `/people/${args.personId}/profile`,
        body: args.profile,
        auth: { bearer: await args.auth.getAccessToken() },
        method: 'PUT',
        expectedStatusCodes: [NO_CONTENT]
    });
}

/**
 * クレジットカード検索
 */
export async function findCreditCards(args: {
    auth: OAuth2client;
    /**
     * 人物ID
     * ログイン中の人物の場合、'me'を指定してください。
     */
    personId: string;
}): Promise<sskts.GMO.services.card.ISearchCardResult[]> {
    return await apiRequest({
        uri: `/people/${args.personId}/creditCards`,
        auth: { bearer: await args.auth.getAccessToken() },
        method: 'GET',
        expectedStatusCodes: [OK]
    });
}

export interface IPresavedCreditCardRaw {
    cardNo: string;
    cardPass?: string;
    expire: string;
    holderName: string;
}
export interface IPresavedCreditCardTokenized {
    token: string;
}

/**
 * クレジットカード追加
 */
export async function addCreditCard(args: {
    auth: OAuth2client;
    /**
     * 人物ID
     * ログイン中の人物の場合、'me'を指定してください。
     */
    personId: string;
    /**
     * クレジットカード情報
     */
    creditCard: IPresavedCreditCardRaw | IPresavedCreditCardTokenized
}): Promise<sskts.GMO.services.card.ISearchCardResult> {
    return await apiRequest({
        uri: `/people/${args.personId}/creditCards`,
        body: args.creditCard,
        auth: { bearer: await args.auth.getAccessToken() },
        method: 'POST',
        expectedStatusCodes: [CREATED]
    });
}
