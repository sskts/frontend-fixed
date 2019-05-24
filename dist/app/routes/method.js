"use strict";
/**
 * ルーティング方法
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const method_controller_1 = require("../controllers/method/method.controller");
const methodRouter = express.Router();
//入場方法説明
// methodRuter.get('/entry', MethodModule.entry);
//発券方法説明
methodRouter.get('/ticketing', method_controller_1.ticketing);
exports.default = methodRouter;
