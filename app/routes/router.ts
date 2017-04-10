/**
 * ルーティング
 */

import * as express from 'express';
import * as SupertestRequest from '../middlewares/supertestRequest';
import * as ErrorModule from '../modules/Error/ErrorModule';
import * as PerformancesModule from '../modules/Performances/PerformancesModule';
import * as UtilModule from '../modules/Util/UtilModule';
import inquiry from './inquiry';
import method from './method';
import purchase from './purchase';

const router = express.Router();

export default (app: express.Application) => {

    if (process.env.NODE_ENV === 'development') {
        app.use(SupertestRequest.supertestSession);
    }

    app.use(UtilModule.setLocals);

    if (process.env.NODE_ENV === 'development') {
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

        //セッション作成
        // tslint:disable-next-line:variable-name
        router.get('/create/session', createSession);

        //スクリーンテスト
        // tslint:disable-next-line:variable-name
        router.get('/screen', (_req, res, _next) => {
            res.render('screens/test');
        });
    }

    app.use('', router);

    //購入
    app.use('/purchase', purchase);

    //照会
    app.use('/inquiry', inquiry);

    //方法
    app.use('/method', method);

    //エラー
    router.get('/error', (req, res, next) => {
        ErrorModule.index(new Error(), req, res, next);
    });
    // error handlers
    app.use(ErrorModule.index);

    // 404
    app.use(ErrorModule.notFound);
};

/**
 * セッション作成
 * @function createSession
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
// tslint:disable-next-line:variable-name
function createSession(req: express.Request, _res: express.Response, next: express.NextFunction): void {
    if (req.session === undefined) {
        next();
        return;
    }
    req.session.purchase = (req.body.purchase !== undefined) ? req.body.purchase : null;
    req.session.inquiry = (req.body.inquiry !== undefined) ? req.body.inquiry : null;
    req.session.complete = (req.body.complete !== undefined) ? req.body.complete : null;
    next();
    return;
}