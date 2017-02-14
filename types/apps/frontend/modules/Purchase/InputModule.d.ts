/// <reference types="express" />
import express = require('express');
/**
 * 購入情報入力
 * @namespace
 */
declare namespace InputModule {
    /**
     * 購入者情報入力
     * @function
     */
    function index(req: express.Request, res: express.Response, next: express.NextFunction): void;
    /**
     * 購入者情報入力完了
     * @function
     */
    function submit(req: express.Request, res: express.Response, next: express.NextFunction): void;
}
export default InputModule;
