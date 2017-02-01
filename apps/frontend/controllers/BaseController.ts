import express = require('express');
import log4js = require('log4js');
import moment = require('moment');
import locales from '../middlewares/locales';

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
    protected router: Express.NamedRoutes | undefined;
    protected logger: any;

    constructor(req: express.Request, res: express.Response, next: express.NextFunction) {
        this.req = req;
        this.res = res;
        this.next = next;
        
        this.router = this.req.app.namedRoutes;
        this.logger = log4js.getLogger('system');
        if (this.req.session && this.req.session['locale']) {
            locales.setLocale(this.req, this.req.session['locale']);
        } else {
            locales.setLocale(this.req, 'ja');
        }
        this.setLocals();
    }

    /**
     * テンプレート変数へ渡す
     * 
     */
    protected setLocals(): void {
        this.res.locals.req = this.req;
        this.res.locals.route = this.req.route;
        this.res.locals.escapeHtml = this.escapeHtml;
        this.res.locals.formatPrice = this.formatPrice;
        this.res.locals.moment = moment;
    }

    /**
     * HTMLエスケープ
     * 
     */
    public escapeHtml(string: string): string {
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

    /**
     * カンマ区切りへ変換
     * 
     */
    public formatPrice(price: number): string {
        return String(price).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
    }

    /**
     * 
     * パフォーマンスID取得
     */
    protected getPerformanceId(
        theaterCode: string, 
        day: string, 
        titleCode: string, 
        titleBranchNum: string,
        screenCode: string,
        timeBegin: string
    ): string  {
        return `${theaterCode}${day}${titleCode}${titleBranchNum}${screenCode}${timeBegin}`;
    }

    
}


