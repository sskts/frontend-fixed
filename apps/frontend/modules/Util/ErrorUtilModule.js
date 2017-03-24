/**
 * エラー共通
 * @namespace Util.ErrorUtilModule
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * エラーメッセージ
 * @memberof Util.ErrorUtilModule
 * @function erorMessage
 */
function getError(req, err) {
    let msg = '';
    switch (err) {
        case exports.ERROR_PROPERTY:
            msg = req.__('common.error.property');
            break;
        case exports.ERROR_ACCESS:
            msg = req.__('common.error.access');
            break;
        case exports.ERROR_VALIDATION:
            msg = req.__('common.error.property');
            break;
        case exports.ERROR_EXPIRE:
            msg = req.__('common.error.expire');
            break;
        default:
            msg = err.message;
            break;
    }
    return new Error(msg);
}
exports.getError = getError;
/**
 * エラー番号（propertyなし）
 * @memberof Util.ErrorUtilModule
 * @const ERROR_PROPERTY
 */
exports.ERROR_PROPERTY = 0;
/**
 * エラー番号（アクセス）
 * @memberof Util.ErrorUtilModule
 * @const ERROR_ACCESS
 */
exports.ERROR_ACCESS = '001';
/**
 * エラー番号（時間切れ）
 * @memberof Util.ErrorUtilModule
 * @const ERROR_TIMEOUT
 */
exports.ERROR_TIMEOUT = '002';
/**
 * エラー番号（バリデーション）
 * @memberof Util.ErrorUtilModule
 * @const ERROR_VALIDATION
 */
exports.ERROR_VALIDATION = '003';
/**
 * エラー番号（期限切れ）
 * @memberof Util.ErrorUtilModule
 * @const ERROR_EXPIRE
 */
exports.ERROR_EXPIRE = '004';
