"use strict";
const express = require("express");
const InquiryModule_1 = require("../modules/Inquiry/InquiryModule");
/**
 * ルーティング照会
 */
const router = express.Router();
//チケット照会ログイン
router.get('/login', InquiryModule_1.default.login);
//チケット照会ログイン（認証）
router.post('/login', InquiryModule_1.default.auth);
//チケット照会
router.get('/:transactionId/', InquiryModule_1.default.index);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
