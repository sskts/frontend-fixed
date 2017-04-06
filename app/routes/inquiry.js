/**
 * ルーティング照会
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const InquiryModule = require("../modules/Inquiry/InquiryModule");
const router = express.Router();
//チケット照会ログイン
router.get('/login', InquiryModule.login);
//チケット照会ログイン（認証）
router.post('/login', InquiryModule.auth);
//チケット照会
router.get('/:transactionId/', InquiryModule.index);
exports.default = router;
