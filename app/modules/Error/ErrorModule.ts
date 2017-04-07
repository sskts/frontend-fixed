/**
 * エラー
 * @namespace ErrorModule
 */
import { NextFunction, Request, Response } from 'express';
import * as HTTPStatus from 'http-status';
import logger from '../../middlewares/logger';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';
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
    const status = HTTPStatus.NOT_FOUND;
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
export function index(err: Error | ErrorUtilModule.CustomError, req: Request, res: Response, _next: NextFunction): void {
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
    logger.error('SSKTS-APP:ErrorModule.index', err);
    if (req.xhr) {
        res.status(status).send({ error: 'Something failed.' });
    } else {
        res.locals.message = msg;
        res.locals.error = err;
        res.locals.portalSite = UtilModule.getPortalUrl();
        res.status(status).render('error/error');
    }
    return;
}
