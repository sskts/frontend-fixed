"use strict";
const express = require("express");
const MethodModule_1 = require("../modules/Method/MethodModule");
/**
 * ルーティング方法
 */
const router = express.Router();
//入場方法説明
router.get('/entry', MethodModule_1.default.entry);
//発券方法説明
router.get('/ticketing', MethodModule_1.default.ticketing);
//ブックマーク方法説明
router.get('/bookmark', MethodModule_1.default.bookmark);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
