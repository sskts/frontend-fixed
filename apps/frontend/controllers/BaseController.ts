import express = require('express');
import log4js = require('log4js');
import moment = require('moment');
import locales from '../middlewares/locales';
import request = require('request');
import config = require('config');
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
        }
        this.setLocals();
    }

    /**
     * テンプレート変数へ渡す
     * 
     */
    protected setLocals(): void {
        this.res.locals.req = this.req;
        this.res.locals.escapeHtml = this.escapeHtml;
        this.res.locals.moment = moment;
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

    /**
     * TODO
     * パフォーマンス取得
     */
    protected getPerformance(performancesId: string, cb: Function): void {
        let endpoint: string = config.get<string>('mp_api_endpoint');
        let method: string = 'performance';

        let options: request.Options = {
            url: `${endpoint}/${method}/${performancesId}`,
            method: 'GET',
            json: true,
        };

        request.get(options, (error, response, body) => {
            if (error) {
                return this.next(new Error(error.message));
            }
            if (!response || !body.success) {
                return this.next(new Error('response is null or body.success is false'));
            }
            this.logger.debug('performance', body.performance);
            cb(body.performance);
        });
    }
    
}


