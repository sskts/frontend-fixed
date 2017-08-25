/**
 * 購入セッション
 */
import * as COA from '@motionpicture/coa-service';
import * as sskts from '@motionpicture/sskts-domain';
import { Request } from 'express';
import * as moment from 'moment';
import * as UtilModule from '../../modules/Util/UtilModule';
/**
 * 購入者情報
 * @interface IProfile
 */
export interface IProfile {
    /**
     * せい
     */
    familyName: string;
    /**
     * めい
     */
    givenName: string;
    /**
     * メールアドレス
     */
    email: string;
    /**
     * メールアドレス確認
     */
    emailConfirm: string;
    /**
     * 電話番号
     */
    telephone: string;
}

/**
 * GMO
 * @interface IGMO
 */
export interface IGMO {
    /**
     * トークン
     */
    token: string;
    /**
     * マクスされたカード番号
     */
    maskedCardNo: string;
}

/**
 * ムビチケ情報
 * @interface IMvtk
 */
export interface IMvtk {
    /**
     * 購入管理番号
     */
    code: string;
    /**
     * 暗証番号
     */
    password: string;
    /**
     * 有効券情報
     */
    ykknInfo: IValidTicketResult;
    /**
     * チケット情報
     */
    ticket: COA.services.master.IMvtkTicketcodeResult;
}

/**
 * 有効券情報
 * @interface IValidTicketResult
 */
export interface IValidTicketResult {
    /**
     * 有効券種区分
     */
    ykknshTyp: string;
    /**
     * 映写方式区分
     */
    eishhshkTyp: string;
    /**
     * 有効期限券種別枚数
     */
    ykknKnshbtsmiNum: string;
    /**
     * 鑑賞券販売単価
     */
    knshknhmbiUnip: string;
    /**
     * 計上単価
     */
    kijUnip: string;
    /**
     * 電子券区分
     */
    dnshKmTyp: string;
    /**
     * 全国共通券・劇場券区分
     */
    znkkkytsknGkjknTyp: string;
}

/**
 * 予約チケット
 * @interface IReserveTicket
 */
export interface IReserveTicket {
    /**
     * セクション
     */
    section: string;
    /**
     * 座席コード
     */
    seatCode: string;
    /**
     * チケットコード
     */
    ticketCode: string;
    /**
     * チケット名
     */
    ticketName: string;
    /**
     * チケット名(カナ)
     */
    ticketNameKana: string;
    /**
     * チケット名(英)
     */
    ticketNameEng: string;
    /**
     * 標準単価
     */
    stdPrice: number;
    /**
     * 割引額
     */
    disPrice: number;
    /**
     * 加算単価
     */
    addPrice: number;
    /**
     * 販売単価
     */
    salePrice: number;
    /**
     * チケット備考
     */
    ticketNote: string;
    /**
     * メガネ単価
     */
    addPriceGlasses: number;
    /**
     * メガネ有り無し
     */
    glasses: boolean;
    /**
     * ムビチケ計上単価
     */
    mvtkAppPrice: number;
    /**
     * ムビチケ映写方式区分
     */
    kbnEisyahousiki: string;
    /**
     * ムビチケ購入管理番号
     */
    mvtkNum: string;
    /**
     * ムビチケ電子券区分
     */
    mvtkKbnDenshiken: string;
    /**
     * ムビチケ前売券区分
     */
    mvtkKbnMaeuriken: string;
    /**
     * ムビチケ券種区分
     */
    mvtkKbnKensyu: string;
    /**
     * ムビチケ販売単価
     */
    mvtkSalesPrice: number;
}

/**
 * 券種
 * @interface ISalesTicket
 */
export interface ISalesTicket {
    /**
     * チケットコード
     */
    ticketCode: string;
    /**
     * チケット名
     */
    ticketName: string;
    /**
     * チケット名(カナ)
     */
    ticketNameKana: string;
    /**
     * チケット名(英)
     */
    ticketNameEng: string;
    /**
     * 標準単価
     */
    stdPrice: number;
    /**
     * 加算単価
     */
    addPrice: number;
    /**
     * 販売単価
     */
    salePrice: number;
    /**
     * チケット備考
     */
    ticketNote: string;
    /**
     * メガネ単価
     */
    addPriceGlasses: number;
    /**
     * ムビチケ購入番号
     */
    mvtkNum: string;
    /**
     * メガネ有無
     */
    glasses: boolean;
}

/**
 * 購入セッション
 * @interface IPurchaseSession
 */
