import express = require('express');
import Method = require('../modules/Method/MethodModule');

let router = express.Router();

//入場方法説明
router.get('/entry', Method.Module.entry);

//発券方法説明
router.get('/ticketing', Method.Module.ticketing);

//ブックマーク方法説明
router.get('/bookmark', Method.Module.bookmark);

export = router; 