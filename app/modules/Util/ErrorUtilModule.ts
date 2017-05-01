/**
 * エラー共通
 * @namespace Util.ErrorUtilModule
 */

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

/**
 * エラーGMO（GMO）
 * @memberof Util.ErrorUtilModule
 * @const ERROR_GMO
 */
export const ERROR_GMO = '005';

/**
 * エラー（外部モジュール）
 * @memberof Util.ErrorUtilModule
 * @const ERROR_EXTERNAL_MODULE
 */
export const ERROR_EXTERNAL_MODULE = '999';

/**
 * カスタムエラー
 * @memberof Util.ErrorUtilModule
 * @extends Error
 * @class CustomError
 */
export class CustomError extends Error {
    public code: string;
    constructor(code: string, message: string | undefined) {
        super(message);
        this.code = code;
    }
}
