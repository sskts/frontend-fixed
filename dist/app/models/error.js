"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = exports.ErrorType = void 0;
/**
 * エラー共通
 * @namespace Util.ErrorUtilModule
 */
const HTTPStatus = require("http-status");
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
 * @class AppError
 */
class AppError extends Error {
    constructor(code, errorType, message) {
        if (message === undefined) {
            const customMessage = errorType === ErrorType.Property
                ? 'Property Error'
                : errorType === ErrorType.Access
                    ? 'Access Error'
                    : errorType === ErrorType.Timeout
                        ? 'Timeout Error'
                        : errorType === ErrorType.Validation
                            ? 'Validation Error'
                            : errorType === ErrorType.Expire
                                ? 'Expire Error'
                                : errorType === ErrorType.ExternalModule
                                    ? 'Expire ExternalModule'
                                    : undefined;
            super(customMessage);
        }
        else {
            super(message);
        }
        this.code = code;
        this.errorType = errorType;
        this.errors = [
            {
                name: 'SSKTSApplicationError',
                reason: HTTPStatus[code],
                message: message,
            },
        ];
    }
}
exports.AppError = AppError;
