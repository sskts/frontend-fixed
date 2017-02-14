/// <reference types="express" />
import express = require('express');
/**
 * 購入確認
 * @namespace
 */
declare namespace ConfirmModule {
    /**
     * 購入者内容確認
     * @function
     */
    function index(req: express.Request, res: express.Response, next: express.NextFunction): void;
    /**
     * 購入確定
     * @function
     */
    function purchase(req: express.Request, res: express.Response, next: express.NextFunction): void;
}
export default ConfirmModule;