export interface IPurchaseSession {
    /**
     * 上映イベント
     */
    individualScreeningEvent: sskts.factory.event.individualScreeningEvent.IEvent | null;
    /**
     * 劇場ショップ
     */
    movieTheaterOrganization: sskts.service.organization.IMovieTheater | null;
    /**
     * 取引
     */
    transaction: sskts.factory.transaction.placeOrder.ITransaction | null;
    /**
     * 販売可能チケット情報
     */
    salesTickets: COA.services.reserve.ISalesTicketResult[] | null;
    /**
     * 予約チケット
     */
    reserveTickets: IReserveTicket[];
    /**
     * 予約座席
     */
    seatReservationAuthorization: sskts.factory.authorization.seatReservation.IAuthorization | null;
    /**
     * GMOオーダーID
     */
    orderId: string | null;
    /**
     * GMOオーダー回数
     */
    orderCount: number;
    /**
     * GMOオーソリ
     */
    creditCardAuthorization: sskts.factory.authorization.gmo.IAuthorization | null;
    /**
     * 入力情報
     */
    profile: IProfile | null;
    /**
     * GMO情報
     */
    gmo: IGMO | null;
    /**
     * ムビチケ
     */
    mvtk: IMvtk[];
    /**
     * ムビチケオーソリ
     */
    mvtkAuthorization: sskts.factory.authorization.mvtk.IAuthorization | null;
    /**
     * 有効期限
     */
    expired: Date;
}

/**
 * 購入モデル
 * @class PurchaseModel
 */
export class PurchaseModel {
    public static PERFORMANCE_STATE: number = 0;
    public static SEAT_STATE: number = 1;
    public static TICKET_STATE: number = 2;
    public static INPUT_STATE: number = 3;
    public static CONFIRM_STATE: number = 4;
    public static COMPLETE_STATE: number = 5;

    /**
     * 上映イベント
     */
    public individualScreeningEvent: sskts.factory.event.individualScreeningEvent.IEvent | null;
    /**
     * 劇場ショップ
     */
    public movieTheaterOrganization: sskts.service.organization.IMovieTheater | null;
    /**
     * 取引
     */
    public transaction: sskts.factory.transaction.placeOrder.ITransaction | null;
    /**
     * 販売可能チケット情報
     */
    public salesTickets: COA.services.reserve.ISalesTicketResult[] | null;
    /**
     * 予約チケット
     */
    public reserveTickets: IReserveTicket[];
    /**
     * 予約座席
     */
    public seatReservationAuthorization: sskts.factory.authorization.seatReservation.IAuthorization | null;
    /**
     * GMOオーダーID
     */
    public orderId: string | null;
    /**
     * GMOオーダー回数
     */
    public orderCount: number;
    /**
     * GMOオーソリ
     */
    public creditCardAuthorization: sskts.factory.authorization.gmo.IAuthorization | null;
    /**
     * 入力情報
     */
    public profile: IProfile | null;
    /**
     * GMO情報
     */
    public gmo: IGMO | null;
    /**
     * ムビチケ
     */
    public mvtk: IMvtk[];
    /**
     * ムビチケオーソリ
     */
    public mvtkAuthorization: sskts.factory.authorization.mvtk.IAuthorization | null;
    /**
     * 有効期限
     */
    public expired: Date;

    /**
     * @constructor
     * @param {any} session
     */
    // tslint:disable-next-line:cyclomatic-complexity
    constructor(session?: any) {
        if (session === undefined) {
            session = {};
        }

        this.individualScreeningEvent = (session.individualScreeningEvent !== undefined) ? session.individualScreeningEvent : null;
        this.movieTheaterOrganization = (session.movieTheaterOrganization !== undefined) ? session.movieTheaterOrganization : null;
        this.transaction = (session.transaction !== undefined) ? session.transaction : null;
        this.salesTickets = (session.salesTickets !== undefined) ? session.salesTickets : null;
        this.reserveTickets = (session.reserveTickets !== undefined) ? session.reserveTickets : [];
        this.seatReservationAuthorization = (session.seatReservationAuthorization !== undefined)
            ? session.seatReservationAuthorization : null;
        this.orderId = (session.orderId !== undefined) ? session.orderId : null;
        this.orderCount = (session.orderCount !== undefined) ? session.orderCount : 0;
        this.creditCardAuthorization = (session.creditCardAuthorization !== undefined) ? session.creditCardAuthorization : null;
        this.profile = (session.profile !== undefined) ? session.profile : null;
        this.gmo = (session.gmo !== undefined) ? session.gmo : null;
        this.mvtk = (session.mvtk !== undefined) ? session.mvtk : [];
        this.mvtkAuthorization = (session.mvtkAuthorization !== undefined) ? session.mvtkAuthorization : null;
        this.expired = (session.expired !== undefined) ? session.expired : null;
    }

