"use strict";
/**
 * ルーティングRoot
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const ScreenModule = require("../modules/Screen/ScreenModule");
const rootRouter = express.Router();
if (process.env.VIEW_TYPE === undefined
    && (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test')) {
    // index
    rootRouter.get('/', (_, res) => { res.redirect('/purchase/performances'); });
    // 再起動
    rootRouter.get('/500', () => { process.exit(1); });
    // スクリーンテスト
    rootRouter.get('/screen', ScreenModule.index);
    rootRouter.post('/screen', ScreenModule.getScreenStateReserve);
}
exports.default = rootRouter;
