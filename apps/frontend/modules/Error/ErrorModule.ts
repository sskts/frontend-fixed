
import express = require('express');

/**
 * エラー
 * @namespace
 */
namespace ErrorModule {
    /**
     * Not Found
     * @function
     */
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
     * @function
     */
    export function index(err: Error, req: express.Request, res: express.Response, _next: express.NextFunction): void {
        console.log(err.stack);

        if (req.session) delete req.session['purchase'];

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
}

export default ErrorModule;
