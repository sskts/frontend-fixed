import express = require('express');
import helmet = require('helmet');
import cookieParser = require('cookie-parser');
import bodyParser = require('body-parser');
import logger from './middlewares/logger';
import benchmarks from './middlewares/benchmarks';
import session from './middlewares/session';
import config = require('config');
import router from './routes/router';

let app: express.Application = express();

app.use(helmet()); //HTTP ヘッダー
app.use(logger); // ロガー
app.use(benchmarks); // ベンチマーク的な
app.use(session); // セッション

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

// ルーティング
router(app);

export = app;
