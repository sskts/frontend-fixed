/**
 * 共通
 * @namespace Util.UtilModule
 */
import * as EmailTemplate from 'email-templates';
import * as express from 'express';
import * as fs from 'fs-extra';
import * as moment from 'moment';
/**
 * テンプレート変数へ渡す
 * @memberOf Util.UtilModule
 * @function setLocals
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunctiont} next
 * @returns {void}
 */
// tslint:disable-next-line:variable-name
export function setLocals(_req: express.Request, res: express.Response, next: express.NextFunction): void {
    res.locals.escapeHtml = escapeHtml;
    res.locals.formatPrice = formatPrice;
    res.locals.moment = moment;
    res.locals.timeFormat = timeFormat;
    res.locals.portalSite = getPortalUrl();
    next();
    return;
}

/**
 * 時間フォーマット
 * @memberOf Util.UtilModule
 * @function timeFormat
 * @param {string} str
 * @returns {string}
 */
export function timeFormat(str: string): string {
    if (typeof str !== 'string') {
        return '';
    }
    const start = 2;
    const end = 4;
    return `${str.slice(0, start)}:${str.slice(start, end)}`;
}

/**
 * HTMLエスケープ
 * @memberOf Util.UtilModule
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
 * @memberOf Util.UtilModule
 * @function formatPrice
 * @param {number} price
 * @returns {string}
 */
export function formatPrice(price: number): string {
    return String(price).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
}

/**
 * パフォーマンスID取得
 * @memberOf Util.UtilModule
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
 * @memberOf Util.UtilModule
 * @function bace64Encode
 * @param {string} str
 * @returns {string}
 */
export function bace64Encode(str: string): string {
    return new Buffer(str).toString('base64');
}

/**
 * ベース64デコード
 * @memberOf Util.UtilModule
 * @function base64Decode
 * @param {string} str
 * @returns {string}
 */
export function base64Decode(str: string): string {
    return new Buffer(str, 'base64').toString();
}

/**
 * 劇場ポータルURL取得
 * @memberOf Util.UtilModule
 * @function getTheaterUrl
 * @param {string} name
 * @returns {string}
 */
// tslint:disable-next-line:variable-name
export function getTheaterUrl(_name: string): string {
    let result: string;
    if (process.env.NODE_ENV !== 'development') {
        result = `${getPortalUrl()}/theater/aira`;
        // const theaterName = name.toLowerCase();
        // result = `${getPortalUrl()}/theater/${theaterName.replace('cinemasunshine', '')}`;
    } else {
        result = getPortalUrl();
    }
    return result;
}

/**
 * ポータルURL取得
 * @memberOf Util.UtilModule
 * @function getPortalUrl
 * @returns {string}
 */
export function getPortalUrl(): string {
    let result: string;
    if (process.env.NODE_ENV === 'prod') {
        // tslint:disable-next-line:no-http-string
        result = 'http://www.cinemasunshine.co.jp';
    } else if (process.env.NODE_ENV === 'test') {
        // tslint:disable-next-line:no-http-string
        result = 'http://devssktsportal.azurewebsites.net';
    } else {
        // tslint:disable-next-line:no-http-string
        result = '/';
    }
    return result;
}

/**
 * メール内容取得
 * @memberOf Util.UtilModule
 * @function getMailTemplate
 * @param {string} dir
 * @param {{}} locals
 * @returns {Promise<{}>}
 */
export async function getEmailTemplate(dir: string, locals: {}): Promise<IEmailTemplateResults> {
    const emailTemplate = new EmailTemplate.EmailTemplate(dir);
    return new Promise<IEmailTemplateResults>((resolve, reject) => {
        emailTemplate.render(locals, (err, results) => {
            if (err !== null) {
                reject(err);
                return;
            }
            resolve(results);
            return;
        });
    });
}

/**
 * メール内容取得out
 * @memberOf Util.UtilModule
 * @interface IEmailTemplateResults
 */
export interface IEmailTemplateResults {
    html: string;
    text: string;
    subject: string;
}

/**
 * json取得
 * @memberOf Util.UtilModule
 * @function readJSONAsync
 * @param {string} file
 * @returns {Promise<{}>}
 */
export async function readJSONAsync(file: string): Promise<{}> {
    return new Promise((resolve, reject) => {
        fs.readJSON(file, (err, jsonObject) => {
            if (err !== null) {
                reject(err);
                return;
            }
            resolve(jsonObject);
            return;
        });
    });
}

/**
 * 2桁
 * @memberOf Util.UtilModule
 * @const DIGITS_02
 * @type number
 */
export const DIGITS_02 = -2;

/**
 * 3桁
 * @memberOf Util.UtilModule
 * @const DIGITS_03
 * @type number
 */
export const DIGITS_03 = -3;

/**
 * 8桁
 * @memberOf Util.UtilModule
 * @const DIGITS_08
 * @type number
 */
export const DIGITS_08 = -8;
