/// <reference types="express" />
import express = require('express');
/**
 * 購入券種選択
 * @namespace
 */
declare namespace TicketModule {
    /**
     * 券種選択
     * @function
     */
    function index(req: express.Request, res: express.Response, next: express.NextFunction): void;
    /**
     * 券種決定
     * @function
     */
    function select(req: express.Request, res: express.Response, next: express.NextFunction): void;
}
export default TicketModule;
