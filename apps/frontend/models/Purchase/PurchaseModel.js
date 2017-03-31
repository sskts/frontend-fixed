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
        this.authorizationGMO = (session.authorizationGMO !== undefined) ? session.authorizationGMO : null;
        this.orderId = (session.orderId !== undefined) ? session.orderId : null;
        this.expired = (session.expired !== undefined) ? session.expired : null;
        this.mvtk = (session.mvtk !== undefined) ? session.mvtk : null;
        this.performanceCOA = (session.performanceCOA !== undefined) ? session.performanceCOA : null;
        this.salesTicketsCOA = (session.salesTicketsCOA !== undefined) ? session.salesTicketsCOA : null;
    }
    /**
     * セッションObjectへ変換
     * @memberOf PurchaseModel
     * @method toSession
     * @returns {Object} result
     */
    toSession() {
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
            performanceCOA: (this.performanceCOA !== null) ? this.performanceCOA : null,
            salesTicketsCOA: (this.salesTicketsCOA !== null) ? this.salesTicketsCOA : null
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
        let result = true;
        if (this.transactionMP === null)
            result = false;
        switch (value) {
            case PurchaseModel.SEAT_STATE:
                break;
            case PurchaseModel.TICKET_STATE:
                if (this.reserveSeats === null)
                    result = false;
                break;
            case PurchaseModel.INPUT_STATE:
                if (this.reserveSeats === null)
                    result = false;
                if (this.reserveTickets === null)
                    result = false;
                break;
            case PurchaseModel.CONFIRM_STATE:
                if (this.reserveSeats === null)
                    result = false;
                if (this.reserveTickets === null)
                    result = false;
                if (this.input === null)
                    result = false;
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
    getReserveAmount() {
        const reserveTickets = this.reserveTickets;
        let amount = 0;
        if (reserveTickets === null)
            return amount;
        for (const ticket of reserveTickets) {
            amount += ticket.sale_price;
        }
        return amount;
    }
    /**
     * チケット価値取得（チケット価値）
     * @memberOf PurchaseModel
     * @method getPrice
     * @returns {number}
     */
    getPrice() {
        const reserveTickets = this.reserveTickets;
        let price = 0;
        if (reserveTickets === null)
            return price;
        for (const ticket of reserveTickets) {
            price += ticket.sale_price;
            // ムビチケ
            if (ticket.mvtk_num !== '') {
                let mvtkAppPrice = 0;
                if (this.mvtk !== null) {
                    const mvtkTicket = this.mvtk.find((value) => {
                        return (value.code === ticket.mvtk_num && value.ticket.ticket_code === ticket.ticket_code);
                    });
                    if (mvtkTicket !== undefined) {
                        mvtkAppPrice = Number(mvtkTicket.ykknInfo.kijUnip);
                    }
                }
                price += mvtkAppPrice;
            }
            // メガネ
            let glassesPrice = 0;
            if (ticket.glasses) {
                glassesPrice = ticket.add_price_glasses;
            }
            price += glassesPrice;
        }
        return price;
    }
    /**
     * チケット価値取得（チケット価値）
     * @memberOf PurchaseModel
     * @method getPrice
     * @returns {number}
     */
    getMvtkPrice() {
        const reserveTickets = this.reserveTickets;
        let price = 0;
        if (reserveTickets === null)
            return price;
        for (const ticket of reserveTickets) {
            if (ticket.mvtk_num !== '') {
                let mvtkAppPrice = 0;
                // ムビチケ計上単価取得
                if (this.mvtk !== null) {
                    const mvtkTicket = this.mvtk.find((value) => {
                        return (value.code === ticket.mvtk_num && value.ticket.ticket_code === ticket.ticket_code);
                    });
                    if (mvtkTicket !== undefined) {
                        mvtkAppPrice = Number(mvtkTicket.ykknInfo.kijUnip);
                    }
                }
                price += ticket.sale_price + mvtkAppPrice;
            }
        }
        return price;
    }
    /**
     * 座席文言返却
     * @memberOf PurchaseModel
     * @method seatToString
     * @returns {string}
     */
    seatToString() {
        if (this.reserveSeats === null)
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
        if (this.reserveSeats === null)
            return '';
        if (this.reserveTickets === null)
            return '';
        const ticketObj = {};
        const tickets = [];
        for (const ticket of this.reserveTickets) {
            if (ticketObj[ticket.ticket_code] !== undefined) {
                ticketObj[ticket.ticket_code].length += 1;
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
