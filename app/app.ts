import * as MVTK from '@motionpicture/mvtk-service';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
// tslint:disable-next-line:no-require-imports
import expressValidator = require('express-validator');
import * as helmet from 'helmet';
import basicAuth from './middlewares/basicAuth';
import benchmarks from './middlewares/benchmarks';
import ipFilter from './middlewares/ipFilter';
import locales from './middlewares/locales';
import maintenance from './middlewares/maintenance';
import session from './middlewares/session';
import router from './routes/router';
// tslint:disable-next-line:no-var-requires no-require-imports
const expressLayouts = require('express-ejs-layouts');

/**
 * express設定
 */

const app = express();

app.use(ipFilter); // IP制限
app.use(basicAuth); // ベーシック認証
app.use(helmet()); //セキュリティー対策
app.use(benchmarks); // ベンチマーク的な
app.use(maintenance); // メンテナンスページ
app.use(session); // セッション

// tslint:disable-next-line:no-backbone-get-set-outside-model
app.set('views', __dirname + '/views');
// tslint:disable-next-line:no-backbone-get-set-outside-model
app.set('view engine', 'ejs');
app.use(expressLayouts);
// tslint:disable-next-line:no-backbone-get-set-outside-model
app.set('layout', 'layouts/layout');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(`${__dirname}/../public`));

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
