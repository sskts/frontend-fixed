"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 照会モデル
 * @class InquiryModel
 */
class InquiryModel {
    /**
     * @constructor
     * @param {any} session
     */
    constructor(session = {}) {
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
    save(session) {
        const inquirySession = {
            seller: this.seller,
            order: this.order,
            login: this.login
        };
        session.inquiry = inquirySession;
    }
}
exports.InquiryModel = InquiryModel;
