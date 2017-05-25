"use strict";
/**
 * ルーティング券売機
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const InplaceModule = require("../modules/Inplace/InplaceModule");
const PerformancesModule = require("../modules/Performances/PerformancesModule");
const router = express.Router();
// TOP
router.get('/', InplaceModule.index);
// 設定
router.get('/setting', InplaceModule.setting);
// 利用停止
router.get('/stop', InplaceModule.stop);
// パフォーマンス一覧
router.get('/performances', PerformancesModule.index);
router.post('/performances', PerformancesModule.getPerformances);
exports.default = router;
