/**
 * エラー共通
 * @namespace Util.ErrorUtilModule
 */

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
 * @class CustomError
 */
export class CustomError extends Error {
    public code: ErrorType;
    constructor(code: ErrorType, message: string | undefined) {
        super(message);
        this.code = code;
    }
}
