"use strict";
const BaseController_1 = require('../BaseController');
class SeatSelectController extends BaseController_1.default {
    /**
     * 座席選択
     */
    index() {
        this.res.render('reservation/seatSelect');
    }
    /**
     * 座席決定
     */
    seatSelect() {
        this.res.redirect(this.router.build('reservation.denominationSelect', {}));
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SeatSelectController;
