/**
 * エラー
 * @namespace ErrorModule
 */

import * as express from 'express';
import * as PurchaseSession from '../../models/Purchase/PurchaseModel';

/**
 * Not Found
 * @memberOf ErrorModule
 * @function notFound
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
// tslint:disable-next-line:variable-name
export function notFound(req: express.Request, res: express.Response, _next: express.NextFunction): void {
    const status = 404;

    if (req.xhr) {
        res.status(status).send({ error: 'Not Found.' });
    } else {
        res.status(status);
        return res.render('error/notFound');
    }
}

/**
 * エラーページ
 * @memberOf ErrorModule
 * @function index
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
// tslint:disable-next-line:variable-name
export function index(err: Error, req: express.Request, res: express.Response, _next: express.NextFunction): void {
    console.error(err.stack);

    if (req.session && req.session.purchase) {
        const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
        res.locals.prevLink = (purchaseModel.performance)
            ? `/theater/${purchaseModel.performance.attributes.theater.name.en}`
            : '';
    } else {
        res.locals.prevLink = '';
    }

    if (req.session) {
        delete req.session.purchase;
        delete req.session.mvtk;
    }

    const status = 500;

    if (req.xhr) {
        console.error('Something failed.');
        res.status(status).send({ error: 'Something failed.' });
    } else {
        console.error(err);
        res.status(status);
        res.locals.message = err.message;
        res.locals.error = err;
        return res.render('error/error');
    }
}
