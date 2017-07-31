/**
 * 購入セッション
 */
import * as COA from '@motionpicture/coa-service';
import * as moment from 'moment';
import * as MP from '../../../libs/MP/sskts-api';
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
 * 購入セッション
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
    public individualScreeningEvent: any | null;
    /**
     * 劇場のショップ
     */
    public seller: any | null;
    /**
     * 取引
     */
    public transaction: any | null;
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
    public seatReservationAuthorization: any | null;
    /**
     * GMOオーダーID
     */
    public orderId: string | null;
    /**
     * GMOオーダー回数
     */
    public orderCount: number | null;
    /**
     * GMOオーソリ
     */
    public gmoAuthorization: any | null;
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
    public mvtk: IMvtk[] | null;
    /**
     * ムビチケオーソリ
     */
    public mvtkAuthorization: any | null;
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
        this.seller = (session.seller !== undefined) ? session.seller : null;
        this.transaction = (session.transaction !== undefined) ? session.transaction : null;
        this.salesTickets = (session.salesTickets !== undefined) ? session.salesTickets : null;
        this.reserveTickets = (session.reserveTickets !== undefined) ? session.reserveTickets : [];
        this.seatReservationAuthorization = (session.seatReservationAuthorization !== undefined)
            ? session.seatReservationAuthorization : null;
        this.orderId = (session.orderId !== undefined) ? session.orderId : null;
        this.orderCount = (session.orderCount !== undefined) ? session.orderCount : null;
        this.gmoAuthorization = (session.gmoAuthorization !== undefined) ? session.gmoAuthorization : null;
        this.profile = (session.profile !== undefined) ? session.profile : null;
        this.gmo = (session.gmo !== undefined) ? session.gmo : null;
        this.mvtk = (session.mvtk !== undefined) ? session.mvtk : null;
        this.mvtkAuthorization = (session.mvtkAuthorization !== undefined) ? session.mvtkAuthorization : null;
        this.expired = (session.expired !== undefined) ? session.expired : null;
    }

    /**
     * セッションObjectへ変換
     * @memberof PurchaseModel
     * @method toSession
     * @returns {Object} result
     */
    public toSession(): Object {
        return {
            individualScreeningEvent: this.individualScreeningEvent,
            seller: this.seller,
            transaction: this.transaction,
            salesTickets: this.salesTickets,
            reserveTickets: this.reserveTickets,
            seatReservationAuthorization: this.seatReservationAuthorization,
            orderId: this.orderId,
            orderCount: this.orderCount,
            gmoAuthorization: this.gmoAuthorization,
            profile: this.profile,
            gmo: this.gmo,
            mvtk: this.mvtk,
            mvtkAuthorization: this.mvtkAuthorization,
            expired: this.expired
        };
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
            price += ticket.mvtkAppPrice;
        }

        return price;
    }

    /**
     * GMOオーソリ回数取得
     * @memberof PurchaseModel
     * @method orderCountToString
     * @returns {string}
     */
    public orderCountToString(): string {
        return `00${this.orderCount}`.slice(UtilModule.DIGITS_02);
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
     * @returns {boolean}
     */
    public isMember(): boolean {
        // TODO

        return false;
    }
}
