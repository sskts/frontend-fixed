"use strict";
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger_1 = require('./middlewares/logger');
const benchmarks_1 = require('./middlewares/benchmarks');
const session_1 = require('./middlewares/session');
const router_1 = require('./routes/router');
const locales_1 = require('./middlewares/locales');
let app = express();
app.use(helmet());
app.use(logger_1.default);
app.use(benchmarks_1.default);
app.use(session_1.default);
app.engine('ejs', require('ejs-locals'));
app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
if (process.env.NODE_ENV === 'dev') {
    app.use(express.static(`${__dirname}/../../public`));
}
app.use((req, res, next) => {
    locales_1.default.init(req, res, next);
});
router_1.default(app);
module.exports = app;
