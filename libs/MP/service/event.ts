/**
 * イベントサービス
 *
 * @namespace service.event
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as httpStatus from 'http-status';
import apiRequest from '../apiRequest';

import OAuth2client from '../auth/oAuth2client';

/**
 * 上映イベント検索
 */
export async function searchIndividualScreeningEvent(args: {
    auth: OAuth2client;
    searchConditions: sskts.service.event.ISearchPerformancesConditions
}): Promise<sskts.factory.event.individualScreeningEvent.IEvent[]> {
    return await apiRequest({
        uri: '/events/individualScreeningEvent',
        qs: args.searchConditions,
        auth: { bearer: await args.auth.getAccessToken() },
        method: 'GET',
        expectedStatusCodes: [httpStatus.OK]
    });
}

/**
 * 上映イベント情報取得
 */
export async function findIndividualScreeningEvent(args: {
    auth: OAuth2client;
    identifier: string;
}): Promise<sskts.factory.event.individualScreeningEvent.IEvent> {
    return await apiRequest({
        uri: `/events/individualScreeningEvent/${args.identifier}`,
        auth: { bearer: await args.auth.getAccessToken() },
        method: 'GET',
        expectedStatusCodes: [httpStatus.OK, httpStatus.NOT_FOUND]
    });
}
