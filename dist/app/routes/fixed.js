"use strict";
/**
 * ルーティング券売機
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const fixed = require("../controllers/fixed/fixed.controller");
const schedule = require("../controllers/purchase/schedule.controller");
const fixedRouter = express.Router();
// TOP
fixedRouter.get('/', schedule.render);
// 設定
fixedRouter.get('/setting', fixed.settingRender);
// 利用停止
fixedRouter.get('/stop', fixed.stopRender);
// 照会情報取得
fixedRouter.post('/fixed/getInquiryData', fixed.getInquiryData);
exports.default = fixedRouter;
