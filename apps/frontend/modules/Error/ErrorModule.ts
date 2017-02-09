import express = require('express');

export namespace Module {
    /**
     * Not Found
     */
    export function notFound(req: express.Request, res: express.Response, _next: express.NextFunction): void {
        let status = 404;

        if (req.xhr) {
            res.status(status).send({ error: 'Not Found.' });
        } else {
            res.status(status);
            return res.render('error/notFound');
        }
    }

    /**
     * エラーページ
     */
    export function index(err: Error, req: express.Request, res: express.Response, _next: express.NextFunction): void {
        console.log(err.stack);
        
        if (req.session) delete req.session['purchase'];
        
        let status = 500;

        if (req.xhr) {
            res.status(status).send({ error: 'Something failed.' });
        } else {
            res.status(status);
            res.locals['message'] = err.message;
            res.locals['error'] = err;
            return res.render('error/error');
        }
    }
}