/**
 * 購入セッション
 */
import * as COA from '@motionpicture/coa-service';
import * as GMO from '@motionpicture/gmo-service';
import * as moment from 'moment';
import * as MP from '../../../libs/MP';
import * as UtilModule from '../../modules/Util/UtilModule';
/**
 * 購入者情報
 * @interface IInput
 */
export interface IInput {
    /**
     * せい
     */
    last_name_hira: string;
    /**
     * めい
     */
    first_name_hira: string;
    /**
     * メールアドレス
     */
    mail_addr: string;
    /**
     * メールアドレス確認
     */
    mail_confirm: string;
    /**
     * 電話番号
     */
    tel_num: string;
    /**
     * 利用規約
     */
    agree: string;

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
 * COA
 * @interface IPerformanceCOA
 */
export interface IPerformanceCOA {
    theaterCode: string;
    screenCode: string;
    titleCode: string;
    titleBranchNum: string;
    flgMvtkUse: string;
    dateMvtkBegin: string;
    kbnJoueihousiki: string;
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
     * パフォーマンス
     */
    public performance: MP.services.performance.IPerformance | null;
    /**
     * 劇場
     */
    public theater: MP.services.theater.ITheater | null;
    /**
     * COA仮予約
     */
    public reserveSeats: COA.services.reserve.IUpdTmpReserveSeatResult | null;
    /**
     * 予約チケット
     */
    public reserveTickets: MP.services.transaction.IReserveTicket[] | null;
    /**
     * 入力情報
     */
    public input: IInput | null;
    /**
     * GMO TOKEN情報
     */
    public gmo: IGMO | null;
    /**
     * COA本予約
     */
    public updateReserve: COA.services.reserve.IUpdReserveResult | null;
    /**
     * 取引MP
     */
    public transactionMP: MP.services.transaction.ITransactionStartResult | null;
    /**
     * 取引GMO
     */
    public transactionGMO: GMO.CreditService.EntryTranResult | null;
    /**
     * COAオーソリ
     */
    public authorizationCOA: MP.services.transaction.IAddCOAAuthorizationResult | null;
    /**
     * ムビチケオーソリ
     */
    public authorizationMvtk: MP.services.transaction.IAddMvtkAuthorizationResult | null;
    /**
     * GMOオーソリ
     */
    public authorizationGMO: MP.services.transaction.IAddGMOAuthorizationResult | null;
    /**
     * GMOオーソリ回数
     */
    public authorizationCountGMO: number;
    /**
     * オーダーID
     */
    public orderId: string | null;
    /**
     * 有効期限
     */
    public expired: number;
    /**
     * ムビチケ
     */
    public mvtk: IMvtk[] | null;
    /**
     * CAO情報
     */
    public performanceCOA: IPerformanceCOA | null;
    /**
     * COA販売可能チケット情報
     */
    public salesTicketsCOA: COA.services.reserve.ISalesTicketResult[] | null;
    /**
     * 完了メールID
     */
    public completeMailId: string | null;

    /**
     * @constructor
     * @param {any} session
     */
    // tslint:disable-next-line:cyclomatic-complexity
    constructor(session: any) {
        if (session === undefined) {
            session = {};
        }

        this.performance = (session.performance !== undefined) ? session.performance : null;
        this.theater = (session.theater !== undefined) ? session.theater : null;
        this.reserveSeats = (session.reserveSeats !== undefined) ? session.reserveSeats : null;
        this.reserveTickets = (session.reserveTickets !== undefined) ? session.reserveTickets : null;
        this.input = (session.input !== undefined) ? session.input : null;
        this.gmo = (session.gmo !== undefined) ? session.gmo : null;
        this.updateReserve = (session.updateReserve !== undefined) ? session.updateReserve : null;
        this.transactionMP = (session.transactionMP !== undefined) ? session.transactionMP : null;
        this.transactionGMO = (session.transactionGMO !== undefined) ? session.transactionGMO : null;
        this.authorizationCOA = (session.authorizationCOA !== undefined) ? session.authorizationCOA : null;
        this.authorizationMvtk = (session.authorizationMvtk !== undefined) ? session.authorizationMvtk : null;
        this.authorizationGMO = (session.authorizationGMO !== undefined) ? session.authorizationGMO : null;
        this.authorizationCountGMO = (session.authorizationCountGMO !== undefined) ? session.authorizationCountGMO : 0;
        this.orderId = (session.orderId !== undefined) ? session.orderId : null;
        this.expired = (session.expired !== undefined) ? session.expired : null;
        this.mvtk = (session.mvtk !== undefined) ? session.mvtk : null;
        this.performanceCOA = (session.performanceCOA !== undefined) ? session.performanceCOA : null;
        this.salesTicketsCOA = (session.salesTicketsCOA !== undefined) ? session.salesTicketsCOA : null;
        this.completeMailId = (session.completeMailId !== undefined) ? session.completeMailId : null;
    }

