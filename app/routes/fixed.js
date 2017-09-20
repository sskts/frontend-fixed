"use strict";
/**
 * ルーティング券売機
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const FixedModule = require("../modules/Fixed/FixedModule");
const PerformancesModule = require("../modules/Purchase/PerformancesModule");
const fixedRouter = express.Router();
// TOP
fixedRouter.get('/', PerformancesModule.render);
// 設定
fixedRouter.get('/setting', FixedModule.settingRender);
// 利用停止
fixedRouter.get('/stop', FixedModule.stopRender);
// 照会情報取得
fixedRouter.post('/fixed/getInquiryData', FixedModule.getInquiryData);
exports.default = fixedRouter;
