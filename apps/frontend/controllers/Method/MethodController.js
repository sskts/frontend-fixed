"use strict";
const BaseController_1 = require("../BaseController");
class MethodController extends BaseController_1.default {
    /**
     * 発券方法ページ表示
     */
    ticketing() {
        this.res.render('method/ticketing');
    }
    /**
     * 入場方法説明ページ表示
     */
    entry() {
        this.res.render('method/entry');
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MethodController;
