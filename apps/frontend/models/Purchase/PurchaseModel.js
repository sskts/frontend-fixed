"use strict";
/**
 * 購入セッション
 * @class
 */
class PurchaseModel {
    /**
     * @constructor
     */
    constructor(session) {
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
     * @method
     */
    formatToSession() {
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
            expired: (this.expired) ? this.expired : null
        };
    }
    /**
     * ステータス確認
     * @method
     */
    accessAuth(value) {
        let result = false;
        if (value === PurchaseModel.SEAT_STATE) {
            if (this.transactionMP)
                result = true;
        }
        else if (value === PurchaseModel.TICKET_STATE) {
            if (this.transactionMP && this.performance && this.reserveSeats)
                result = true;
        }
        else if (value === PurchaseModel.INPUT_STATE) {
            if (this.transactionMP && this.performance && this.reserveSeats && this.reserveTickets)
                result = true;
        }
        else if (value === PurchaseModel.CONFIRM_STATE) {
            if (this.transactionMP && this.performance && this.reserveSeats && this.reserveTickets && this.input && this.gmo)
                result = true;
        }
        else if (value === PurchaseModel.COMPLETE_STATE) {
            result = true;
        }
        return result;
    }
    /**
     * 合計金額取得
     * @method
     */
    getReserveAmount() {
        const reserveTickets = this.reserveTickets;
        let amount = 0;
        if (!reserveTickets)
            return amount;
        for (const ticket of reserveTickets) {
            amount += ticket.sale_price;
        }
        return amount;
    }
    /**
     * チケットリスト返却
     * @method
     */
    getTicketList() {
        const results = [];
        if (!this.reserveTickets)
            return [];
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
PurchaseModel.SEAT_STATE = 0;
PurchaseModel.TICKET_STATE = 1;
PurchaseModel.INPUT_STATE = 2;
PurchaseModel.CONFIRM_STATE = 3;
PurchaseModel.COMPLETE_STATE = 4;
exports.PurchaseModel = PurchaseModel;
