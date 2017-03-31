import * as MVTK from '@motionpicture/mvtk-service';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
// tslint:disable-next-line:no-require-imports
import expressValidator = require('express-validator');
import * as helmet from 'helmet';
import benchmarks from './middlewares/benchmarks';
import ipFilter from './middlewares/ipFilter';
import locales from './middlewares/locales';
import logger from './middlewares/logger';
import session from './middlewares/session';
import router from './routes/router';
// tslint:disable-next-line:no-var-requires no-require-imports
const engine = require('ejs-mate');

/**
 * express設定
 */

const app: express.Application = express();

app.use(ipFilter); // IP制限
app.use(helmet()); //セキュリティー対策
app.use(logger); // ロガー
app.use(benchmarks); // ベンチマーク的な
app.use(session); // セッション

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
    locales.init(req, res, next);
    if (req.session !== undefined && req.session.locale !== undefined) {
        locales.setLocale(req, req.session.locale);
    } else {
        locales.setLocale(req, 'ja');
    }
});

// バリデーション
app.use(expressValidator());

// ムビチケサービス初期化
MVTK.initialize(
    process.env.MVTK_ENDPOINT_SERVICE_01,
    process.env.MVTK_ENDPOINT_SERVICE_02,
    process.env.MVTK_ENDPOINT_RESERVE_SERVICE
);

// ルーティング
router(app);

export = app;
