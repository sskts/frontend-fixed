"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const UtilModule = require("../../modules/Util/UtilModule");
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
            movieTheaterOrganization: this.movieTheaterOrganization,
            order: this.order,
            login: this.login
        };
        session.inquiry = inquirySession;
    }
    /**
     * 上映開始時間取得
     * @memberof PurchaseModel
     * @method getScreeningTime
     * @returns {any}
     */
    // tslint:disable-next-line:prefer-function-over-method
    getScreeningTime(offer) {
        const referenceDateStr = moment(offer.reservationFor.startDate).format('YYYYMMDD');
        const referenceDate = moment(referenceDateStr);
        const screeningStatTime = moment(offer.reservationFor.startDate);
        const screeningEndTime = moment(offer.reservationFor.endDate);
        const HOUR = 60;
        const startDiff = referenceDate.diff(screeningStatTime, 'minutes');
        const endDiff = referenceDate.diff(screeningEndTime, 'minutes');
        return {
            start: `${`00${Math.floor(startDiff / HOUR)}`.slice(UtilModule.DIGITS_02)}:${`00${startDiff}`.slice(UtilModule.DIGITS_02)}`,
            end: `${`00${Math.floor(endDiff / HOUR)}`.slice(UtilModule.DIGITS_02)}:${`00${endDiff}`.slice(UtilModule.DIGITS_02)}`
        };
    }
}
exports.InquiryModel = InquiryModel;
