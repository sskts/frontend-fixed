/// <reference types="express" />
import express = require('express');
/**
 * エラー
 * @namespace
 */
declare namespace ErrorModule {
    /**
     * Not Found
     * @function
     */
    function notFound(req: express.Request, res: express.Response, _next: express.NextFunction): void;
    /**
     * エラーページ
     * @function
     */
    function index(err: Error, req: express.Request, res: express.Response, _next: express.NextFunction): void;
}
export default ErrorModule;
