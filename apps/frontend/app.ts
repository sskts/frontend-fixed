// tslint:disable-next-line:missing-jsdoc
import benchmarks from './middlewares/benchmarks';
import bodyParser = require('body-parser');
import cookieParser = require('cookie-parser');
import config = require('config');
import express = require('express');
import helmet = require('helmet');
import locales from './middlewares/locales';
import logger from './middlewares/logger';
import session from './middlewares/session';
import router from './routes/router';

import * as COA from '@motionpicture/coa-service';
import * as GMO from '@motionpicture/gmo-service';

const app: express.Application = express();

app.use(helmet()); //HTTP ヘッダー
app.use(logger); // ロガー
app.use(benchmarks); // ベンチマーク的な
app.use(session); // セッション

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
    locales.init(req, res, next);
    if (req.session && req.session['locale']) {
        locales.setLocale(req, req.session['locale']);
    } else {
        locales.setLocale(req, 'ja');
    }
});

//COAサービス初期化
COA.initialize({
    endpoint: config.get<string>('coa_api_endpoint'),
    refresh_token: config.get<string>('coa_api_refresh_token')
});

//GMOサービス初期化
GMO.initialize({
    endpoint: config.get<string>('gmo_api_endpoint')
});

// ルーティング
router(app);

export = app;
