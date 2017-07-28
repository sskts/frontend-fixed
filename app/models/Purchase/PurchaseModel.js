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
        this.individualScreeningEvent = (session.individualScreeningEvent !== undefined) ? session.individualScreeningEvent : null;
        this.seller = (session.seller !== undefined) ? session.seller : null;
        this.transaction = (session.transaction !== undefined) ? session.transaction : null;
        this.salesTickets = (session.salesTickets !== undefined) ? session.salesTickets : null;
        this.reserveTickets = (session.reserveTickets !== undefined) ? session.reserveTickets : null;
        this.seatReservationAuthorization = (session.seatReservationAuthorization !== undefined)
            ? session.seatReservationAuthorization : null;
        this.orderId = (session.orderId !== undefined) ? session.orderId : null;
        this.orderCount = (session.orderCount !== undefined) ? session.orderCount : null;
        this.gmoAuthorization = (session.gmoAuthorization !== undefined) ? session.gmoAuthorization : null;
        this.profile = (session.profile !== undefined) ? session.profile : null;
        this.gmo = (session.gmo !== undefined) ? session.gmo : null;
        this.mvtk = (session.mvtk !== undefined) ? session.mvtk : null;
        this.mvtkAuthorization = (session.mvtkAuthorization !== undefined) ? session.mvtkAuthorization : null;
        this.expired = (session.expired !== undefined) ? session.expired : null;
    }
    /**
     * セッションObjectへ変換
     * @memberof PurchaseModel
     * @method toSession
     * @returns {Object} result
     */
    toSession() {
        return {
            individualScreeningEvent: this.individualScreeningEvent,
            seller: this.seller,
            transaction: this.transaction,
            salesTickets: this.salesTickets,
            reserveTickets: this.reserveTickets,
            seatReservationAuthorization: this.seatReservationAuthorization,
            orderId: this.orderId,
            orderCount: this.orderCount,
            gmoAuthorization: this.gmoAuthorization,
            profile: this.profile,
            gmo: this.gmo,
            mvtk: this.mvtk,
            mvtkAuthorization: this.mvtkAuthorization,
            expired: this.expired
        };
    }
    /**
     * ステータス確認
     * @memberof PurchaseModel
     * @method accessAuth
     * @param {number} value
     * @returns {boolean}
     */
    accessAuth(value) {
        let result = true;
        if (this.transaction === null)
            result = false;
        switch (value) {
            case PurchaseModel.SEAT_STATE:
                break;
            case PurchaseModel.TICKET_STATE:
                if (this.seatReservationAuthorization === null)
                    result = false;
                break;
            case PurchaseModel.INPUT_STATE:
                if (this.seatReservationAuthorization === null)
                    result = false;
                break;
            case PurchaseModel.CONFIRM_STATE:
                if (this.seatReservationAuthorization === null)
                    result = false;
                if (this.profile === null)
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
     * @memberof PurchaseModel
     * @method isReserveMvtkTicket
     * @returns {boolean}
     */
    isReserveMvtkTicket() {
        let result = false;
        if (this.reserveTickets === null)
            return result;
        for (const reserveTicket of this.reserveTickets) {
            if (reserveTicket.mvtkNum !== '' && reserveTicket.mvtkNum.length > 0)
                result = true;
        }
        return result;
    }
    /**
     * 予約金額取得（決済する分）
     * @memberof PurchaseModel
     * @method getReserveAmount
     * @returns {number}
     */
    getReserveAmount() {
        const reserveTickets = this.reserveTickets;
        let amount = 0;
        if (reserveTickets === null)
            return amount;
        for (const ticket of reserveTickets) {
            amount += ticket.salePrice;
        }
        return amount;
    }
    /**
     * チケット価値取得（チケット価値）
     * @memberof PurchaseModel
     * @method getPrice
     * @returns {number}
     */
    getPrice() {
        return (this.getReserveAmount() + this.getMvtkPrice());
    }
    /**
     * ムビチケ計上単価合計取得
     * @memberof PurchaseModel
     * @method getMvtkPrice
     * @returns {number}
     */
    getMvtkPrice() {
        const reserveTickets = this.reserveTickets;
        let price = 0;
        if (reserveTickets === null)
            return price;
        for (const ticket of reserveTickets) {
            price += ticket.mvtkAppPrice;
        }
        return price;
    }
    /**
     * GMOオーソリ回数取得
     * @memberof PurchaseModel
     * @method orderCountToString
     * @returns {string}
     */
    orderCountToString() {
        return `00${this.orderCount}`.slice(UtilModule.DIGITS_02);
    }
    /**
     * 有効期限確認
     * @memberof PurchaseModel
     * @method isExpired
     * @returns {boolean}
     */
    isExpired() {
        return (this.expired < moment().toDate());
    }
    /**
     * 会員判定
     * @returns {boolean}
     */
    isMember() {
        return false;
    }
}
PurchaseModel.PERFORMANCE_STATE = 0;
PurchaseModel.SEAT_STATE = 1;
PurchaseModel.TICKET_STATE = 2;
PurchaseModel.INPUT_STATE = 3;
PurchaseModel.CONFIRM_STATE = 4;
PurchaseModel.COMPLETE_STATE = 5;
exports.PurchaseModel = PurchaseModel;
