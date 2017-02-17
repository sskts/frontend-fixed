"use strict";
/**
 * エラー
 * @namespace
 */
var ErrorModule;
(function (ErrorModule) {
    /**
     * Not Found
     * @function
     */
    // tslint:disable-next-line:variable-name
    function notFound(req, res, _next) {
        const status = 404;
        if (req.xhr) {
            res.status(status).send({ error: 'Not Found.' });
        }
        else {
            res.status(status);
            return res.render('error/notFound');
        }
    }
    ErrorModule.notFound = notFound;
    /**
     * エラーページ
     * @function
     */
    // tslint:disable-next-line:variable-name
    function index(err, req, res, _next) {
        console.log(err.stack);
        if (req.session)
            delete req.session.purchase;
        const status = 500;
        if (req.xhr) {
            res.status(status).send({ error: 'Something failed.' });
        }
        else {
            res.status(status);
            res.locals.message = err.message;
            res.locals.error = err;
            return res.render('error/error');
        }
    }
    ErrorModule.index = index;
})(ErrorModule || (ErrorModule = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ErrorModule;
