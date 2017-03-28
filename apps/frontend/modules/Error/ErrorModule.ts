/**
 * エラー
 * @namespace ErrorModule
 */

import {NextFunction, Request, Response} from 'express';
import * as PurchaseSession from '../../models/Purchase/PurchaseModel';
import * as UtilModule from '../Util/UtilModule';
/**
 * Not Found
 * @memberOf ErrorModule
 * @function notFound
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
// tslint:disable-next-line:variable-name
export function notFound(req: Request, res: Response, _next: NextFunction): void {
    const status = 404;
    if (req.xhr) {
        res.status(status).send({ error: 'Not Found.' });
    } else {
        res.status(status).render('error/notFound');
    }
    return;
}

/**
 * エラーページ
 * @memberOf ErrorModule
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
// tslint:disable-next-line:variable-name
export function index(err: Error, req: Request, res: Response, _next: NextFunction): void {
    if (process.env.NODE_ENV === 'development') console.error('show Error');
    console.error(err.stack);

    if (req.session !== undefined && req.session.hasOwnProperty('purchase')) {
        const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
        res.locals.prevLink = (purchaseModel.performance !== null)
            ? UtilModule.getTheaterUrl(purchaseModel.performance.attributes.theater.name.en)
            : UtilModule.getPortalUrl();
    } else {
        res.locals.prevLink = UtilModule.getPortalUrl();
    }

    if (req.session !== undefined) {
        delete req.session.purchase;
        delete req.session.mvtk;
    }

    const status = 500;

    if (req.xhr) {
        console.error('Something failed.');
        res.status(status).send({ error: 'Something failed.' });
    } else {
        console.error(err.message);
        res.locals.message = err.message;
        res.locals.error = err;
        res.status(status).render('error/error');
    }
    return;
}
