/**
 * エラー共通
 * @namespace Util.ErrorUtilModule
 */
"use strict";
var ErrorType;
(function (ErrorType) {
    /**
     * プロパティなし
     */
    ErrorType[ErrorType["Property"] = '000'] = "Property";
    /**
     * アクセス
     */
    ErrorType[ErrorType["Access"] = '001'] = "Access";
    /**
     * 時間切れ
     */
    ErrorType[ErrorType["Timeout"] = '002'] = "Timeout";
    /**
     * バリデーション
     */
    ErrorType[ErrorType["Validation"] = '003'] = "Validation";
    /**
     * 期限切れ
     */
    ErrorType[ErrorType["Expire"] = '004'] = "Expire";
    /**
     * 外部モジュール
     */
    ErrorType[ErrorType["ExternalModule"] = '999'] = "ExternalModule";
})(ErrorType = exports.ErrorType || (exports.ErrorType = {}));
/**
 * カスタムエラー
 * @memberof Util.ErrorUtilModule
 * @extends Error
 * @class AppError
 */
class AppError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}
exports.AppError = AppError;
