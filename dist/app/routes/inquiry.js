"use strict";
/**
 * ルーティング照会
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const inquiry_controller_1 = require("../controllers/inquiry/inquiry.controller");
const inquiryRouter = express.Router();
// チケット照会ログイン
inquiryRouter.get('/login', inquiry_controller_1.loginRender);
// チケット照会ログイン（認証）
inquiryRouter.post('/login', inquiry_controller_1.inquiryAuth);
// チケット照会
inquiryRouter.get('/:orderNumber/', inquiry_controller_1.confirmRender);
exports.default = inquiryRouter;
