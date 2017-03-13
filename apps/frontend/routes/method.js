/**
 * ルーティング方法
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const MethodModule = require("../modules/Method/MethodModule");
const router = express.Router();
//入場方法説明
router.get('/entry', MethodModule.entry);
//発券方法説明
router.get('/ticketing', MethodModule.ticketing);
//ブックマーク方法説明
router.get('/bookmark', MethodModule.bookmark);
exports.default = router;
