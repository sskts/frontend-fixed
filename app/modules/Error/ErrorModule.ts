/**
 * エラー
 * @namespace ErrorModule
 */
import * as sasaki from '@motionpicture/sasaki-api-nodejs';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as HTTPStatus from 'http-status';

import logger from '../../middlewares/logger';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';

const log = debug('SSKTS:Error.ErrorModule');

/**
 * Not Found
 * @memberof ErrorModule
 * @function notFoundRender
 * @param {Request} req
 * @param {Response} res
 * @returns {void}
 */
export function notFoundRender(req: Request, res: Response, _: NextFunction): void {
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
 * @memberof ErrorModule
 * @function errorRender
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
export function errorRender(
    err: Error | ErrorUtilModule.AppError | sasaki.transporters.RequestError,
    req: Request,
    res: Response,
    _: NextFunction
): void {
    let status = HTTPStatus.INTERNAL_SERVER_ERROR;
    let msg = err.message;
    if (err instanceof ErrorUtilModule.AppError) {
        log('APPエラー', err);
        switch (err.code) {
            case ErrorUtilModule.ErrorType.Property:
                status = HTTPStatus.BAD_REQUEST;
                msg = req.__('common.error.badRequest');
                err.message = 'Error Property';
                break;
            case ErrorUtilModule.ErrorType.Access:
                status = HTTPStatus.BAD_REQUEST;
                msg = req.__('common.error.badRequest');
                err.message = 'Error Access';
                break;
            case ErrorUtilModule.ErrorType.Validation:
                status = HTTPStatus.BAD_REQUEST;
                msg = req.__('common.error.badRequest');
                err.message = 'Error Validation';
                break;
            case ErrorUtilModule.ErrorType.Expire:
                // 期限切れのときもstatusが400になっている。200に変更するべき？
                status = HTTPStatus.BAD_REQUEST;
                msg = req.__('common.error.expire');
                err.message = 'Error Expire';
                break;
            default:
                status = HTTPStatus.INTERNAL_SERVER_ERROR;
                msg = err.message;
                break;
        }
    } else if (err.hasOwnProperty('errors')) {
        log('APIエラー', err);
        switch ((<sasaki.transporters.RequestError>err).code) {
            case HTTPStatus.BAD_REQUEST:
                status = HTTPStatus.BAD_REQUEST;
                msg = req.__('common.error.badRequest');
                break;
            case HTTPStatus.UNAUTHORIZED:
                status = HTTPStatus.UNAUTHORIZED;
                msg = req.__('common.error.unauthorized');
                break;
            case HTTPStatus.FORBIDDEN:
                status = HTTPStatus.FORBIDDEN;
                msg = req.__('common.error.forbidden');
                break;
            case HTTPStatus.NOT_FOUND:
                status = HTTPStatus.NOT_FOUND;
                msg = req.__('common.error.notFound');
                break;
            case HTTPStatus.SERVICE_UNAVAILABLE:
                status = HTTPStatus.SERVICE_UNAVAILABLE;
                msg = req.__('common.error.serviceUnavailable');
                break;
            default:
                status = HTTPStatus.INTERNAL_SERVER_ERROR;
                msg = req.__('common.error.internalServerError');
                break;
        }
    } else {
        log('defaultエラー');
        status = HTTPStatus.INTERNAL_SERVER_ERROR;
        msg = req.__('common.error.internalServerError');
    }

    if (req.session !== undefined) {
        delete req.session.purchase;
        delete req.session.mvtk;
        delete req.session.complete;
        delete req.session.auth;
    }
    /**
     * エラーメッセージ
     * Property: プロパティが無い
     * Access: 不正なアクセス
     * Validation: 不正な値のPOST
     * Expire: 有効期限切れ
     * ExternalModule: 外部モジュールエラー
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
