/**
 * 共通
 */
import { Request, Response } from 'express';
import * as libphonenumber from 'google-libphonenumber';
import * as moment from 'moment';
import { AppError, AuthModel, ErrorType } from '../models';

/**
 * API設定取得
 */
export async function getApiOption(
    req: Request<undefined, undefined, any, any>
) {
    if (req.session === undefined) {
        throw new AppError(httpStatus.BAD_REQUEST, ErrorType.Property);
    }
    const authModel = new AuthModel(req.session.auth);

    return {
        endpoint: <string>process.env.SSKTS_API_ENDPOINT,
        auth: await authModel.create(),
        project: {
            id: <string>process.env.PROJECT_ID,
        },
    };
}

/**
 * 時間フォーマット
 */
export function timeFormat(screeningTime: Date, referenceDate: string) {
    const HOUR = 60;
    const diff = moment(screeningTime).diff(moment(referenceDate), 'minutes');
    const hour = `00${Math.floor(diff / HOUR)}`.slice(Digits['02']);
    const minutes = moment(screeningTime).format('mm');

    return `${hour}:${minutes}`;
}

/**
 * HTMLエスケープ
 */
export function escapeHtml(str: string): string {
    const change = (match: string): string => {
        const changeList: any = {
            '&': '&amp;',
            // tslint:disable-next-line:quotemark
            "'": '&#x27;',
            '`': '&#x60;',
            '"': '&quot;',
            '<': '&lt;',
            '>': '&gt;',
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
 * メール内容取得
 * @memberof Util.UtilModule
 * @function getMailTemplate
 * @param {Response} res
 * @param {string} file
 * @param {{}} locals
 * @returns {Promise<string>}
 */
export async function getEmailTemplate(
    res: Response,
    file: string,
    locals: {}
): Promise<string> {
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
    '08' = -8,
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
    Fixed = 'fixed',
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
    Production = 'production',
}

/**
 * ミリ秒待つ
 * デフォルト値3000ms
 */
export async function sleep(time: number = 3000) {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}

/**
 * 電話番号変換
 */
export function formatTelephone(
    telephone: string,
    format?: libphonenumber.PhoneNumberFormat
) {
    if (telephone === undefined) {
        return '';
    }
    const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
    const phoneNumber = phoneUtil.parseAndKeepRawInput(telephone, 'JP');
    const phoneFormat =
        format === undefined
            ? libphonenumber.PhoneNumberFormat.INTERNATIONAL
            : format;

    return phoneUtil.format(phoneNumber, phoneFormat).replace(/\s/g, '');
}
