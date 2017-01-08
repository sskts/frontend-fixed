"use strict";
const BaseController_1 = require("../BaseController");
class InquiryController extends BaseController_1.default {
    login() {
    }
    auth() {
    }
    index() {
        if (this.req.session && this.req.session['inquiry']) {
            this.res.locals['inquiry'] = this.req.session['inquiry'];
            this.res.render('inquiry/confirm');
        }
        else {
            return this.next(new Error('無効なアクセスです'));
        }
    }
    print() {
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InquiryController;
