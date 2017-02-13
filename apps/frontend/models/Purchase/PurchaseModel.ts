import COA = require("@motionpicture/coa-service");
import MP = require('../../../../libs/MP');
import GMO = require("@motionpicture/gmo-service");


export interface Args {
    id: string;
}

export interface ReserveTicket {
    section: string;
    seat_code: string;
    ticket_code: string;
    ticket_name_ja: string;
    ticket_name_en: string;
    ticket_name_kana: string;
    std_price: number;
    add_price: number;
    dis_price: number;
    sale_price: number;
}

export interface Input {
    last_name_hira: string;
    first_name_hira: string;
    mail_addr: string;
    mail_confirm: string;
    tel_num: string;
    agree: string;
}

export interface GMO {
    token: string;
}

/**
 * 購入セッション
 */
export class PurchaseModel {
    public static SEAT_STATE = 0;
    public static TICKET_STATE = 1;
    public static INPUT_STATE = 2;
    public static CONFIRM_STATE = 3;
    public static COMPLETE_STATE = 4;

    public performance: MP.Performance | null;
    public reserveSeats: COA.reserveSeatsTemporarilyInterface.Result | null;
    public reserveTickets: ReserveTicket[] | null;
    public input: Input | null;
    public gmo: GMO | null;
    public updateReserve: COA.updateReserveInterface.Result | null;
    public transactionMP: MP.transactionStart.Result | null;
    public transactionGMO: GMO.CreditService.entryTranInterface.Result | null;
    public authorizationCOA: MP.addCOAAuthorization.Result | null;
    public authorizationGMO: MP.addGMOAuthorization.Result | null;
    public orderId: string | null;
    public expired: number | null; 

    constructor(session: any) {
        if (!session) {
            session = {};
        }

        this.performance = (session.performance) ? session.performance : null;
        this.reserveSeats = (session.reserveSeats) ? session.reserveSeats : null;
        this.reserveTickets = (session.reserveTickets) ? session.reserveTickets : null;
        this.input = (session.input) ? session.input : null;
        this.gmo = (session.gmo) ? session.gmo : null;
        this.updateReserve = (session.updateReserve) ? session.updateReserve : null;
        this.transactionMP = (session.transactionMP) ? session.transactionMP : null;
        this.transactionGMO = (session.transactionGMO) ? session.transactionGMO : null;
        this.authorizationCOA = (session.authorizationCOA) ? session.authorizationCOA : null;
        this.authorizationGMO = (session.authorizationGMO) ? session.authorizationGMO : null;
        this.orderId = (session.orderId) ? session.orderId : null;
        this.expired = (session.expired) ? session.expired : null;


    }

    /**
     * セッションObjectへ変換
     */
    public formatToSession(): {
        performance: MP.Performance | null,
        reserveSeats: COA.reserveSeatsTemporarilyInterface.Result | null,
        reserveTickets: ReserveTicket[] | null,
        input: Input | null,
        gmo: GMO | null,
        updateReserve: COA.updateReserveInterface.Result | null,
        transactionMP: MP.transactionStart.Result | null,
        transactionGMO: GMO.CreditService.entryTranInterface.Result | null,
        authorizationCOA: MP.addCOAAuthorization.Result | null,
        authorizationGMO: MP.addGMOAuthorization.Result | null,
        orderId: string | null,
        expired: number | null,
    } {

        return {
            performance: (this.performance) ? this.performance : null,
            reserveSeats: (this.reserveSeats) ? this.reserveSeats : null,
            reserveTickets: (this.reserveTickets) ? this.reserveTickets : null,
            input: (this.input) ? this.input : null,
            gmo: (this.gmo) ? this.gmo : null,
            updateReserve: (this.updateReserve) ? this.updateReserve : null,
            transactionMP: (this.transactionMP) ? this.transactionMP : null,
            transactionGMO: (this.transactionGMO) ? this.transactionGMO : null,
            authorizationCOA: (this.authorizationCOA) ? this.authorizationCOA : null,
            authorizationGMO: (this.authorizationGMO) ? this.authorizationGMO : null,
            orderId: (this.orderId) ? this.orderId : null,
            expired: (this.expired) ? this.expired : null,
        };
    }


    /**
     * ステータス確認
     */
    public accessAuth(value: number): boolean {
        let result: boolean = false;
        if (value === PurchaseModel.SEAT_STATE) {
            if (this.transactionMP) result = true;
        } else if (value === PurchaseModel.TICKET_STATE) {
            if (this.transactionMP && this.performance && this.reserveSeats) result = true;
        } else if (value === PurchaseModel.INPUT_STATE) {
            if (this.transactionMP && this.performance && this.reserveSeats && this.reserveTickets) result = true;
        } else if (value === PurchaseModel.CONFIRM_STATE) {
            if (this.transactionMP && this.performance && this.reserveSeats && this.reserveTickets && this.input && this.gmo) result = true;
        } else if (value === PurchaseModel.COMPLETE_STATE) {
            result = true;
        }
        return result;
    }

    /**
     * 合計金額取得
     */
    public getReserveAmount(): number {
        const reserveTickets = this.reserveTickets;
        let amount = 0;
        if (!reserveTickets) return amount;
        for (const ticket of reserveTickets) {
            amount += ticket.sale_price;
        }
        return amount;
    }

    /**
     * チケットリスト返却
     */
    public getTicketList(): {
        ticket_code: string,
        std_price: number,  /** 標準単価 */
        add_price: number, /** 加算単価 */
        dis_price: number, /** 割引額 */
        sale_price: number, /** 金額 */
        ticket_count: number, /** 枚数 */
        seat_num: string, /** 座席番号 */
    }[] {
        const results = [];
        if (!this.reserveTickets) return [];
        for (const ticket of this.reserveTickets) {
            results.push({
                ticket_code: ticket.ticket_code,
                std_price: ticket.std_price,
                add_price: ticket.add_price,
                dis_price: 0,
                sale_price: ticket.sale_price,
                ticket_count: 1,
                seat_num: ticket.seat_code
            });
        }
        return results;
    }
}

