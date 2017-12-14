"use strict";
/**
 * ルーティングスクリーン
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const ScreenModule = require("../modules/Screen/ScreenModule");
const screenRouter = express.Router();
//スクリーン表示
screenRouter.get('', ScreenModule.index);
//スクリーンHTML取得
screenRouter.get('/getHtml', ScreenModule.getScreenHtml);
exports.default = screenRouter;
