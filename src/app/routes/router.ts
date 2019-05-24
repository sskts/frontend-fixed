/**
 * ルーティング
 */

import * as express from 'express';
import * as moment from 'moment';
import { errorRender, notFoundRender } from '../controllers/error/error.controller';
import { escapeHtml, formatPrice, timeFormat } from '../functions';
import fixedRouter from './fixed';
import inquiryRouter from './inquiry';
import methodRouter from './method';
import purchaseRouter from './purchase';
import screenRouter from './screen';

const router = express.Router();

export default (app: express.Application) => {
    // tslint:disable-next-line:variable-name
    app.use((_req, res, next) => {
        res.locals.escapeHtml = escapeHtml;
        res.locals.formatPrice = formatPrice;
        res.locals.moment = moment;
        res.locals.timeFormat = timeFormat;
        res.locals.portalSite = process.env.PORTAL_SITE_URL;
        res.locals.env = process.env.NODE_ENV;
        res.locals.appSiteUrl = process.env.APP_SITE_URL;
        next();
    });
    app.use('', fixedRouter); // 券売機
    app.use('/purchase', purchaseRouter); // 購入
    app.use('/inquiry', inquiryRouter); // 照会
    app.use('/method', methodRouter); // 方法
    app.use('/screen', screenRouter); // スクリーン

    //エラー
    router.get('/error', (req, res, next) => {
        errorRender(new Error(), req, res, next);
    });
    app.use(notFoundRender); // 404
    app.use(errorRender); // error handlers
};
