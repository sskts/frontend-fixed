"use strict";
// tslint:disable-next-line:missing-jsdoc
const benchmarks_1 = require("./middlewares/benchmarks");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const config = require("config");
const express = require("express");
const helmet = require("helmet");
const locales_1 = require("./middlewares/locales");
const logger_1 = require("./middlewares/logger");
const session_1 = require("./middlewares/session");
const router_1 = require("./routes/router");
const COA = require("@motionpicture/coa-service");
const GMO = require("@motionpicture/gmo-service");
const app = express();
app.use(helmet()); //HTTP ヘッダー
app.use(logger_1.default); // ロガー
app.use(benchmarks_1.default); // ベンチマーク的な
app.use(session_1.default); // セッション
// view engine setup
app.engine('ejs', require('ejs-locals'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
if (process.env.NODE_ENV === 'dev') {
    app.use(express.static(`${__dirname}/../../public`));
}
//言語
app.use((req, res, next) => {
    locales_1.default.init(req, res, next);
    if (req.session && req.session['locale']) {
        locales_1.default.setLocale(req, req.session['locale']);
    }
    else {
        locales_1.default.setLocale(req, 'ja');
    }
});
//COAサービス初期化
COA.initialize({
    endpoint: config.get('coa_api_endpoint'),
    refresh_token: config.get('coa_api_refresh_token')
});
//GMOサービス初期化
GMO.initialize({
    endpoint: config.get('gmo_api_endpoint')
});
// ルーティング
router_1.default(app);
module.exports = app;
