/**
 * 共通
 */
import { Request, Response } from 'express';
import * as moment from 'moment';
import { AppError, AuthModel, ErrorType } from '../models';

/**
 * API設定取得
 */
export function getApiOption(req: Request) {
    if (req.session === undefined) throw new AppError(httpStatus.BAD_REQUEST, ErrorType.Property);
    const authModel = new AuthModel(req.session.auth);

    return {
        endpoint: (<string>process.env.SSKTS_API_ENDPOINT),
        auth: authModel.create(),
        project: {
            id: (<string>process.env.PROJECT_ID)
        }
    };
}

/**
 * アプリ判定
 * @memberof Util.UtilModule
 * @function isApp
 * @param {Request} req
 * @returns {boolean}
 */
export function isApp(req: Request): boolean {

    return (req.session !== undefined && req.session.awsCognitoIdentityId !== undefined);
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
    const hour = (`00${Math.floor(diff / HOUR)}`).slice(Digits['02']);
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
export enum Digits {
    '02' = -2,
    '03' = -3,
    '08' = -8
}

/**
 * 表示
 * @memberof Util.UtilModule
 * @enum VIEW
 */
export enum View {
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
export enum Env {
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

/**
 * ミリ秒待つ
 * デフォルト値3000ms
 */
export async function sleep(time: number = 3000) {
    return new Promise((resolve) => {
        setTimeout(() => { resolve(); }, time);
    });
}
