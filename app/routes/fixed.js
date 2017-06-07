"use strict";
/**
 * ルーティング券売機
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const FixedModule = require("../modules/Fixed/FixedModule");
const fixedRouter = express.Router();
// TOP
fixedRouter.get('/', FixedModule.index);
// 設定
fixedRouter.get('/setting', FixedModule.setting);
// 利用停止
fixedRouter.get('/stop', FixedModule.stop);
exports.default = fixedRouter;
