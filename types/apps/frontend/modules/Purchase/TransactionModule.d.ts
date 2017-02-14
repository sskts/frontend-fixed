/// <reference types="express" />
import express = require('express');
/**
 * 取引
 * @namespace
 */
declare namespace TransactionModule {
    /**
     * 取引開始
     * @function
     */
    function start(req: express.Request, res: express.Response, next: express.NextFunction): void;
}
export default TransactionModule;
