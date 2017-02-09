"use strict";
const express = require("express");
const Method = require("../modules/Method/MethodModule");
let router = express.Router();
router.get('/entry', Method.Module.entry);
router.get('/ticketing', Method.Module.ticketing);
router.get('/bookmark', Method.Module.bookmark);
module.exports = router;
