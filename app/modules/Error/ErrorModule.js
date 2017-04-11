"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HTTPStatus = require("http-status");
const logger_1 = require("../../middlewares/logger");
const ErrorUtilModule = require("../Util/ErrorUtilModule");
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
                msg = req.__('common.error.validation');
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
    logger_1.default.error('SSKTS-APP:ErrorModule.index', err);
    if (req.xhr) {
        res.status(status).send({ error: 'Something failed.' });
    }
    else {
        res.locals.message = msg;
        res.locals.error = err;
        res.locals.portalSite = process.env.PORTAL_SITE_URL;
        res.status(status).render('error/error');
    }
    return;
}
exports.index = index;
