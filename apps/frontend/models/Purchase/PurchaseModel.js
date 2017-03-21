"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 購入セッション
 * @class PurchaseModel
 */
class PurchaseModel {
    /**
     * @constructor
     * @param {any} session
     */
    constructor(session) {
        if (!session) {
            session = {};
        }
        this.performance = (session.performance) ? session.performance : null;
        this.theater = (session.theater) ? session.theater : null;
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
        this.mvtk = (session.mvtk) ? session.mvtk : null;
        this.performanceCOA = (session.performanceCOA) ? session.performanceCOA : null;
    }
    /**
     * セッションObjectへ変換
     * @memberOf PurchaseModel
     * @method toSession
     * @returns {Object} result
     */
    toSession() {
        return {
            performance: (this.performance) ? this.performance : null,
            theater: (this.theater) ? this.theater : null,
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
            mvtk: (this.mvtk) ? this.mvtk : null,
            performanceCOA: (this.performanceCOA) ? this.performanceCOA : null
        };
    }
    /**
     * ステータス確認
     * @memberOf PurchaseModel
     * @method accessAuth
     * @param {number} value
     * @returns {boolean}
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
            if (this.transactionMP && this.performance && this.reserveSeats && this.reserveTickets && this.input)
                result = true;
        }
        else if (value === PurchaseModel.COMPLETE_STATE) {
            result = true;
        }
        return result;
    }
    /**
     * 予約金額取得（決済する分）
     * @memberOf PurchaseModel
     * @method getReserveAmount
     * @returns {number}
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
     * 座席文言返却
     * @memberOf PurchaseModel
     * @method seatToString
     * @returns {string}
     */
    seatToString() {
        if (!this.reserveSeats)
            return '';
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
    ticketToString() {
        if (!this.reserveSeats)
            return '';
        if (!this.reserveTickets)
            return '';
        const ticketObj = {};
        const tickets = [];
        for (const ticket of this.reserveTickets) {
            if (ticketObj[ticket.ticket_code]) {
                ticketObj[ticket.ticket_code].length = (ticketObj[ticket.ticket_code].length) + 1;
            }
            else {
                ticketObj[ticket.ticket_code] = {
                    name: ticket.ticket_name,
                    length: 1
                };
            }
        }
        for (const key of Object.keys(ticketObj)) {
            const ticket = ticketObj[key];
            tickets.push(`${ticket.name} × ${ticket.length}`);
        }
        return tickets.join('、');
    }
}
PurchaseModel.SEAT_STATE = 0;
PurchaseModel.TICKET_STATE = 1;
PurchaseModel.INPUT_STATE = 2;
PurchaseModel.CONFIRM_STATE = 3;
PurchaseModel.COMPLETE_STATE = 4;
exports.PurchaseModel = PurchaseModel;
