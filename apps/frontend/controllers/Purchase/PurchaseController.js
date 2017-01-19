"use strict";
const BaseController_1 = require('../BaseController');
const COA = require("@motionpicture/coa-service");
class PurchaseController extends BaseController_1.default {
    deleteSession() {
        if (!this.req.session)
            return;
        delete this.req.session['purchaseInfo'];
        delete this.req.session['reserveSeats'];
        delete this.req.session['reserveTickets'];
        delete this.req.session['updateReserve'];
        delete this.req.session['gmoTokenObject'];
    }
    getScreenStateReserve() {
        COA.getStateReserveSeatInterface.call(this.req.body).then((result) => {
            this.res.json({
                err: null,
                result: result
            });
        }, (err) => {
            this.res.json({
                err: err,
                result: null
            });
        });
    }
    getPrice(args) {
        let reserveSeats = args.reserveSeats;
        let reserveTickets = args.reserveTickets;
        let price = 0;
        for (let seat of reserveSeats.list_tmp_reserve) {
            let ticket = reserveTickets[seat['seat_num']];
            price += ticket.sale_price;
        }
        return price;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PurchaseController;
