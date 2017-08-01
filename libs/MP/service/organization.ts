/**
 * 組織サービス
 *
 * @namespace service.organization
 */

import * as sskts from '@motionpicture/sskts-domain';
import { NOT_FOUND, OK } from 'http-status';
import apiRequest from '../apiRequest';

import OAuth2client from '../auth/oAuth2client';

/**
 * 劇場組織検索
 */
export async function searchMovieTheaters(args: {
    auth: OAuth2client;
    /**
     * 検索条件
     */
    searchConditions?: {};
}): Promise<sskts.service.organization.IMovieTheater[]> {
    return await apiRequest({
        uri: '/organizations/movieTheater',
        method: 'GET',
        expectedStatusCodes: [OK],
        auth: { bearer: await args.auth.getAccessToken() },
        qs: args.searchConditions
    });
}

/**
 * 枝番号で劇場組織検索
 */
export async function findMovieTheaterByBranchCode(args: {
    auth: OAuth2client;
    /**
     * 枝番号
     */
    branchCode: string;
}): Promise<sskts.service.organization.IMovieTheater | null> {
    return await apiRequest({
        uri: `/organizations/movieTheater/${args.branchCode}`,
        method: 'GET',
        expectedStatusCodes: [NOT_FOUND, OK],
        auth: { bearer: await args.auth.getAccessToken() }
    });
}
