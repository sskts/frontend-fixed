import { factory } from '@cinerino/api-nodejs-client';

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
    order?: factory.order.IOrder;
    /**
     * login情報
     */
    login?: ILogin;
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
    public order?: factory.order.IOrder;
    /**
     * login情報
     */
    public login?: ILogin;

    /**
     * @constructor
     * @param {any} session
     */
    constructor(session: any = {}) {
        this.seller = session.seller;
        this.order = session.order;
        this.login = session.login;
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
