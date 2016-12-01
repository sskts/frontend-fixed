"use strict";
const BaseController_1 = require('../BaseController');
class DenominationSelectController extends BaseController_1.default {
    /**
     * 券種選択
     */
    index() {
        this.res.render('reservation/denominationSelect');
    }
    /**
     * 券種決定
     */
    denominationSelect() {
        this.res.redirect(this.router.build('reservation.denominationSelect', {}));
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DenominationSelectController;
