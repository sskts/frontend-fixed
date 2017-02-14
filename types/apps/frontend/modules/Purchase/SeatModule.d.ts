/// <reference types="express" />
import express = require('express');
/**
 * 購入座席選択
 * @namespace
 */
declare namespace SeatModule {
    /**
     * 座席選択
     * @function
     */
    function index(req: express.Request, res: express.Response, next: express.NextFunction): void;
    /**
     * 座席決定
     * @function
     */
    function select(req: express.Request, res: express.Response, next: express.NextFunction): void;
    /**
     * スクリーン状態取得
     * @function
     */
    function getScreenStateReserve(req: express.Request, res: express.Response, _next: express.NextFunction): void;
}
export default SeatModule;
