"use strict";
const BaseController_1 = require('../BaseController');
class MethodController extends BaseController_1.default {
    /**
     * 発券方法ページ表示
     */
    ticketing() {
        this.res.render('method/ticketing');
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MethodController;
