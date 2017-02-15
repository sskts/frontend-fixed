
import * as express from 'express';
import * as moment from 'moment';

/**
 * 共通
 */
namespace UtilModule {
    /**
     * テンプレート変数へ渡す
     * @function
     */
    export function setLocals(_req: express.Request, res: express.Response, next: express.NextFunction): void {
        res.locals.escapeHtml = escapeHtml;
        res.locals.formatPrice = formatPrice;
        res.locals.moment = moment;
        return next();
    }

    /**
     * HTMLエスケープ
     * @function
     */
    export function escapeHtml(str: string): string {
        if (typeof str !== 'string') {
            return str;
        }
        const change = (match: string): string => {
            const changeList: any = {
            '&': '&amp;',
            '\'': '&#x27;',
            '`': '&#x60;',
            '"': '&quot;',
            '<': '&lt;',
            '>': '&gt;'
            };
            return changeList[match];
        };
        return str.replace(/[&'`"<>]/g, change);
    }

    /**
     * カンマ区切りへ変換
     * @function
     */
    export function formatPrice(price: number): string {
        return String(price).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
    }

    /**
     * パフォーマンスID取得
     * @function
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
