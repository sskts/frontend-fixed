"use strict";
/**
 * エラー共通
 * @namespace Util.ErrorUtilModule
 */
Object.defineProperty(exports, "__esModule", { value: true });
var ErrorType;
(function (ErrorType) {
    /**
     * プロパティなし
     */
    ErrorType["Property"] = "000";
    /**
     * アクセス
     */
    ErrorType["Access"] = "001";
    /**
     * 時間切れ
     */
    ErrorType["Timeout"] = "002";
    /**
     * バリデーション
     */
    ErrorType["Validation"] = "003";
    /**
     * 期限切れ
     */
    ErrorType["Expire"] = "004";
    /**
     * 外部モジュール
     */
    ErrorType["ExternalModule"] = "999";
})(ErrorType = exports.ErrorType || (exports.ErrorType = {}));
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
