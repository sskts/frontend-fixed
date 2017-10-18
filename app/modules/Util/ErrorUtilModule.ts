/**
 * エラー共通
 * @namespace Util.ErrorUtilModule
 */
import * as HTTPStatus from 'http-status';

export enum ErrorType {
    /**
     * プロパティなし
     */
    Property = '000',
    /**
     * アクセス
     */
    Access = '001',
    /**
     * 時間切れ
     */
    Timeout = '002',
    /**
     * バリデーション
     */
    Validation = '003',
    /**
     * 期限切れ
     */
    Expire = '004',
    /**
     * 外部モジュール
     */
    ExternalModule = '999'
}

/**
 * カスタムエラー
 * @memberof Util.ErrorUtilModule
 * @extends Error
 * @class AppError
 */
export class AppError extends Error {
    public code: number;
    public errorType: ErrorType;
    public errors: { name: string, reason: string, message: string | undefined }[];
    constructor(code: number, errorType: ErrorType) {
        const message = (errorType === ErrorType.Property) ? 'Property Error'
            : (errorType === ErrorType.Access) ? 'Access Error'
                : (errorType === ErrorType.Timeout) ? 'Timeout Error'
                    : (errorType === ErrorType.Validation) ? 'Validation Error'
                        : (errorType === ErrorType.Expire) ? 'Expire Error'
                            : (errorType === ErrorType.ExternalModule) ? 'Expire ExternalModule'
                                : undefined;
        super(message);
        this.code = code;
        this.errorType = errorType;
        this.errors = [
            { name: 'SSKTSApplicationError', reason: (<any>HTTPStatus)[code], message: message }
        ];
    }
}
