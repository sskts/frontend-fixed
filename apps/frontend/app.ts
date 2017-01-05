import express = require('express');
import helmet = require('helmet');
import cookieParser = require('cookie-parser');
import bodyParser = require('body-parser');
import logger from './middlewares/logger';
import benchmarks from './middlewares/benchmarks';
import session from './middlewares/session';
import config = require('config');
import router from './routes/router';
import locales from './middlewares/locales';

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

//言語
app.use(locales.init);
// sessionで切り替え
app.use((req, res, next)=> {
    if (req.session['locale']) {
        locales.setLocale(req, req.session['locale']);
    }
    next();
});

// ルーティング
router(app);

export = app;
