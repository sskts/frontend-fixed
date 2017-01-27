import COA = require("@motionpicture/coa-service");
import MP = require('../../../../libs/MP');
import GMO = require("@motionpicture/gmo-service");


export interface Args {
    id: string
}

export interface ReserveTicket {
    /** 座席セクション */
    section: string,
    /** 座席番号 */
    seat_code: string,
    /** チケットコード */
    ticket_code: string,
    /** チケット名 */
    ticket_name_ja: string,
    /** チケット名（英） */
    ticket_name_en: string,
    /** チケット名（カナ） */
    ticket_name_kana: string,
    /** 標準単価 */
    std_price: number,
    /** 加算単価(３Ｄ，ＩＭＡＸ、４ＤＸ等の加算料金) */
    add_price: number,
    /** TODO */
    dis_price: number,
    /** 販売単価(標準単価＋加算単価) */
    sale_price: number
}

export interface Input {
    /** せい */
    last_name_hira: string,
    /** めい */
    first_name_hira: string,
    /** メールアドレス */
    mail_addr: string,
    /** メールアドレス確認 */
    mail_confirm: string,
    /** 電話番号*/
    tel_num: string,
    /** 利用規約 */
    agree: string,
}

export interface GMO {
    /** トークン */
    token: string,
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

    /**パフォーマンス */
    public performance: MP.performance | null;
    /**COA仮予約 */
    public reserveSeats: COA.reserveSeatsTemporarilyInterface.Result | null;
    /**予約チケット */
    public reserveTickets: Array<ReserveTicket> | null;
    /**入力情報 */
    public input: Input | null;
    /**GMO TOKEN情報 */
    public gmo: GMO | null;
    /**COA本予約 */
    public updateReserve: COA.updateReserveInterface.Result | null;
    /**取引MP */
    public transactionMP: MP.transactionStart.Result | null;
    /**取引GMO */
    public transactionGMO: GMO.CreditService.entryTranInterface.Result | null;
    /**オーナー */
    public owner: MP.ownerAnonymousCreate.Result | null;
    /**COAオーソリ */
    public authorizationCOA: MP.addCOAAuthorization.Result | null;
    /**GMOオーソリ */
    public authorizationGMO: MP.addGMOAuthorization.Result | null;
    /**オーダーID */
    public orderId: string | null;
    /**運営者 */
    public administrator: MP.getAdministrator.Result | null;
    /**有効期限 */
    public expired: number | null; 

    constructor(purchaseSession: any) {
        if (!purchaseSession) {
            purchaseSession = {};
        }

        this.performance = (purchaseSession.performance) ? purchaseSession.performance : null;
        this.reserveSeats = (purchaseSession.reserveSeats) ? purchaseSession.reserveSeats : null;
        this.reserveTickets = (purchaseSession.reserveTickets) ? purchaseSession.reserveTickets : null;
        this.input = (purchaseSession.input) ? purchaseSession.input : null;
        this.gmo = (purchaseSession.gmo) ? purchaseSession.gmo : null;
        this.updateReserve = (purchaseSession.updateReserve) ? purchaseSession.updateReserve : null;
        this.transactionMP = (purchaseSession.transactionMP) ? purchaseSession.transactionMP : null;
        this.transactionGMO = (purchaseSession.transactionGMO) ? purchaseSession.transactionGMO : null;
        this.owner = (purchaseSession.owner) ? purchaseSession.owner : null;
        this.authorizationCOA = (purchaseSession.authorizationCOA) ? purchaseSession.authorizationCOA : null;
        this.authorizationGMO = (purchaseSession.authorizationGMO) ? purchaseSession.authorizationGMO : null;
        this.orderId = (purchaseSession.orderId) ? purchaseSession.orderId : null;
        this.administrator = (purchaseSession.administrator) ? purchaseSession.administrator : null;
        this.expired = (purchaseSession.expired) ? purchaseSession.expired : null;


    }

    /**
     * セッションObjectへ変換
     */
    public formatToSession(): {
        performance: MP.performance | null,
        reserveSeats: COA.reserveSeatsTemporarilyInterface.Result | null,
        reserveTickets: Array<ReserveTicket> | null,
        input: Input | null,
        gmo: GMO | null,
        updateReserve: COA.updateReserveInterface.Result | null,
        transactionMP: MP.transactionStart.Result | null,
        transactionGMO: GMO.CreditService.entryTranInterface.Result | null,
        owner: MP.ownerAnonymousCreate.Result | null,
        authorizationCOA: MP.addCOAAuthorization.Result | null,
        authorizationGMO: MP.addGMOAuthorization.Result | null,
        orderId: string | null,
        administrator: MP.getAdministrator.Result | null,
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
            owner: (this.owner) ? this.owner : null,
            authorizationCOA: (this.authorizationCOA) ? this.authorizationCOA : null,
            authorizationGMO: (this.authorizationGMO) ? this.authorizationGMO : null,
            orderId: (this.orderId) ? this.orderId : null,
            administrator: (this.administrator) ? this.administrator : null,
            expired: (this.expired) ? this.expired : null,
        };
    }


    /**
     * ステータス確認
     */
    public accessAuth(value: number): boolean {
        let result: boolean = false;
        if (value === PurchaseModel.SEAT_STATE) {
            if (this.transactionMP && this.owner) result = true;
        } else if (value === PurchaseModel.TICKET_STATE) {
            if (this.transactionMP && this.owner && this.performance && this.reserveSeats) result = true;
        } else if (value === PurchaseModel.INPUT_STATE) {
            if (this.transactionMP && this.owner && this.performance && this.reserveSeats && this.reserveTickets) result = true;
        } else if (value === PurchaseModel.CONFIRM_STATE) {
            if (this.transactionMP && this.owner && this.performance && this.reserveSeats && this.reserveTickets && this.input && this.gmo) result = true;
        } else if (value === PurchaseModel.COMPLETE_STATE) {
            result = true;
        }
        return result;
    }

    /**
     * 合計金額取得
     */
    public getReserveAmount(): number {
        let reserveTickets = this.reserveTickets;
        let amount = 0;
        if (!reserveTickets) return amount;
        for (let ticket of reserveTickets) {
            amount += ticket.sale_price;
        }
        return amount;
    }

    /**
     * チケットリスト返却
     */
    public getTicketList(): Array<{
        ticket_code: string, 
        std_price: number,  /** 標準単価 */
        add_price: number, /** 加算単価 */
        dis_price: number, /** 割引額 */
        sale_price: number, /** 金額 */
        ticket_count: number, /** 枚数 */
        seat_num: string, /** 座席番号 */
    }> {
        let results = [];
        if (!this.reserveTickets) return [];
        for (let ticket of this.reserveTickets) {
            results.push({
                ticket_code: ticket.ticket_code, /** チケットコード */
                std_price: ticket.std_price,  /** 標準単価 */
                add_price: ticket.add_price, /** 加算単価 */
                dis_price: 0, /** 割引額 */
                sale_price: ticket.sale_price, /** 金額 */
                ticket_count: 1, /** 枚数 */
                seat_num: ticket.seat_code, /** 座席番号 */
            });
        }
        return results;
    }
}

