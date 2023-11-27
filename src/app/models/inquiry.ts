import { factory } from '@cinerino/sdk';
import { Session, SessionData } from 'express-session';

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
     * 販売者
     */
    seller?: Omit<
        factory.seller.ISeller,
        'project' | 'hasMerchantReturnPolicy' | 'makesOffer' | 'paymentAccepted'
    >;
    /**
     * 注文情報
     */
    order?: Omit<
        factory.order.IOrder,
        'acceptedOffers' | 'discounts' | 'identifier' | 'isGift' | 'url'
    >;
    /**
     * 予約オファー
     */
    acceptedOffers?: factory.order.IAcceptedOffer<factory.order.IItemOffered>[];
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
     * 販売者
     */
    public seller?: Omit<
        factory.seller.ISeller,
        'project' | 'hasMerchantReturnPolicy' | 'makesOffer' | 'paymentAccepted'
    >;
    /**
     * 注文情報
     */
    public order?: Omit<
        factory.order.IOrder,
        'acceptedOffers' | 'discounts' | 'identifier' | 'isGift' | 'url'
    >;
    /**
     * 予約オファー
     */
    public acceptedOffers?: factory.order.IAcceptedOffer<factory.order.IItemOffered>[];
    /**
     * login情報
     */
    public login?: ILogin;

    /**
     * @constructor
     */
    constructor(session?: IInquirySession) {
        this.seller = session?.seller;
        this.order = session?.order;
        this.acceptedOffers = session?.acceptedOffers;
        this.login = session?.login;
    }

    /**
     * セッションへ保存
     * @memberof InquiryModel
     * @method toSession
     */
    public save(session: Session & Partial<SessionData>): void {
        const inquirySession: IInquirySession = {
            seller: this.seller,
            order: this.order,
            acceptedOffers: this.acceptedOffers,
            login: this.login,
        };
        session.inquiry = inquirySession;
    }
}
