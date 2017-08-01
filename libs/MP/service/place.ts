/**
 * 場所サービス
 *
 * @namespace service.place
 */

import * as sskts from '@motionpicture/sskts-domain';
import { NOT_FOUND, OK } from 'http-status';
import apiRequest from '../apiRequest';

import OAuth2client from '../auth/oAuth2client';

/**
 * 劇場検索
 */
export async function searchMovieTheaters(args: {
    auth: OAuth2client;
    /**
     * 検索条件
     */
    searchConditions?: sskts.service.place.ISearchMovieTheatersConditions;
}): Promise<sskts.service.place.ISearchMovieTheaterResult[]> {
    return await apiRequest({
        uri: '/places/movieTheater',
        method: 'GET',
        expectedStatusCodes: [OK],
        qs: args.searchConditions,
        auth: { bearer: await args.auth.getAccessToken() }
    });
}

/**
 * 劇場情報取得
 */
export async function findMovieTheater(args: {
    auth: OAuth2client;
    /**
     * 枝番号
     */
    branchCode: string;
}): Promise<sskts.factory.place.movieTheater.IPlace | null> {
    return await apiRequest({
        uri: `/places/movieTheater/${args.branchCode}`,
        method: 'GET',
        expectedStatusCodes: [NOT_FOUND, OK],
        auth: { bearer: await args.auth.getAccessToken() }
    });
}
