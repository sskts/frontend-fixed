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
    constructor(session) {
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
