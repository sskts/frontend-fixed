import COA = require("@motionpicture/coa-service");
import MP = require('../../../../libs/MP');
import GMO = require("@motionpicture/gmo-service");


export interface Args {
    id: string
}

export interface ReserveTickets {
    tickets: Array<{
        seat_num: string,
        info: {
            /** チケットコード */
            ticket_code: string,
            /** チケット名 */
            ticket_name: string,
            /** チケット名（カナ） */
            ticket_name_kana: string,
            /** チケット名（英） */
            ticket_name_eng: string,
            /** 標準単価 */
            std_price: number,
            /** 加算単価(３Ｄ，ＩＭＡＸ、４ＤＸ等の加算料金) */
            add_price: number,
            /** 販売単価(標準単価＋加算単価) */
            sale_price: number,
            /** 人数制限(制限が無い場合は１) */
            limit_count: number,
            /** 制限単位(１：ｎ人単位、２：ｎ人以上) */
            limit_unit: string,
            /** チケット備考(注意事項等) */
            ticket_note: string,
        }
    }>
}

export interface Input {
    /** せい */
    last_name_hira: string,
    /** めい */
    first_name_hira: string,
    /** メールアドレス */
    mail_addr: string,
    /** 電話番号*/
    tel_num: string,
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
    public reserveTickets: ReserveTickets | null;
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
    /**パフォーマンス */
    public owners: MP.ownerAnonymousCreate.Result | null;
    /**オーナー */
    public authorizationCOA: MP.addCOAAuthorization.Result | null;
    /**GMOオーソリ */
    public authorizationGMO: MP.addGMOAuthorization.Result | null;
    /**オーダーID */
    public orderId: string | null;

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
        this.owners = (purchaseSession.owners) ? purchaseSession.owners : null;
        this.authorizationCOA = (purchaseSession.authorizationCOA) ? purchaseSession.authorizationCOA : null;
        this.authorizationGMO = (purchaseSession.authorizationGMO) ? purchaseSession.authorizationGMO : null;
        this.orderId = (purchaseSession.orderId) ? purchaseSession.orderId : null;
        


    }

    /**
     * セッションObjectへ変換
     */
    public formatToSession(): {
        performance: MP.performance | null,
        reserveSeats: COA.reserveSeatsTemporarilyInterface.Result | null,
        reserveTickets: ReserveTickets | null,
        input: Input | null,
        gmo: GMO | null,
        updateReserve: COA.updateReserveInterface.Result | null,
        transactionMP: MP.transactionStart.Result | null,
        transactionGMO: GMO.CreditService.entryTranInterface.Result | null,
        owners: MP.ownerAnonymousCreate.Result | null,
        authorizationCOA: MP.addCOAAuthorization.Result | null,
        authorizationGMO: MP.addGMOAuthorization.Result | null,
        orderId: string | null,
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
            owners: (this.owners) ? this.owners : null,
            authorizationCOA: (this.authorizationCOA) ? this.authorizationCOA : null,
            authorizationGMO: (this.authorizationGMO) ? this.authorizationGMO : null,
            orderId: (this.orderId) ? this.orderId : null,
        };
    }


    /**
     * ステータス確認
     */
    public checkAccess(value: number): boolean {
        let result: boolean = false;
        if (value === PurchaseModel.SEAT_STATE) {
            result = true;
        } else if (value === PurchaseModel.TICKET_STATE) {
            if (this.transactionMP && this.owners && this.performance && this.reserveSeats) result = true;
        } else if (value === PurchaseModel.INPUT_STATE) {
            if (this.transactionMP && this.owners && this.performance && this.reserveSeats && this.reserveTickets) result = true;
        } else if (value === PurchaseModel.CONFIRM_STATE) {
            if (this.transactionMP && this.owners && this.performance && this.reserveSeats && this.reserveTickets && this.input && this.gmo) result = true;
        } else if (value === PurchaseModel.COMPLETE_STATE) {
            result = true;
        }
        return result;
    }

    /**
     * 合計金額取得
     */
    public getReserveAmount(): number {
        let reserveSeats = this.reserveSeats;
        let reserveTickets = this.reserveTickets;
        let amount = 0;
        if (!reserveSeats || !reserveTickets) return amount;
        for (let seat of reserveSeats.list_tmp_reserve) {
            for (let ticket of reserveTickets.tickets) {
                if (ticket.seat_num === seat.seat_num) {
                    amount += ticket.info.sale_price;
                    break;
                }
            }
        }
        return amount;
    }

    /**
     * チケットリスト返却
     */
    public getTicketList(): Array<{
        ticket_code: string, /** チケットコード */
        std_price: number,  /** 標準単価 */
        add_price: number, /** 加算単価 */
        dis_price: number, /** 割引額 */
        sale_price: number, /** 金額 */
        ticket_count: number, /** 枚数 */
        seat_num: string, /** 座席番号 */
    }> {
        let results = [];
        if (!this.reserveTickets) return [];
        for (let ticket of this.reserveTickets.tickets) {
            results.push({
                ticket_code: ticket.info.ticket_code, /** チケットコード */
                std_price: ticket.info.std_price,  /** 標準単価 */
                add_price: ticket.info.add_price, /** 加算単価 */
                dis_price: 0, /** 割引額 */
                sale_price: ticket.info.sale_price, /** 金額 */
                ticket_count: ticket.info.limit_count, /** 枚数 */
                seat_num: ticket.seat_num, /** 座席番号 */
            });
        }
        return results;
    }
}

