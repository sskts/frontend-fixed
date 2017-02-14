/// <reference types="express" />
import express = require('express');
/**
 * 共通
 */
declare namespace UtilModule {
    /**
     * テンプレート変数へ渡す
     * @function
     */
    function setLocals(_req: express.Request, res: express.Response, next: express.NextFunction): void;
    /**
     * HTMLエスケープ
     * @function
     */
    function escapeHtml(string: string): string;
    /**
     * カンマ区切りへ変換
     * @function
     */
    function formatPrice(price: number): string;
    /**
     * パフォーマンスID取得
     * @function
     */
    function getPerformanceId(args: {
        theaterCode: string;
        day: string;
        titleCode: string;
        titleBranchNum: string;
        screenCode: string;
        timeBegin: string;
    }): string;
}
export default UtilModule;
