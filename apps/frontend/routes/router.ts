/**
 * ルーティング
 */

import * as express from 'express';
import * as ErrorModule from '../modules/Error/ErrorModule';
import * as PerformancesModule from '../modules/Performances/PerformancesModule';
import * as UtilModule from '../modules/Util/UtilModule';
import inquiry from './inquiry';
import method from './method';
import purchase from './purchase';

const router = express.Router();

export default (app: express.Application) => {

    app.use(UtilModule.setLocals);

    // tslint:disable-next-line:variable-name
    router.get('/', (_req, res, _next) => {
        res.redirect('/performances');
    });

    //パフォーマンス一覧
    router.get('/performances', PerformancesModule.index);

    //パフォーマンス一覧
    router.post('/performances', PerformancesModule.getPerformances);

    //再起動
    // tslint:disable-next-line:variable-name
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
};