    /**
     * セッションObjectへ変換
     * @memberof PurchaseModel
     * @method toSession
     * @returns {Object} result
     */
    public toSession(): {
        performance: MP.services.performance.IPerformance | null;
        theater: MP.services.theater.ITheater | null;
        reserveSeats: COA.services.reserve.IUpdTmpReserveSeatResult | null;
        reserveTickets: MP.services.transaction.IReserveTicket[] | null;
        input: IInput | null;
        gmo: IGMO | null;
        updateReserve: COA.services.reserve.IUpdReserveResult | null;
        transactionMP: MP.services.transaction.ITransactionStartResult | null;
        transactionGMO: GMO.CreditService.EntryTranResult | null;
        authorizationCOA: MP.services.transaction.IAddCOAAuthorizationResult | null;
        authorizationMvtk: MP.services.transaction.IAddMvtkAuthorizationResult | null;
        authorizationGMO: MP.services.transaction.IAddGMOAuthorizationResult | null;
        authorizationCountGMO: number;
        orderId: string | null;
        expired: number;
        mvtk: IMvtk[] | null;
        performanceCOA: IPerformanceCOA | null;
        salesTicketsCOA: COA.services.reserve.ISalesTicketResult[] | null
        completeMailId: string | null
    } {
        return {
            performance: this.performance,
            theater: this.theater,
            reserveSeats: this.reserveSeats,
            reserveTickets: this.reserveTickets,
            input: this.input,
            gmo: this.gmo,
            updateReserve: this.updateReserve,
            transactionMP: this.transactionMP,
            transactionGMO: this.transactionGMO,
            authorizationCOA: this.authorizationCOA,
            authorizationMvtk: this.authorizationMvtk,
            authorizationGMO: this.authorizationGMO,
            authorizationCountGMO: this.authorizationCountGMO,
            orderId: this.orderId,
            expired: this.expired,
            mvtk: this.mvtk,
            performanceCOA: this.performanceCOA,
            salesTicketsCOA: this.salesTicketsCOA,
            completeMailId: this.completeMailId
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
        if (this.transactionMP === null) result = false;
        switch (value) {
            case PurchaseModel.SEAT_STATE:
                break;
            case PurchaseModel.TICKET_STATE:
                if (this.reserveSeats === null) result = false;
                break;
            case PurchaseModel.INPUT_STATE:
                if (this.reserveSeats === null) result = false;
                if (this.reserveTickets === null) result = false;
                break;
            case PurchaseModel.CONFIRM_STATE:
                if (this.reserveSeats === null) result = false;
                if (this.reserveTickets === null) result = false;
                if (this.input === null) result = false;
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
            if (reserveTicket.mvtk_num !== '' && reserveTicket.mvtk_num.length > 0) result = true;
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
            amount += ticket.sale_price;
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
            price += ticket.mvtk_app_price;
        }

        return price;
    }

    /**
     * GMOオーソリ回数取得
     * @memberof PurchaseModel
     * @method authorizationCountGMOToString
     * @returns {string}
     */
    public authorizationCountGMOToString(): string {
        return `00${this.authorizationCountGMO}`.slice(UtilModule.DIGITS_02);
    }

    /**
     * 有効期限確認
     * @memberof PurchaseModel
     * @method isExpired
     * @returns {boolean}
     */
    public isExpired(): boolean {
        return (this.expired < moment().unix());
    }
}
