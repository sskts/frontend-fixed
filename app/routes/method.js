"use strict";
/**
 * ルーティング方法
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const MethodModule = require("../modules/Method/MethodModule");
const methodRouter = express.Router();
//入場方法説明
// methodRuter.get('/entry', MethodModule.entry);
//発券方法説明
methodRouter.get('/ticketing', MethodModule.ticketing);
exports.default = methodRouter;
