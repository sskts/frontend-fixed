/**
 * エラー
 * @namespace ErrorModule
 */
"use strict";
const debug = require("debug");
const debugLog = debug('SSKTS ');
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
exports.notFound = notFound;
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
function index(err, req, res, _next) {
    debugLog(err.stack);
    // if (req.session) {
    //     delete (<any>req.session).purchase;
    //     delete (<any>req.session).mvtk;
    // }
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
exports.index = index;
