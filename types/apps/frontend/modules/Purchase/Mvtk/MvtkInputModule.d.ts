/// <reference types="express" />
import express = require('express');
declare namespace MvtkInputModule {
    /**
     * ムビチケ券入力ページ表示
     */
    function index(req: express.Request, res: express.Response, next: express.NextFunction): void;
    /**
     * 認証
     */
    function auth(req: express.Request, res: express.Response, next: express.NextFunction): void;
}
export default MvtkInputModule;
