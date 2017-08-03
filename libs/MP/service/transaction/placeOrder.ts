/**
 * 注文取引サービス
 *
 * @namespace service.transaction.placeOrder
 */

import * as sskts from '@motionpicture/sskts-domain';
import { CREATED, NO_CONTENT, NOT_FOUND, OK } from 'http-status';
import apiRequest from '../../apiRequest';

import OAuth2client from '../../auth/oAuth2client';

/**
 * 取引を開始する
 * 開始できない場合(混雑中など)、nullが返されます。
 */
export async function start(args: {
    auth: OAuth2client;
    /**
     * 取引期限
     * 指定した日時を過ぎると、取引を進行することはできなくなります。
     */
    expires: Date;
    /**
     * 販売者ID
     */
    sellerId: string;
}): Promise<sskts.factory.transaction.ITransaction> {
    return await apiRequest({
        uri: '/transactions/placeOrder/start',
        method: 'POST',
        expectedStatusCodes: [NOT_FOUND, OK],
        auth: { bearer: await args.auth.getAccessToken() },
        body: {
            expires: args.expires.valueOf(),
            sellerId: args.sellerId
        }
    });
}

/**
 * 取引に座席予約を追加する
 */
export async function createSeatReservationAuthorization(args: {
    auth: OAuth2client;
    /**
     * 取引ID
     */
    transactionId: string;
    /**
     * イベント識別子
     */
    eventIdentifier: string;
    /**
     * 座席販売情報
     */
    offers: sskts.service.transaction.placeOrder.ISeatReservationOffer[];
}): Promise<sskts.factory.authorization.seatReservation.IAuthorization> {
    return await apiRequest({
        uri: `/transactions/placeOrder/${args.transactionId}/seatReservationAuthorization`,
        method: 'POST',
        expectedStatusCodes: [CREATED],
        auth: { bearer: await args.auth.getAccessToken() },
        body: {
            eventIdentifier: args.eventIdentifier,
            offers: args.offers
        }
    });
}

/**
 * 座席予約取消
 */
export async function cancelSeatReservationAuthorization(args: {
    auth: OAuth2client;
    /**
     * 取引ID
     */
    transactionId: string;
    /**
     * 承認ID
     */
    authorizationId: string;
}): Promise<void> {
    return await apiRequest({
        uri: `/transactions/placeOrder/${args.transactionId}/seatReservationAuthorization/${args.authorizationId}`,
        method: 'DELETE',
        expectedStatusCodes: [NO_CONTENT],
        auth: { bearer: await args.auth.getAccessToken() }
    });
}

/**
 * クレジットカードのオーソリを取得する
 */
export async function createCreditCardAuthorization(args: {
    auth: OAuth2client;
    /**
     * 取引ID
     */
    transactionId: string;
    /**
     * オーダーID
     */
    orderId: string;
    /**
     * 金額
     */
    amount: number;
    /**
     * 支払い方法
     */
    method: sskts.GMO.utils.util.Method;
    /**
     * クレジットカード情報
     */
    creditCard: sskts.service.transaction.placeOrder.ICreditCard4authorization;
}): Promise<sskts.factory.authorization.gmo.IAuthorization> {
    return await apiRequest({
        uri: `/transactions/placeOrder/${args.transactionId}/paymentInfos/creditCard`,
        method: 'POST',
        expectedStatusCodes: [CREATED],
        auth: { bearer: await args.auth.getAccessToken() },
        body: {
            orderId: args.orderId,
            amount: args.amount,
            method: args.method,
            creditCard: args.creditCard
        }
    });
}

/**
 * クレジットカードオーソリ取消
 */
export async function cancelCreditCardAuthorization(args: {
    auth: OAuth2client;
    /**
     * 取引ID
     */
    transactionId: string;
    /**
     * 承認ID
     */
    authorizationId: string;
}): Promise<void> {
    return await apiRequest({
        uri: `/transactions/placeOrder/${args.transactionId}/paymentInfos/creditCard/${args.authorizationId}`,
        method: 'DELETE',
        expectedStatusCodes: [NO_CONTENT],
        auth: { bearer: await args.auth.getAccessToken() }
    });
}

export type IMvtk = sskts.factory.authorization.mvtk.IResult & {
    price: number;
};

/**
 * 決済方法として、ムビチケを追加する
 */
export async function createMvtkAuthorization(args: {
    auth: OAuth2client;
    /**
     * 取引ID
     */
    transactionId: string;
    /**
     * ムビチケ情報
     */
    mvtk: IMvtk;
}): Promise<sskts.factory.authorization.mvtk.IAuthorization> {
    return await apiRequest({
        uri: `/transactions/placeOrder/${args.transactionId}/paymentInfos/mvtk`,
        method: 'POST',
        expectedStatusCodes: [CREATED],
        auth: { bearer: await args.auth.getAccessToken() },
        body: args.mvtk
    });
}

/**
 * ムビチケ取消
 */
export async function cancelMvtkAuthorization(args: {
    auth: OAuth2client;
    /**
     * 取引ID
     */
    transactionId: string;
    /**
     * 承認ID
     */
    authorizationId: string;
}): Promise<void> {
    return await apiRequest({
        uri: `/transactions/placeOrder/${args.transactionId}/paymentInfos/mvtk/${args.authorizationId}`,
        method: 'DELETE',
        expectedStatusCodes: [NO_CONTENT],
        auth: { bearer: await args.auth.getAccessToken() }
    });
}

/**
 * 購入者情報登録
 */
export async function setAgentProfile(args: {
    auth: OAuth2client;
    /**
     * 取引ID
     */
    transactionId: string;
    /**
     * 購入者情報
     */
    profile: sskts.factory.person.IProfile;
}): Promise<void> {
    await apiRequest({
        uri: `/transactions/placeOrder/${args.transactionId}/agent/profile`,
        method: 'PUT',
        expectedStatusCodes: [NO_CONTENT],
        auth: { bearer: await args.auth.getAccessToken() },
        body: args.profile
    });
}

/**
 * 取引確定
 */
export async function confirm(args: {
    auth: OAuth2client;
    /**
     * 取引ID
     */
    transactionId: string;
}): Promise<sskts.factory.order.IOrder> {
    return await apiRequest({
        uri: `/transactions/placeOrder/${args.transactionId}/confirm`,
        method: 'POST',
        expectedStatusCodes: [CREATED],
        auth: { bearer: await args.auth.getAccessToken() }
    });
}

export interface IEmailNotification {
    // tslint:disable-next-line:no-reserved-keywords
    from: string;
    to: string;
    subject: string;
    content: string;
}

/**
 * 確定した取引に関して、購入者にメール通知を送信する
 */
export async function sendEmailNotification(args: {
    auth: OAuth2client;
    /**
     * 取引ID
     */
    transactionId: string;
    /**
     * Eメール通知
     */
    emailNotification: IEmailNotification
}): Promise<sskts.factory.order.IOrder> {
    return await apiRequest({
        uri: `/transactions/placeOrder/${args.transactionId}/tasks/sendEmailNotification`,
        method: 'POST',
        expectedStatusCodes: [NO_CONTENT],
        auth: { bearer: await args.auth.getAccessToken() },
        body: args.emailNotification
    });
}