    /**
     * セッションへ保存
     * @memberof PurchaseModel
     * @method toSession
     * @returns {void}
     */
    public save(session: any): void {
        const purchaseSession: IPurchaseSession = {
            individualScreeningEvent: this.individualScreeningEvent,
            movieTheaterOrganization: this.movieTheaterOrganization,
            transaction: this.transaction,
            salesTickets: this.salesTickets,
            reserveTickets: this.reserveTickets,
            seatReservationAuthorization: this.seatReservationAuthorization,
            orderId: this.orderId,
            orderCount: this.orderCount,
            creditCardAuthorization: this.creditCardAuthorization,
            profile: this.profile,
            gmo: this.gmo,
            mvtk: this.mvtk,
            mvtkAuthorization: this.mvtkAuthorization,
            expired: this.expired
        };
        session.purchase = purchaseSession;
    }

    /**
     * ステータス確認
     * @memberof PurchaseModel
     * @method accessAuth
     * @param {number} value
     * @returns {boolean}
     */
    public accessAuth(value: number): boolean {
        let result = true;
        if (this.transaction === null) result = false;
        switch (value) {
            case PurchaseModel.SEAT_STATE:
                break;
            case PurchaseModel.TICKET_STATE:
                if (this.seatReservationAuthorization === null) result = false;
                break;
            case PurchaseModel.INPUT_STATE:
                if (this.seatReservationAuthorization === null) result = false;
                break;
            case PurchaseModel.CONFIRM_STATE:
                if (this.seatReservationAuthorization === null) result = false;
                if (this.profile === null) result = false;
                break;
            case PurchaseModel.COMPLETE_STATE:
                break;
            default:
                break;
        }

        return result;
    }

    /**
     * ムビチケ対応作品判定
     * @memberof PurchaseModel
     * @method isUsedMvtk
     * @returns {boolean}
     */
    public isUsedMvtk(): boolean {
        if (this.individualScreeningEvent === null) {
            return false;
        }
        const today = moment().format('YYYYMMDD');

        return (this.individualScreeningEvent.superEvent.coaInfo.flgMvtkUse === '1'
            && this.individualScreeningEvent.superEvent.coaInfo.dateMvtkBegin !== undefined
            && Number(this.individualScreeningEvent.superEvent.coaInfo.dateMvtkBegin) <= Number(today));
    }

    /**
     * ムビチケ券有無判定
     * @memberof PurchaseModel
     * @method isReserveMvtkTicket
     * @returns {boolean}
     */
    public isReserveMvtkTicket(): boolean {
        let result = false;
        if (this.reserveTickets === null) return result;
        for (const reserveTicket of this.reserveTickets) {
            if (reserveTicket.mvtkNum !== '' && reserveTicket.mvtkNum.length > 0) result = true;
        }

        return result;
    }

    /**
     * 予約金額取得（決済する分）
     * @memberof PurchaseModel
     * @method getReserveAmount
     * @returns {number}
     */
    public getReserveAmount(): number {
        const reserveTickets = this.reserveTickets;
        let amount = 0;
        if (reserveTickets === null) return amount;
        for (const ticket of reserveTickets) {
            amount += ticket.salePrice;
        }

        return amount;
    }

    /**
     * チケット価値取得（チケット価値）
     * @memberof PurchaseModel
     * @method getPrice
     * @returns {number}
     */
    public getPrice(): number {
        return (this.getReserveAmount() + this.getMvtkPrice());
    }

    /**
     * ムビチケ計上単価合計取得
     * @memberof PurchaseModel
     * @method getMvtkPrice
     * @returns {number}
     */
    public getMvtkPrice(): number {
        const reserveTickets = this.reserveTickets;
        let price = 0;
        if (reserveTickets === null) return price;
        for (const ticket of reserveTickets) {
            price += ticket.mvtkSalesPrice;
        }

        return price;
    }

    /**
     * 有効期限確認
     * @memberof PurchaseModel
     * @method isExpired
     * @returns {boolean}
     */
    public isExpired(): boolean {
        return (this.expired < moment().toDate());
    }

    /**
     * 会員判定
     * @memberof PurchaseModel
     * @returns {boolean}
     */
    public isMember(): boolean {
        // TODO

        return false;
    }

