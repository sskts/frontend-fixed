/**
 * エラー
 * @namespace ErrorModule
 */
import { NextFunction, Request, Response } from 'express';
import * as HTTPStatus from 'http-status';
import logger from '../../middlewares/logger';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';

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
                err.message = 'ERROR_PROPERTY';
                break;
            case ErrorUtilModule.ERROR_ACCESS:
                status = HTTPStatus.BAD_REQUEST;
                msg = req.__('common.error.access');
                err.message = 'ERROR_ACCESS';
                break;
            case ErrorUtilModule.ERROR_VALIDATION:
                status = HTTPStatus.BAD_REQUEST;
                msg = req.__('common.error.validation');
                err.message = 'ERROR_VALIDATION';
                break;
            case ErrorUtilModule.ERROR_EXPIRE:
                // 期限切れのときもstatusが400になっている。200に変更するべき？
                status = HTTPStatus.BAD_REQUEST;
                msg = req.__('common.error.expire');
                err.message = 'ERROR_EXPIRE';
                break;
            case ErrorUtilModule.ERROR_GMO:
                status = HTTPStatus.INTERNAL_SERVER_ERROR;
                msg = req.__('common.error.gmo');
                err.message = 'ERROR_GMO';
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
    /**
     * エラーメッセージ
     * ERROR_PROPERTY: プロパティが無い
     * ERROR_ACCESS: 不正なアクセス
     * ERROR_VALIDATION: 不正な値のPOST
     * ERROR_EXPIRE: 有効期限切れ
     * etc: 外部モジュールエラー
     */
    logger.error('SSKTS-APP:ErrorModule.index', status, err);
    if (req.xhr) {
        res.status(status).send({ error: 'Something failed.' });
    } else {
        res.locals.message = msg;
        res.locals.error = err;
        res.status(status).render('error/error');
    }
    return;
}
