"use strict";
const log4js = require('log4js');
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
        this.router = this.req.route;
        this.logger = log4js.getLogger('system');
    }
    /**
     * テンプレート変数へ渡す
     *
     */
    setLocals() {
        this.res.locals.req = this.req;
        this.res.locals.escapeHtml = this.escapeHtml;
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
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BaseController;
