import express = require('express');
import moment = require('moment');




namespace UtilModule {
    /**
     * テンプレート変数へ渡す
     * 
     */
    export function setLocals(_req: express.Request, res: express.Response, next: express.NextFunction): void {
        res.locals.escapeHtml = escapeHtml;
        res.locals.formatPrice = formatPrice;
        res.locals.moment = moment;
        return next();
    }

    /**
     * HTMLエスケープ
     * 
     */
    export function escapeHtml(string: string): string {
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
    export function formatPrice(price: number): string {
        return String(price).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
    }

    /**
     * 
     * パフォーマンスID取得
     */
    export function getPerformanceId(args: {
        theaterCode: string, 
        day: string, 
        titleCode: string, 
        titleBranchNum: string,
        screenCode: string,
        timeBegin: string
    }): string  {
        return `${args.theaterCode}${args.day}${args.titleCode}${args.titleBranchNum}${args.screenCode}${args.timeBegin}`;
    }

}

export default UtilModule;