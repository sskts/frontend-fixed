"use strict";
/**
 * ルーティングスクリーン
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const screen_controller_1 = require("../controllers/screen/screen.controller");
const screenRouter = express.Router();
//スクリーン表示
screenRouter.get('', screen_controller_1.index);
//スクリーンHTML取得
screenRouter.get('/getHtml', screen_controller_1.getScreenHtml);
exports.default = screenRouter;
