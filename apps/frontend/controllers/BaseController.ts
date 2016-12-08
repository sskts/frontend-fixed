import express = require('express');
import log4js = require('log4js');

/**
 * ベースコントローラー
 * 
 * 基本的にコントローラークラスはルーティングクラスより呼ばれる
 * あらゆるルーティングで実行されるメソッドは、このクラスがベースとなるので、メソッド共通の処理はここで実装するとよい
 */
export default class BaseController {
    protected req: express.Request;
    protected res: express.Response;
    protected next: express.NextFunction;
    protected router: Express.NamedRoutes;
    protected logger: any;

    constructor(req: express.Request, res: express.Response, next: express.NextFunction) {
        this.req = req;
        this.res = res;
        this.next = next;

        this.router = this.req.app.namedRoutes;
        this.logger = log4js.getLogger('system');
    }

    /**
     * テンプレート変数へ渡す
     * 
     */
    protected setLocals(): void {
        this.res.locals.req = this.req;
        // this.res.locals.escapeHtml = this.escapeHtml;
    }

    /**
     * HTMLエスケープ
     * 
     */
    private escapeHtml(string: string): string {
        if(typeof string !== 'string') {
            return string;
        }
        let change = (match: string): string =>{
            let changeList: any = {
            '&': '&amp;',
            "'": '&#x27;',
            '`': '&#x60;',
            '"': '&quot;',
            '<': '&lt;',
            '>': '&gt;',
            };
            return changeList[match];
        }
        return string.replace(/[&'`"<>]/g, change);
    }
}


