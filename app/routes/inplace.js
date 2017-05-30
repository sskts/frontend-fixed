"use strict";
/**
 * ルーティング券売機
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const InplaceModule = require("../modules/Inplace/InplaceModule");
const router = express.Router();
// TOP
router.get('/', InplaceModule.index);
// 設定
router.get('/setting', InplaceModule.setting);
// 利用停止
router.get('/stop', InplaceModule.stop);
exports.default = router;
