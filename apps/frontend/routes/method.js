"use strict";
const express = require("express");
const MethodModule_1 = require("../modules/Method/MethodModule");
let router = express.Router();
router.get('/entry', MethodModule_1.default.entry);
router.get('/ticketing', MethodModule_1.default.ticketing);
router.get('/bookmark', MethodModule_1.default.bookmark);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
