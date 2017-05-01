"use strict";
/**
 * エラー共通
 * @namespace Util.ErrorUtilModule
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * エラー番号（propertyなし）
 * @memberof Util.ErrorUtilModule
 * @const ERROR_PROPERTY
 */
exports.ERROR_PROPERTY = '000';
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
/**
 * エラーGMO（GMO）
 * @memberof Util.ErrorUtilModule
 * @const ERROR_GMO
 */
exports.ERROR_GMO = '005';
/**
 * エラー（外部モジュール）
 * @memberof Util.ErrorUtilModule
 * @const ERROR_EXTERNAL_MODULE
 */
exports.ERROR_EXTERNAL_MODULE = '999';
/**
 * カスタムエラー
 * @memberof Util.ErrorUtilModule
 * @extends Error
 * @class CustomError
 */
class CustomError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}
exports.CustomError = CustomError;
