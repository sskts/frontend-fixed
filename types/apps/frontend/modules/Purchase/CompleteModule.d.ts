/// <reference types="express" />
import express = require('express');
/**
 * 購入完了
 * @namespace
 */
declare namespace CompleteModule {
    /**
     * 購入完了表示
     * @function
     */
    function index(req: express.Request, res: express.Response, next: express.NextFunction): void;
}
export default CompleteModule;
