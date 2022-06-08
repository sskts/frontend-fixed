import * as cookieParser from 'cookie-parser';
import * as express from 'express';
// tslint:disable-next-line:no-require-imports
import expressValidator = require('express-validator');
import * as helmet from 'helmet';
import * as moment from 'moment-timezone';
import basicAuth from './middlewares/basicAuth';
import benchmarks from './middlewares/benchmarks';
import ipFilter from './middlewares/ipFilter';
import * as locales from './middlewares/locales';
import maintenance from './middlewares/maintenance';
import session from './middlewares/session';
import whiteList from './middlewares/whiteList';
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
app.use(whiteList); // 許可設定
app.use(benchmarks); // ベンチマーク的な
app.set('trust proxy', 1);
app.use(session); // セッション

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
app.use(maintenance); // メンテナンスページ
app.use(expressValidator()); // バリデーション

router(app); // ルーティング

export = app;