    /**
     * 券種リスト取得
     * @memberof PurchaseModel
     * @method getSalesTickets
     * @param {Request} req
     * @returns {ISalesTicket[]}
     */
    public getSalesTickets(
        req: Request
    ): ISalesTicket[] {
        if (this.individualScreeningEvent === null
            || this.salesTickets === null) {
            return [];
        }

        const result: ISalesTicket[] = [];

        for (const ticket of this.salesTickets) {
            result.push({
                ticketCode: ticket.ticketCode,
                ticketName: ticket.ticketName,
                ticketNameKana: ticket.ticketNameKana,
                ticketNameEng: ticket.ticketNameEng,
                stdPrice: ticket.stdPrice,
                addPrice: ticket.addPrice,
                salePrice: ticket.salePrice,
                ticketNote: ticket.ticketNote,
                addPriceGlasses: 0,
                mvtkNum: '',
                glasses: false
            });

            if (ticket.addGlasses > 0) {
                result.push({
                    ticketCode: ticket.ticketCode,
                    ticketName: `${ticket.ticketName}${req.__('common.glasses')}`,
                    ticketNameKana: ticket.ticketNameKana,
                    ticketNameEng: ticket.ticketNameEng,
                    stdPrice: ticket.stdPrice,
                    addPrice: ticket.addPrice,
                    salePrice: (<number>ticket.salePrice) + (<number>ticket.addGlasses),
                    ticketNote: ticket.ticketNote,
                    addPriceGlasses: ticket.addGlasses,
                    mvtkNum: '',
                    glasses: true
                });
            }
        }

        if (this.mvtk === null) {
            return result;
        }
        // ムビチケ情報からチケット情報へ変換
        const mvtkTickets: ISalesTicket[] = [];
        for (const mvtk of this.mvtk) {
            for (let i = 0; i < Number(mvtk.ykknInfo.ykknKnshbtsmiNum); i += 1) {
                mvtkTickets.push({
                    ticketCode: mvtk.ticket.ticketCode,
                    ticketName: mvtk.ticket.ticketName,
                    ticketNameKana: mvtk.ticket.ticketNameKana,
                    ticketNameEng: mvtk.ticket.ticketNameEng,
                    stdPrice: 0,
                    addPrice: mvtk.ticket.addPrice,
                    salePrice: mvtk.ticket.addPrice,
                    ticketNote: req.__('common.mvtk_code') + mvtk.code,
                    addPriceGlasses: mvtk.ticket.addPriceGlasses,
                    mvtkNum: mvtk.code,
                    glasses: false
                });

                if (mvtk.ticket.addPriceGlasses > 0) {
                    mvtkTickets.push({
                        ticketCode: mvtk.ticket.ticketCode,
                        ticketName: `${mvtk.ticket.ticketName}${req.__('common.glasses')}`,
                        ticketNameKana: mvtk.ticket.ticketNameKana,
                        ticketNameEng: mvtk.ticket.ticketNameEng,
                        stdPrice: 0,
                        addPrice: mvtk.ticket.addPrice,
                        salePrice: (<number>mvtk.ticket.addPrice) + (<number>mvtk.ticket.addPriceGlasses),
                        ticketNote: req.__('common.mvtk_code') + mvtk.code,
                        addPriceGlasses: mvtk.ticket.addPriceGlasses,
                        mvtkNum: mvtk.code,
                        glasses: true
                    });
                }
            }
        }

        return mvtkTickets.concat(result);
    }

    /**
     * オーダーID生成
     * @memberof PurchaseModel
     * @method createOrderId
     * @returns {void}
     */
    public createOrderId(): void {
        if (this.individualScreeningEvent === null
            || this.seatReservationAuthorization === null) {
            return;
        }
        // GMOオーソリ取得
        const theaterCode = `000${this.individualScreeningEvent.coaInfo.theaterCode}`.slice(UtilModule.DIGITS_03);
        const tmpReserveNum = `00000000${this.seatReservationAuthorization.result.tmpReserveNum}`.slice(UtilModule.DIGITS_08);
        // オーダーID 予約日 + 劇場ID(3桁) + 予約番号(8桁) + オーソリカウント(2桁)
        this.orderId = `${moment().format('YYYYMMDD')}${theaterCode}${tmpReserveNum}${`00${this.orderCount}`.slice(UtilModule.DIGITS_02)}`;
        this.orderCount += 1;
    }

    /**
     * 上映開始時間取得
     * @memberof PurchaseModel
     * @method getScreeningTime
     * @returns {any}
     */
    public getScreeningTime(): { start: string, end: string } {
        const individualScreeningEvent = (<sskts.factory.event.individualScreeningEvent.IEvent>this.individualScreeningEvent);
        const referenceDate = moment(individualScreeningEvent.coaInfo.dateJouei);
        const screeningStatTime = moment(individualScreeningEvent.startDate);
        const screeningEndTime = moment(individualScreeningEvent.endDate);
        const HOUR = 60;
        const startDiff = referenceDate.diff(screeningStatTime, 'minutes');
        const endDiff = referenceDate.diff(screeningEndTime, 'minutes');

        return {
            start: `${`00${Math.floor(startDiff / HOUR)}`.slice(UtilModule.DIGITS_02)}:${screeningStatTime.format('mm')}`,
            end: `${`00${Math.floor(endDiff / HOUR)}`.slice(UtilModule.DIGITS_02)}:${screeningEndTime.format('mm')}`
        };
    }
}
