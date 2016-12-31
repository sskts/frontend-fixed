"use strict";
const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const logger_1 = require("./middlewares/logger");
const benchmarks_1 = require("./middlewares/benchmarks");
const session_1 = require("./middlewares/session");
const router_1 = require("./routes/router");
const language_1 = require("./middlewares/language");
let app = express();
app.use(helmet()); //HTTP ヘッダー
app.use(logger_1.default); // ロガー
app.use(benchmarks_1.default); // ベンチマーク的な
app.use(session_1.default); // セッション
// view engine setup
app.engine('ejs', require('ejs-locals'));
app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
if (process.env.NODE_ENV === 'dev') {
    app.use(express.static(`${__dirname}/../../public`));
}
//言語
app.use(language_1.default.init);
// sessionで切り替え
app.use((req, res, next) => {
    if (req.session['locale']) {
        language_1.default.setLocale(req, req.session['locale']);
    }
    next();
});
// ルーティング
router_1.default(app);
module.exports = app;
