"use strict";
const MVTK = require("@motionpicture/mvtk-service");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
// tslint:disable-next-line:no-require-imports
const expressValidator = require("express-validator");
const helmet = require("helmet");
const basicAuth_1 = require("./middlewares/basicAuth");
const benchmarks_1 = require("./middlewares/benchmarks");
const ipFilter_1 = require("./middlewares/ipFilter");
const locales = require("./middlewares/locales");
const maintenance_1 = require("./middlewares/maintenance");
const session_1 = require("./middlewares/session");
const UtilModule = require("./modules/Util/UtilModule");
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
app.use(benchmarks_1.default); // ベンチマーク的な
app.use(session_1.default); // セッション
if (process.env.VIEW_TYPE === UtilModule.VIEW.Fixed) {
    app.set('views', `${__dirname}/views/fixed`);
}
else {
    app.set('views', `${__dirname}/views/default`);
}
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/layout');
app.use(locales.setLocale); // 言語
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(`${__dirname}/../public`)); // staticDir設定
app.use(UtilModule.setLocals); // viewSet
app.use(maintenance_1.default); // メンテナンスページ
app.use(express.static(`${__dirname}/../static`)); // staticDir設定
app.use(expressValidator()); // バリデーション
// ムビチケサービス初期化
MVTK.initialize(process.env.MVTK_ENDPOINT_SERVICE_01, process.env.MVTK_ENDPOINT_SERVICE_02, process.env.MVTK_ENDPOINT_RESERVE_SERVICE);
router_1.default(app); // ルーティング
module.exports = app;
