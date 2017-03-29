import * as COA from '@motionpicture/coa-service';
import * as GMO from '@motionpicture/gmo-service';
import * as MP from '../../../../libs/MP';

/**
 * 購入セッション
 */

/**
 * ReserveTicket
 * @interface IReserveTicket
 */
export interface IReserveTicket {
    /**
     * 座席セクション
     */
    section: string;
    /**
     * 座席番号
     */
    seat_code: string;
    /**
     * チケットコード
     */
    ticket_code: string;
    /**
     * チケット名
     */
    ticket_name: string;
    /**
     * チケット名（英）
     */
    ticket_name_eng: string;
    /**
     * チケット名（カナ）
     */
    ticket_name_kana: string;
    /**
     * 標準単価
     */
    std_price: number;
    /**
     * 加算単価(３Ｄ，ＩＭＡＸ、４ＤＸ等の加算料金)
     */
    add_price: number;
    /**
     * 割引額
     */
    dis_price: number;
    /**
     * 販売単価(標準単価＋加算単価)
     */
    sale_price: number;
    /**
     * メガネ単価
     */
    add_price_glasses: number;
    /**
     * メガネ有り無し(現状ムビチケ)
     */
    glasses: boolean;
    /**
     * ムビチケ購入番号
     */
    mvtk_num: string | null;
}

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
    ykknInfo: IValidTickettResult;
    /**
     * チケット情報
     */
    ticket: COA.MasterService.IMvtkTicketcodeResult;
}

/**
 * 有効券情報
 * @interface IValidTickettResult
 */
export interface IValidTickettResult {
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
}

/**
 * 購入セッション
 * @class PurchaseModel
 */
export class PurchaseModel {
    public static SEAT_STATE: number = 0;
    public static TICKET_STATE: number = 1;
    public static INPUT_STATE: number = 2;
    public static CONFIRM_STATE: number = 3;
    public static COMPLETE_STATE: number = 4;

    /**
     * パフォーマンス
     */
    public performance: MP.IPerformance | null;
    /**
     * 劇場
     */
    public theater: MP.ITheater | null;
    /**
     * COA仮予約
     */
    public reserveSeats: COA.ReserveService.IUpdTmpReserveSeatResult | null;
    /**
     * 予約チケット
     */
    public reserveTickets: IReserveTicket[] | null;
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
    public updateReserve: COA.ReserveService.IUpdReserveResult | null;
    /**
     * 取引MP
     */
    public transactionMP: MP.ITransactionStartResult | null;
    /**
     * 取引GMO
     */
    public transactionGMO: GMO.CreditService.EntryTranResult | null;
    /**
     * COAオーソリ
     */
    public authorizationCOA: MP.IAddCOAAuthorizationResult | null;
    /**
     * GMOオーソリ
     */
    public authorizationGMO: MP.IAddGMOAuthorizationResult | null;
    /**
     * オーダーID
     */
    public orderId: string | null;
    /**
     * 有効期限
     */
    public expired: number | null;
    /**
     * ムビチケ
     */
    public mvtk: IMvtk[] | null;
    /**
     * CAO情報
     */
    public performanceCOA: MP.IPerformanceCOA | null;

    /**
     * @constructor
     * @param {any} session
     */
    constructor(session: any) {
        if (session === undefined) {
            session = {};
        }

        this.performance = (session.performance !== undefined) ? (<any>session).performance : null;
        this.theater = (session.theater !== undefined) ? (<any>session).theater : null;
        this.reserveSeats = (session.reserveSeats !== undefined) ? (<any>session).reserveSeats : null;
        this.reserveTickets = (session.reserveTickets !== undefined) ? (<any>session).reserveTickets : null;
        this.input = (session.input !== undefined) ? (<any>session).input : null;
        this.gmo = (session.gmo !== undefined) ? (<any>session).gmo : null;
        this.updateReserve = (session.updateReserve !== undefined) ? (<any>session).updateReserve : null;
        this.transactionMP = (session.transactionMP !== undefined) ? (<any>session).transactionMP : null;
        this.transactionGMO = (session.transactionGMO !== undefined) ? (<any>session).transactionGMO : null;
        this.authorizationCOA = (session.authorizationCOA !== undefined) ? (<any>session).authorizationCOA : null;
        this.authorizationGMO = (session.authorizationGMO !== undefined) ? (<any>session).authorizationGMO : null;
        this.orderId = (session.orderId !== undefined) ? (<any>session).orderId : null;
        this.expired = (session.expired !== undefined) ? (<any>session).expired : null;
        this.mvtk = (session.mvtk !== undefined) ? (<any>session).mvtk : null;
        this.performanceCOA = (session.performanceCOA !== undefined) ? (<any>session).performanceCOA : null;
    }

