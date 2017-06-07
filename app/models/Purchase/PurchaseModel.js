"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const UtilModule = require("../../modules/Util/UtilModule");
/**
 * 購入セッション
 * @class PurchaseModel
 */
class PurchaseModel {
    /**
     * @constructor
     * @param {any} session
     */
    // tslint:disable-next-line:cyclomatic-complexity
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
     * @memberOf PurchaseModel
     * @method toSession
     * @returns {Object} result
     */
    toSession() {
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
     * ムビチケ券有無判定
     * @memberOf PurchaseModel
     * @method isReserveMvtkTicket
     * @returns {boolean}
     */
    isReserveMvtkTicket() {
        let result = false;
        if (this.reserveTickets === null)
            return result;
        for (const reserveTicket of this.reserveTickets) {
            if (reserveTicket.mvtk_num !== '' && reserveTicket.mvtk_num.length > 0)
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
        return (this.getReserveAmount() + this.getMvtkPrice());
    }
    /**
     * ムビチケ計上単価合計取得
     * @memberOf PurchaseModel
     * @method getMvtkPrice
     * @returns {number}
     */
    getMvtkPrice() {
        const reserveTickets = this.reserveTickets;
        let price = 0;
        if (reserveTickets === null)
            return price;
        for (const ticket of reserveTickets) {
            price += ticket.mvtk_app_price;
        }
        return price;
    }
    /**
     * GMOオーソリ回数取得
     * @memberOf PurchaseModel
     * @method authorizationCountGMOToString
     * @returns {string}
     */
    authorizationCountGMOToString() {
        return `00${this.authorizationCountGMO}`.slice(UtilModule.DIGITS_02);
    }
    /**
     * 有効期限確認
     * @memberOf PurchaseModel
     * @method isExpired
     * @returns {boolean}
     */
    isExpired() {
        return (this.expired < moment().unix());
    }
}
PurchaseModel.PERFORMANCE_STATE = 0;
PurchaseModel.SEAT_STATE = 1;
PurchaseModel.TICKET_STATE = 2;
PurchaseModel.INPUT_STATE = 3;
PurchaseModel.CONFIRM_STATE = 4;
PurchaseModel.COMPLETE_STATE = 5;
exports.PurchaseModel = PurchaseModel;
