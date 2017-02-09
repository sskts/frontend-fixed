import express = require('express');
import PerformancesModule from '../modules/Performances/PerformancesModule';
import ErrorModule from '../modules/Error/ErrorModule';
import UtilModule from '../modules/Util/UtilModule';

import purchase from './purchase';
import inquiry from './inquiry';
import method from './method';


let router = express.Router();
export default (app: express.Application) => {

    app.use(UtilModule.setLocals);

    router.get('/', (_req, res, _next) => {
        res.redirect('/performances');
    });

    //パフォーマンス一覧
    router.get('/performances', PerformancesModule.index);

    //パフォーマンス一覧
    router.post('/performances', PerformancesModule.getPerformances);

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
    app.use(ErrorModule.index);

    // 404
    app.use(ErrorModule.notFound);
}

