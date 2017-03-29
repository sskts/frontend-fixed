/**
 * エラー共通
 * @namespace Util.ErrorUtilModule
 */

import * as express from 'express';

/**
 * エラー取得
 * @memberof Util.ErrorUtilModule
 * @function erorMessage
 */
export function getError(req: express.Request, err: any): Error {
    let msg = '';
    switch (err) {
        case ERROR_PROPERTY:
            msg = req.__('common.error.property');
            break;
        case ERROR_ACCESS:
            msg = req.__('common.error.access');
            break;
        case ERROR_VALIDATION:
            msg = req.__('common.error.property');
            break;
        case ERROR_EXPIRE:
            msg = req.__('common.error.expire');
            break;
        default:
            msg = err.message;
            break;
    }
    return new Error(msg);
}

/**
 * エラー番号（propertyなし）
 * @memberof Util.ErrorUtilModule
 * @const ERROR_PROPERTY
 */
export const ERROR_PROPERTY = '000';

/**
 * エラー番号（アクセス）
 * @memberof Util.ErrorUtilModule
 * @const ERROR_ACCESS
 */
export const ERROR_ACCESS = '001';

/**
 * エラー番号（時間切れ）
 * @memberof Util.ErrorUtilModule
 * @const ERROR_TIMEOUT
 */
export const ERROR_TIMEOUT = '002';

/**
 * エラー番号（バリデーション）
 * @memberof Util.ErrorUtilModule
 * @const ERROR_VALIDATION
 */
export const ERROR_VALIDATION = '003';

/**
 * エラー番号（期限切れ）
 * @memberof Util.ErrorUtilModule
 * @const ERROR_EXPIRE
 */
export const ERROR_EXPIRE = '004';
