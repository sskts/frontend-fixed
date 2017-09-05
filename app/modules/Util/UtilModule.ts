/**
 * 共通
 * @namespace Util.UtilModule
 */
import { NextFunction, Request, Response } from 'express';
import * as moment from 'moment';
/**
 * テンプレート変数へ渡す
 * @memberof Util.UtilModule
 * @function setLocals
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunctiont} next
 * @returns {void}
 */
export function setLocals(req: Request, res: Response, next: NextFunction): void {
    res.locals.escapeHtml = escapeHtml;
    res.locals.formatPrice = formatPrice;
    res.locals.moment = moment;
    res.locals.timeFormat = timeFormat;
    res.locals.portalSite = process.env.PORTAL_SITE_URL;
    res.locals.env = process.env.NODE_ENV;
    res.locals.webhookApiEndPoint = process.env.SSKTS_WEBHOOK_ENDPOINT;
    res.locals.portalSite = process.env.APP_SITE_URL;
    // クッキーからアプリ判定
    res.locals.viewType = (req.cookies.applicationData !== undefined) ? JSON.parse(req.cookies.applicationData).viewType : null;
    next();
}

/**
 * アプリ判定
 * @memberof Util.UtilModule
 * @function isApp
 * @param {Request} req
 * @returns {boolean}
 */
export function isApp(req: Request): boolean {
    const viewType = (req.cookies.applicationData !== undefined) ? JSON.parse(req.cookies.applicationData).viewType : null;

    return (viewType === 'app');
}

/**
 * 時間フォーマット
 * @memberof Util.UtilModule
 * @function timeFormat
 * @param {string} referenceDate 基準日
 * @param {Date} screeningTime 時間
 * @returns {string}
 */
export function timeFormat(screeningTime: Date, referenceDate: string) {
    const HOUR = 60;
    const diff = moment(screeningTime).diff(moment(referenceDate), 'minutes');
    const hour = (`00${Math.floor(diff / HOUR)}`).slice(DIGITS['02']);
    const minutes = moment(screeningTime).format('mm');

    return `${hour}:${minutes}`;
}

/**
 * HTMLエスケープ
 * @memberof Util.UtilModule
 * @function escapeHtml
 * @param {string} str
 * @returns {string}
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
 * @memberof Util.UtilModule
 * @function formatPrice
 * @param {number} price
 * @returns {string}
 */
export function formatPrice(price: number): string {
    return String(price).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
}

/**
 * パフォーマンスID取得
 * @memberof Util.UtilModule
 * @function getPerformanceId
 * @param {Object} args
 * @param {string} args.theaterCode
 * @param {string} args.day
 * @param {string} args.titleCode
 * @param {string} args.titleBranchNum
 * @param {string} args.screenCode
 * @param {string} args.timeBegin
 * @returns {string}
 */
export function getPerformanceId(args: {
    theaterCode: string,
    day: string,
    titleCode: string,
    titleBranchNum: string,
    screenCode: string,
    timeBegin: string
}): string {
    return `${args.theaterCode}${args.day}${args.titleCode}${args.titleBranchNum}${args.screenCode}${args.timeBegin}`;
}

/**
 * ベース64エンコード
 * @memberof Util.UtilModule
 * @function bace64Encode
 * @param {string} str
 * @returns {string}
 */
export function bace64Encode(str: string): string {
    return new Buffer(str).toString('base64');
}

/**
 * ベース64デコード
 * @memberof Util.UtilModule
 * @function base64Decode
 * @param {string} str
 * @returns {string}
 */
export function base64Decode(str: string): string {
    return new Buffer(str, 'base64').toString();
}

/**
 * メール内容取得
 * @memberof Util.UtilModule
 * @function getMailTemplate
 * @param {Response} res
 * @param {string} file
 * @param {{}} locals
 * @returns {Promise<string>}
 */
export async function getEmailTemplate(res: Response, file: string, locals: {}): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        res.render(file, locals, (err, html) => {
            if (err !== null) {
                reject(err);

                return;
            }
            resolve(html);
        });
    });
}

/**
 * @memberof Util.UtilModule
 * @enum DIGITS
 * @type number
 */
export enum DIGITS {
    '02' = -2,
    '03' = -3,
    '08' = -8
}

/**
 * 表示
 * @memberof Util.UtilModule
 * @enum VIEW
 */
export enum VIEW {
    /**
     * Default
     */
    Default = 'default',
    /**
     * 券売機
     */
    Fixed = 'fixed'
}

/**
 * 環境
 * @memberof Util.UtilModule
 * @enum ENV
 * @type string
 */
export enum ENV {
    /**
     * 開発
     */
    Development = 'development',
    /**
     * テスト
     */
    Test = 'test',
    /**
     * 本番
     */
    Production = 'production'
}
