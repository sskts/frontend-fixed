/**
 * 組織サービス
 *
 * @namespace service.organization
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as httpStatus from 'http-status';
import apiRequest from '../apiRequest';

import OAuth2client from '../auth/oAuth2client';

/**
 * 劇場組織検索
 */
export async function searchMovieTheaters(args: {
    auth: OAuth2client;
    searchConditions?: {};
}): Promise<sskts.service.organization.ISearchMovieTheaterResult[]> {
    return await apiRequest({
        uri: '/organizations/movieTheater',
        method: 'GET',
        expectedStatusCodes: [httpStatus.OK],
        qs: args.searchConditions,
        auth: { bearer: await args.auth.getAccessToken() }
    });
}
