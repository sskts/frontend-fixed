/// <reference types="express" />
import express = require('express');
/**
 * 照会
 * @namespace
 */
declare namespace InquiryModule {
    /**
     * 照会認証ページ表示
     * @function
     */
    function login(_req: express.Request, res: express.Response): void;
    /**
     * 照会認証
     * @function
     */
    function auth(req: express.Request, res: express.Response, next: express.NextFunction): void;
    /**
     * 照会確認ページ表示
     * @function
     */
    function index(req: express.Request, res: express.Response, next: express.NextFunction): void;
}
export default InquiryModule;
