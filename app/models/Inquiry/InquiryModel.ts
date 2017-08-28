// TODO
import * as sskts from '@motionpicture/sskts-domain';
import * as moment from 'moment';
import * as UtilModule from '../../modules/Util/UtilModule';

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
    movieTheaterOrganization: sskts.service.organization.IMovieTheater | null;
    /**
     * 照会情報
     */
    order: sskts.factory.order.IOrder | null;
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
    public movieTheaterOrganization: sskts.service.organization.IMovieTheater | null;
    /**
     * 照会情報
     */
    public order: sskts.factory.order.IOrder | null;
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
    public save(session: any): void {
        const inquirySession: IInquirySession = {
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
    public getScreeningDateToString(): string {
        if (this.order === null) {
            return '';
        }

        return moment(this.order.acceptedOffers[0].itemOffered.reservationFor.startDate).format('YYYYMMDD');
    }

    /**
     * 上映開始時間取得
     * @memberof PurchaseModel
     * @method getScreeningTime
     * @returns { start: string, end: string }
     */
    // tslint:disable-next-line:prefer-function-over-method
    public getScreeningTime(offer: sskts.factory.order.IOffer): { start: string, end: string } {
        const referenceDateStr = moment(offer.itemOffered.reservationFor.startDate).format('YYYYMMDD');
        const referenceDate = moment(referenceDateStr);
        const screeningStatTime = moment(offer.itemOffered.reservationFor.startDate);
        const screeningEndTime = moment(offer.itemOffered.reservationFor.endDate);
        const HOUR = 60;
        const startDiff = referenceDate.diff(screeningStatTime, 'minutes');
        const endDiff = referenceDate.diff(screeningEndTime, 'minutes');

        return {
            start: `${`00${Math.floor(startDiff / HOUR)}`.slice(UtilModule.DIGITS_02)}:${screeningStatTime.format('mm')}`,
            end: `${`00${Math.floor(endDiff / HOUR)}`.slice(UtilModule.DIGITS_02)}:${screeningEndTime.format('mm')}`
        };
    }
}
