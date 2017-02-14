/// <reference types="express" />
import express = require('express');
/**
 * パフォーマンス一覧
 */
declare namespace PerformancesModule {
    /**
     * パフォーマンス一覧表示
     * @function
     */
    function index(req: express.Request, res: express.Response, next: express.NextFunction): void;
    /**
     * パフォーマンスリスト取得
     * @function
     */
    function getPerformances(req: express.Request, res: express.Response): void;
}
export default PerformancesModule;
