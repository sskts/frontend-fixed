/// <reference types="express" />
import express = require('express');
/**
 * 重複予約
 * @namespace
 */
declare namespace OverlapModule {
    /**
     * 仮予約重複
     * @function
     */
    function index(req: express.Request, res: express.Response, next: express.NextFunction): void;
    /**
     * 新規予約へ
     * @function
     */
    function newReserve(req: express.Request, res: express.Response, next: express.NextFunction): void;
    /**
     * 前回の予約へ
     * @function
     */
    function prevReserve(req: express.Request, res: express.Response, next: express.NextFunction): void;
}
export default OverlapModule;
