"use strict";
const express = require("express");
const Inquiry = require("../modules/Inquiry/InquiryModule");
let router = express.Router();
router.get('/login', Inquiry.Module.login);
router.post('/login', Inquiry.Module.auth);
router.get('/:transactionId/', Inquiry.Module.index);
module.exports = router;
