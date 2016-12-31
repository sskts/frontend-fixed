"use strict";
const log4js = require("log4js");
const moment = require("moment");
/**
 * ベースコントローラー
 *
 * 基本的にコントローラークラスはルーティングクラスより呼ばれる
 * あらゆるルーティングで実行されるメソッドは、このクラスがベースとなるので、メソッド共通の処理はここで実装するとよい
 */
class BaseController {
    constructor(req, res, next) {
        this.req = req;
        this.res = res;
        this.next = next;
        this.router = this.req.app.namedRoutes;
        this.logger = log4js.getLogger('system');
        this.setLocals();
    }
    /**
     * テンプレート変数へ渡す
     *
     */
    setLocals() {
        this.res.locals.req = this.req;
        this.res.locals.escapeHtml = this.escapeHtml;
        this.res.locals.moment = moment;
    }
    /**
     * HTMLエスケープ
     *
     */
    escapeHtml(string) {
        if (typeof string !== 'string') {
            return string;
        }
        let change = (match) => {
            let changeList = {
                '&': '&amp;',
                "'": '&#x27;',
                '`': '&#x60;',
                '"': '&quot;',
                '<': '&lt;',
                '>': '&gt;',
            };
            return changeList[match];
        };
        return string.replace(/[&'`"<>]/g, change);
    }
    /**
     * セッションチェック
     */
    checkSession(name) {
        if (!this.req.session[name]) {
            return false;
        }
        return true;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BaseController;
