/**
 * 人物サービス
 *
 * @namespace service.person
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as httpStatus from 'http-status';
import apiRequest from '../apiRequest';

import OAuth2client from '../auth/oAuth2client';

/**
 * プロフィール取得
 */
export async function getMyProfile(args: {
    auth: OAuth2client;
}): Promise<sskts.factory.person.IProfile> {
    return await apiRequest({
        uri: '/people/me/profile',
        // qs: args.searchConditions,
        auth: { bearer: await args.auth.getAccessToken() },
        method: 'GET',
        expectedStatusCodes: [httpStatus.OK]
    });
}

/**
 * プロフィール変更
 */
export async function updateMyProfile(args: {
    auth: OAuth2client;
    profile: sskts.factory.person.IProfile
}): Promise<void> {
    return await apiRequest({
        uri: '/people/me/profile',
        body: args.profile,
        auth: { bearer: await args.auth.getAccessToken() },
        method: 'PUT',
        expectedStatusCodes: [httpStatus.NO_CONTENT]
    });
}

/**
 * クレジットカード検索
 */
export async function findMyCreditCards(args: {
    auth: OAuth2client;
}): Promise<any> {
    return await apiRequest({
        uri: '/people/me/creditCards',
        // qs: args.searchConditions,
        auth: { bearer: await args.auth.getAccessToken() },
        method: 'GET',
        expectedStatusCodes: [httpStatus.OK]
    });
}

/**
 * クレジットカード追加
 */
export async function addMyCreditCard(args: {
    auth: OAuth2client;
    creditCard: {
        cardNo?: string;
        cardPass?: string;
        expire?: string;
        holderName?: string;
        token?: string;
    }
}): Promise<any> {
    return await apiRequest({
        uri: '/people/me/creditCards',
        body: args.creditCard,
        auth: { bearer: await args.auth.getAccessToken() },
        method: 'POST',
        expectedStatusCodes: [httpStatus.CREATED]
    });
}
