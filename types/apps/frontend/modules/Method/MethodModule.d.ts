/// <reference types="express" />
import express = require('express');
/**
 * 方法
 * @namespace
 */
declare namespace MethodModule {
    /**
     * 発券方法ページ表示
     * @function
     */
    function ticketing(_req: express.Request, res: express.Response, _next: express.NextFunction): void;
    /**
     * 入場方法説明ページ表示
     * @function
     */
    function entry(_req: express.Request, res: express.Response, _next: express.NextFunction): void;
    /**
     * ブックマーク方法説明ページ表示
     * @function
     */
    function bookmark(_req: express.Request, res: express.Response, _next: express.NextFunction): void;
}
export default MethodModule;
