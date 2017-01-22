"use strict";
class InquiryModel {
    constructor(inquirySession) {
        if (!inquirySession) {
            inquirySession = {};
        }
        this.performance = (inquirySession.performance) ? inquirySession.performance : null;
        this.stateReserve = (inquirySession.stateReserve) ? inquirySession.stateReserve : null;
    }
    formatToSession() {
        return {
            performance: (this.performance) ? this.performance : null,
            stateReserve: (this.stateReserve) ? this.stateReserve : null,
        };
    }
    checkAccess(next) {
        let result = false;
        if (this.performance && this.stateReserve) {
            result = true;
        }
        if (!result) {
            return next(new Error('無効なアクセスです'));
        }
    }
}
exports.InquiryModel = InquiryModel;
