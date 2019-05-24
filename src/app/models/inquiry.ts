import { factory } from '@motionpicture/sskts-api-nodejs-client';

/**
 * ログイン情報
 * @interface ILogin
 */
export interface ILogin {
    /**
     * 購入番号
     */
    reserveNum: string;
    /**
     * 電話番号
     */
    telephone: string;
}

/**
 * 照会セッション
 * @interface IInquirySession
 */
export interface IInquirySession {
    /**
     * 劇場ショップ
     */
    seller?: factory.seller.IOrganization<factory.seller.IAttributes<factory.organizationType>>;
    /**
     * 照会情報
     */
    order: factory.order.IOrder | null;
    /**
     * login情報
     */
    login: ILogin | null;
}

/**
 * 照会モデル
 * @class InquiryModel
 */
export class InquiryModel {
    /**
     * 劇場ショップ
     */
    public seller?: factory.seller.IOrganization<factory.seller.IAttributes<factory.organizationType>>;
    /**
     * 照会情報
     */
    public order: factory.order.IOrder | null;
    /**
     * login情報
     */
    public login: ILogin | null;

    /**
     * @constructor
     * @param {any} session
     */
    constructor(session?: any) {
        if (session === undefined) {
            session = {};
        }
        this.seller = (session.seller !== undefined) ? session.seller : null;
        this.order = (session.order !== undefined) ? session.order : null;
        this.login = (session.login !== undefined) ? session.login : null;
    }

    /**
     * セッションへ保存
     * @memberof InquiryModel
     * @method toSession
     * @returns {Object}
     */
    public save(session: any): void {
        const inquirySession: IInquirySession = {
            seller: this.seller,
            order: this.order,
            login: this.login
        };
        session.inquiry = inquirySession;
    }
}
