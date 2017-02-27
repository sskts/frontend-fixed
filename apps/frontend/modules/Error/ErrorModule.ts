/**
 * エラー
 * @namespace ErrorModule
 */

import * as express from 'express';

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
    console.log(err.stack);

    // if (req.session) delete (<any>req.session).purchase;

    const status = 500;

    if (req.xhr) {
        res.status(status).send({ error: 'Something failed.' });
    } else {
        res.status(status);
        res.locals.message = err.message;
        res.locals.error = err;
        return res.render('error/error');
    }
}
