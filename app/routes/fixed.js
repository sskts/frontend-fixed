"use strict";
/**
 * ルーティング券売機
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const FixedModule = require("../modules/Fixed/FixedModule");
const router = express.Router();
// TOP
router.get('/', FixedModule.index);
// 設定
router.get('/setting', FixedModule.setting);
// 利用停止
router.get('/stop', FixedModule.stop);
exports.default = router;
