import * as COA from '@motionpicture/coa-service';
import * as GMO from '@motionpicture/gmo-service';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as helmet from 'helmet';
import benchmarks from './middlewares/benchmarks';
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

app.use(helmet()); //HTTP ヘッダー
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
if (process.env.NODE_ENV === 'dev') {
    app.use(express.static(`${__dirname}/../../public`));
}

//言語
app.use((req, res, next) => {
    locales.init(req, res, next);
    if (req.session && (<any>req.session).locale) {
        locales.setLocale(req, (<any>req.session).locale);
    } else {
        locales.setLocale(req, 'ja');
    }
});

//COAサービス初期化
COA.initialize({
    endpoint: process.env.COA_API_ENDPOINT,
    refresh_token: process.env.COA_REFRESH_TOKEN
});

//GMOサービス初期化
GMO.initialize({
    endpoint: process.env.GMO_API_ENDPOINT
});

// ルーティング
router(app);

export = app;
