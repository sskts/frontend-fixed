"use strict";
class PurchaseModel {
    constructor(purchaseSession) {
        if (!purchaseSession) {
            purchaseSession = {};
        }
        this.performance = (purchaseSession.performance) ? purchaseSession.performance : null;
        this.reserveSeats = (purchaseSession.reserveSeats) ? purchaseSession.reserveSeats : null;
        this.reserveTickets = (purchaseSession.reserveTickets) ? purchaseSession.reserveTickets : null;
        this.input = (purchaseSession.input) ? purchaseSession.input : null;
        this.gmo = (purchaseSession.gmo) ? purchaseSession.gmo : null;
        this.updateReserve = (purchaseSession.updateReserve) ? purchaseSession.updateReserve : null;
    }
    formatToSession() {
        return {
            performance: (this.performance) ? this.performance : null,
            reserveSeats: (this.reserveSeats) ? this.reserveSeats : null,
            reserveTickets: (this.reserveTickets) ? this.reserveTickets : null,
            input: (this.input) ? this.input : null,
            gmo: (this.gmo) ? this.gmo : null,
            updateReserve: (this.updateReserve) ? this.updateReserve : null,
        };
    }
    checkAccess(value, next) {
        let result = false;
        if (value === PurchaseModel.SEAT_STATE) {
            result = true;
        }
        else if (value === PurchaseModel.TICKET_STATE) {
            if (this.performance && this.reserveSeats)
                result = true;
        }
        else if (value === PurchaseModel.INPUT_STATE) {
            if (this.performance && this.reserveSeats && this.reserveTickets)
                result = true;
        }
        else if (value === PurchaseModel.CONFIRM_STATE) {
            if (this.performance && this.reserveSeats && this.reserveTickets && this.input && this.gmo)
                result = true;
        }
        else if (value === PurchaseModel.COMPLETE_STATE) {
            result = true;
        }
        if (!result) {
            return next(new Error('無効なアクセスです'));
        }
    }
    getReserveAmount() {
        let reserveSeats = this.reserveSeats;
        let reserveTickets = this.reserveTickets;
        let amount = 0;
        if (!reserveSeats || !reserveTickets)
            return amount;
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
    getTicketList() {
        let results = [];
        if (!this.reserveTickets)
            return [];
        for (let ticket of this.reserveTickets.tickets) {
            results.push({
                ticket_code: ticket.info.ticket_code,
                std_price: ticket.info.std_price,
                add_price: ticket.info.add_price,
                dis_price: 0,
                sale_price: ticket.info.sale_price,
                ticket_count: ticket.info.limit_count,
                seat_num: ticket.seat_num,
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
