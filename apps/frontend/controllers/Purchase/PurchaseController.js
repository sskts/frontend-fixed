"use strict";
const BaseController_1 = require('../BaseController');
class PurchaseController extends BaseController_1.default {
    /**
     * トークンチェック
     *
     */
    checkToken() {
        if (this.req.body['token'] !== this.req.session['purchaseToken']) {
            this.next(new Error('無効なアクセスです'));
        }
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PurchaseController;
