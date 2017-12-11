import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
// tslint:disable-next-line:no-require-imports
import expressValidator = require('express-validator');
import * as helmet from 'helmet';
import basicAuth from './middlewares/basicAuth';
import benchmarks from './middlewares/benchmarks';
import ipFilter from './middlewares/ipFilter';
import * as locales from './middlewares/locales';
import maintenance from './middlewares/maintenance';
import session from './middlewares/session';
import * as UtilModule from './modules/Util/UtilModule';
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
if (process.env.APP_SITE_URL !== undefined) {
    app.use(helmet.frameguard({
        action: 'allow-from',
        domain: process.env.APP_SITE_URL
    }));
}
app.use(benchmarks); // ベンチマーク的な
app.use(session); // セッション

if (process.env.VIEW_TYPE === UtilModule.VIEW.Fixed) {
    app.set('views', `${__dirname}/views/fixed`);
} else {
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
app.use(maintenance); // メンテナンスページ
app.use(express.static(`${__dirname}/../static`)); // staticDir設定
app.use(expressValidator()); // バリデーション

router(app); // ルーティング

export = app;
