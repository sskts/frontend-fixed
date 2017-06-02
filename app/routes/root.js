"use strict";
/**
 * ルーティングRoot
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const ScreenModule = require("../modules/Screen/ScreenModule");
const router = express.Router();
if (process.env.VIEW_TYPE === undefined
    && (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test')) {
    // index
    router.get('/', (_, res) => { res.redirect('/purchase/performances'); });
    // 再起動
    router.get('/500', () => { process.exit(1); });
    // スクリーンテスト
    router.get('/screen', ScreenModule.index);
    router.post('/screen', ScreenModule.getScreenStateReserve);
}
exports.default = router;
