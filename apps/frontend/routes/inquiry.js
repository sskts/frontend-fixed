"use strict";
const express = require("express");
const InquiryModule_1 = require("../modules/Inquiry/InquiryModule");
let router = express.Router();
router.get('/login', InquiryModule_1.default.login);
router.post('/login', InquiryModule_1.default.auth);
router.get('/:transactionId/', InquiryModule_1.default.index);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
