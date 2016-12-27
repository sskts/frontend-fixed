"use strict";
const BaseController_1 = require('../BaseController');
class InquiryController extends BaseController_1.default {
    /**
     * 照会認証ページ表示
     */
    login() {
    }
    /**
     * 照会認証
     */
    auth() {
    }
    /**
     * 照会確認ページ表示
     */
    index() {
        if (this.checkSession('inquiry')) {
            this.res.locals['inquiry'] = this.req.session['inquiry'];
            this.res.render('inquiry/confirm');
        }
        else {
            return this.next(new Error('無効なアクセスです'));
        }
    }
    /**
     * 照会印刷
     */
    print() {
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InquiryController;