    /**
     * セッションObjectへ変換
     * @memberOf PurchaseModel
     * @method toSession
     * @returns {Object} result
     */
    public toSession(): {
        performance: MP.IPerformance | null,
        theater: MP.ITheater | null;
        reserveSeats: COA.ReserveService.IUpdTmpReserveSeatResult | null,
        reserveTickets: IReserveTicket[] | null,
        input: IInput | null,
        gmo: IGMO | null,
        updateReserve: COA.ReserveService.IUpdReserveResult | null,
        transactionMP: MP.ITransactionStartResult | null,
        transactionGMO: GMO.CreditService.EntryTranResult | null,
        authorizationCOA: MP.IAddCOAAuthorizationResult | null,
        authorizationGMO: MP.IAddGMOAuthorizationResult | null,
        orderId: string | null,
        expired: number | null,
        mvtk: IMvtk[] | null,
        performanceCOA: MP.IPerformanceCOA | null
    } {
        return {
            performance: (this.performance !== null) ? this.performance : null,
            theater: (this.theater !== null) ? this.theater : null,
            reserveSeats: (this.reserveSeats !== null) ? this.reserveSeats : null,
            reserveTickets: (this.reserveTickets !== null) ? this.reserveTickets : null,
            input: (this.input !== null) ? this.input : null,
            gmo: (this.gmo !== null) ? this.gmo : null,
            updateReserve: (this.updateReserve !== null) ? this.updateReserve : null,
            transactionMP: (this.transactionMP !== null) ? this.transactionMP : null,
            transactionGMO: (this.transactionGMO !== null) ? this.transactionGMO : null,
            authorizationCOA: (this.authorizationCOA !== null) ? this.authorizationCOA : null,
            authorizationGMO: (this.authorizationGMO !== null) ? this.authorizationGMO : null,
            orderId: (this.orderId !== null) ? this.orderId : null,
            expired: (this.expired !== null) ? this.expired : null,
            mvtk: (this.mvtk !== null) ? this.mvtk : null,
            performanceCOA: (this.performanceCOA !== null) ? this.performanceCOA : null
        };
    }

    /**
     * ステータス確認
     * @memberOf PurchaseModel
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
     * 予約金額取得（決済する分）
     * @memberOf PurchaseModel
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
     * 座席文言返却
     * @memberOf PurchaseModel
     * @method seatToString
     * @returns {string}
     */
    public seatToString(): string {
        if (this.reserveSeats === null) return '';
        const seats = [];
        for (const seat of this.reserveSeats.list_tmp_reserve) {
            seats.push(seat.seat_num);
        }
        return seats.join('、');
    }

    /**
     * 券種文言返却
     * @memberOf PurchaseModel
     * @method ticketToString
     * @returns {string}
     */
    public ticketToString(): string {
        if (this.reserveSeats === null) return '';
        if (this.reserveTickets === null) return '';
        const ticketObj = {};
        const tickets = [];
        for (const ticket of this.reserveTickets) {
            let target = (<any>ticketObj)[ticket.ticket_code];
            if (target !== undefined) {
                target.length = <number>(target.length) + 1;
            } else {
                target = {
                    name: ticket.ticket_name,
                    length: 1
                };
            }
        }
        for (const key of Object.keys(ticketObj)) {
            const ticket = (<any>ticketObj)[key];
            tickets.push(`${ticket.name} × ${ticket.length}`);
        }

        return tickets.join('、');
    }
}
