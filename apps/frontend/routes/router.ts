import express = require('express');
import Performances = require('../modules/Performances/PerformancesModule');
import Error = require('../modules/Error/ErrorModule');
import Util = require('../modules/Util/UtilModule');

import purchase = require('./purchase');
import inquiry = require('./inquiry');
import method = require('./method');


let router = express.Router();
export default (app: express.Application) => {

    app.use(Util.Module.setLocals);

    router.get('/', (_req, res, _next) => {
        res.redirect('/performances');
    });

    //パフォーマンス一覧
    router.get('/performances', Performances.Module.index);

    //パフォーマンス一覧
    router.post('/performances', Performances.Module.getPerformances);

    //再起動
    router.get('/500', (_req, _res, _next) => {
        process.exit(1);
    });

    app.use('', router);

    //購入
    app.use('/purchase', purchase);

    //照会
    app.use('/inquiry', inquiry);

    //方法
    app.use('/method', method);



    // error handlers
    app.use(Error.Module.index);

    // 404
    app.use(Error.Module.notFound);
}

