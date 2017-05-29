/**
 * ルーティング
 */

import * as express from 'express';
import * as ErrorModule from '../modules/Error/ErrorModule';
import inplace from './inplace';
import inquiry from './inquiry';
import method from './method';
import purchase from './purchase';
import root from './root';

const router = express.Router();

export default (app: express.Application) => {
    app.use('', root); // ROOT
    app.use('/purchase', purchase); // 購入
    app.use('/inquiry', inquiry); // 照会
    app.use('/method', method); // 方法

    if (process.env.VIEW_TYPE === 'inplace') {
        app.use('', inplace); // 券売機
    }

    //エラー
    router.get('/error', (req, res, next) => {
        ErrorModule.index(new Error(), req, res, next);
    });
    app.use(ErrorModule.index); // error handlers
    app.use(ErrorModule.notFound); // 404
};
