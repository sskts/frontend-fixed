"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 照会セッション
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
        this.transactionId = (session.hasOwnProperty('transactionId')) ? session.transactionId : null;
        this.performance = (session.hasOwnProperty('performance')) ? session.performance : null;
        this.stateReserve = (session.hasOwnProperty('stateReserve')) ? session.stateReserve : null;
        this.login = (session.hasOwnProperty('login')) ? session.login : null;
    }
    /**
     * セッションObjectへ変換
     * @memberOf InquiryModel
     * @method toSession
     * @returns {Object}
     */
    toSession() {
        return {
            transactionId: (this.transactionId !== null) ? this.transactionId : null,
            performance: (this.performance !== null) ? this.performance : null,
            stateReserve: (this.stateReserve !== null) ? this.stateReserve : null,
            login: (this.login !== null) ? this.login : null
        };
    }
}
exports.InquiryModel = InquiryModel;
