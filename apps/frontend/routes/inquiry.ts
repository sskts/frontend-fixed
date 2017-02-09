import express = require('express');
import Inquiry = require('../modules/Inquiry/InquiryModule');

let router = express.Router();

//チケット照会ログイン
router.get('/login', Inquiry.Module.login);

//チケット照会ログイン（認証）
router.post('/login', Inquiry.Module.auth);

//チケット照会
router.get('/:transactionId/', Inquiry.Module.index);

export = router; 