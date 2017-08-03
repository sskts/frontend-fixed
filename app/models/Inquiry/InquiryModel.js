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
        this.movieTheaterOrganization = (session.movieTheaterOrganization !== undefined) ? session.movieTheaterOrganization : null;
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
     * 上映日取得（YYYYMMDD）
     * @method getScreeningDateToString
     * @returns {string}
     */
    getScreeningDateToString() {
        if (this.order === null) {
            return '';
        }
        return moment(this.order.acceptedOffers[0].reservationFor.startDate).format('YYYYMMDD');
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
            start: `${`00${Math.floor(startDiff / HOUR)}`.slice(UtilModule.DIGITS_02)}:${screeningStatTime.format('mm')}`,
            end: `${`00${Math.floor(endDiff / HOUR)}`.slice(UtilModule.DIGITS_02)}:${screeningEndTime.format('mm')}`
        };
    }
}
exports.InquiryModel = InquiryModel;
