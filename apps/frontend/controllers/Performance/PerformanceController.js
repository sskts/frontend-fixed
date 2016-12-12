"use strict";
const BaseController_1 = require('../BaseController');
class PerformanceController extends BaseController_1.default {
    /**
     * 購入者情報入力完了
     */
    index() {
        this.res.render('performance');
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PerformanceController;
