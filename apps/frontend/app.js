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
const locales_1 = require("./middlewares/locales");
const logger_1 = require("./middlewares/logger");
const session_1 = require("./middlewares/session");
const router_1 = require("./routes/router");
// tslint:disable-next-line:no-var-requires no-require-imports
const engine = require('ejs-mate');
/**
 * express設定
 */
const app = express();
app.use(ipFilter_1.default); // IP制限
app.use(basicAuth_1.default); // ベーシック認証
app.use(helmet()); //セキュリティー対策
app.use(logger_1.default); // ロガー
app.use(benchmarks_1.default); // ベンチマーク的な
app.use(session_1.default); // セッション
app.engine('ejs', engine);
// tslint:disable-next-line:no-backbone-get-set-outside-model
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(`${__dirname}/../../public`));
// 言語
app.use((req, res, next) => {
    locales_1.default.init(req, res, next);
    if (req.session !== undefined && req.session.locale !== undefined) {
        locales_1.default.setLocale(req, req.session.locale);
    }
    else {
        locales_1.default.setLocale(req, 'ja');
    }
});
// バリデーション
app.use(expressValidator());
// ムビチケサービス初期化
MVTK.initialize(process.env.MVTK_ENDPOINT_SERVICE_01, process.env.MVTK_ENDPOINT_SERVICE_02, process.env.MVTK_ENDPOINT_RESERVE_SERVICE);
// ルーティング
router_1.default(app);
module.exports = app;
