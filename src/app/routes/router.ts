/**
 * ルーティング
 */

import * as express from 'express';
import * as moment from 'moment';
import {
    errorRender,
    notFoundRender,
} from '../controllers/error/error.controller';
import { escapeHtml, formatPrice, timeFormat } from '../functions';
import { requireSDK } from '../middlewares/requireSDK';
import fixedRouter from './fixed';
import inquiryRouter from './inquiry';

const router = express.Router();

export default (app: express.Application) => {
    app.use(requireSDK as express.RequestHandler);
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
    app.use('/inquiry', inquiryRouter); // 照会

    // エラー
    router.get('/error', async (req, res, next) => {
        await errorRender(new Error(), req, res, next);
    });
    app.use(notFoundRender); // 404
    app.use(errorRender); // error handlers
};
