"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HTTPStatus = require("http-status");
const ErrorUtilModule = require("../Util/ErrorUtilModule");
const UtilModule = require("../Util/UtilModule");
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
function notFound(req, res, _next) {
    const status = HTTPStatus.NOT_FOUND;
    if (req.xhr) {
        res.status(status).send({ error: 'Not Found.' });
    }
    else {
        res.status(status).render('error/notFound');
    }
    return;
}
exports.notFound = notFound;
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
function index(err, req, res, _next) {
    console.error(err.stack);
    let status = HTTPStatus.INTERNAL_SERVER_ERROR;
    let msg = err.message;
    if (err instanceof ErrorUtilModule.CustomError) {
        switch (err.code) {
            case ErrorUtilModule.ERROR_PROPERTY:
                status = HTTPStatus.BAD_REQUEST;
                msg = req.__('common.error.property');
                break;
            case ErrorUtilModule.ERROR_ACCESS:
                status = HTTPStatus.BAD_REQUEST;
                msg = req.__('common.error.access');
                break;
            case ErrorUtilModule.ERROR_VALIDATION:
                status = HTTPStatus.BAD_REQUEST;
                msg = req.__('common.error.property');
                break;
            case ErrorUtilModule.ERROR_EXPIRE:
                status = HTTPStatus.BAD_REQUEST;
                msg = req.__('common.error.expire');
                break;
            default:
                status = HTTPStatus.INTERNAL_SERVER_ERROR;
                msg = err.message;
                break;
        }
    }
    if (req.session !== undefined) {
        delete req.session.purchase;
        delete req.session.mvtk;
    }
    if (req.xhr) {
        console.error('Something failed.');
        res.status(status).send({ error: 'Something failed.' });
    }
    else {
        console.error(err.message);
        res.locals.message = msg;
        res.locals.error = err;
        res.locals.portalSite = UtilModule.getPortalUrl();
        res.status(status).render('error/error');
    }
    return;
}
exports.index = index;
