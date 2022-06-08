"use strict";
const cookieParser = require("cookie-parser");
const express = require("express");
// tslint:disable-next-line:no-require-imports
const expressValidator = require("express-validator");
const helmet = require("helmet");
const moment = require("moment-timezone");
const basicAuth_1 = require("./middlewares/basicAuth");
const benchmarks_1 = require("./middlewares/benchmarks");
const ipFilter_1 = require("./middlewares/ipFilter");
const locales = require("./middlewares/locales");
const maintenance_1 = require("./middlewares/maintenance");
const session_1 = require("./middlewares/session");
const whiteList_1 = require("./middlewares/whiteList");
const router_1 = require("./routes/router");
// tslint:disable-next-line:no-var-requires no-require-imports
const expressLayouts = require('express-ejs-layouts');
/**
 * express設定
 */
const app = express();
app.use(ipFilter_1.default); // IP制限
app.use(basicAuth_1.default); // ベーシック認証
app.use(helmet()); //セキュリティー対策
app.use(whiteList_1.default); // 許可設定
app.use(benchmarks_1.default); // ベンチマーク的な
app.set('trust proxy', 1);
app.use(session_1.default); // セッション
app.set('views', `${__dirname}/../../views`);
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/layout');
app.use(locales.setLocale); // 言語
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
/**
 * タイムゾーン設定
 */
moment.tz.setDefault('Asia/Tokyo');
moment.locale('ja');
app.use(cookieParser());
app.use(express.static(`${__dirname}/../../public`)); // staticDir設定
app.use(maintenance_1.default); // メンテナンスページ
app.use(expressValidator()); // バリデーション
router_1.default(app); // ルーティング
module.exports = app;
