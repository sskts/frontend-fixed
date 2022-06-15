"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InquiryModel = void 0;
/**
 * 照会モデル
 * @class InquiryModel
 */
class InquiryModel {
    /**
     * @constructor
     */
    constructor(session) {
        this.seller = session === null || session === void 0 ? void 0 : session.seller;
        this.order = session === null || session === void 0 ? void 0 : session.order;
        this.acceptedOffers = session === null || session === void 0 ? void 0 : session.acceptedOffers;
        this.login = session === null || session === void 0 ? void 0 : session.login;
    }
    /**
     * セッションへ保存
     * @memberof InquiryModel
     * @method toSession
     */
    save(session) {
        const inquirySession = {
            seller: this.seller,
            order: this.order,
            acceptedOffers: this.acceptedOffers,
            login: this.login,
        };
        session.inquiry = inquirySession;
    }
}
exports.InquiryModel = InquiryModel;
