"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug");
const HTTPStatus = require("http-status");
const logger_1 = require("../../middlewares/logger");
const log = debug('SSKTS:Error.ErrorModule');
/**
 * Not Found
 * @memberof ErrorModule
 * @function notFoundRender
 * @param {Request} req
 * @param {Response} res
 * @returns {void}
 */
function notFoundRender(req, res, _) {
    const status = HTTPStatus.NOT_FOUND;
    if (req.xhr) {
        res.status(status).send({ error: 'Not Found.' });
    }
    else {
        res.status(status).render('error/notFound');
    }
    return;
}
exports.notFoundRender = notFoundRender;
/**
 * エラーページ
 * @memberof ErrorModule
 * @function errorRender
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
function errorRender(err, req, res, _) {
    let status = HTTPStatus.INTERNAL_SERVER_ERROR;
    let msg = err.message;
    if (err.hasOwnProperty('errors')) {
        switch (err.code) {
            case HTTPStatus.BAD_REQUEST:
                msg = req.__('common.error.badRequest');
                break;
            case HTTPStatus.UNAUTHORIZED:
                msg = req.__('common.error.unauthorized');
                break;
            case HTTPStatus.FORBIDDEN:
                msg = req.__('common.error.forbidden');
                break;
            case HTTPStatus.NOT_FOUND:
                msg = req.__('common.error.notFound');
                break;
            case HTTPStatus.SERVICE_UNAVAILABLE:
                msg = req.__('common.error.serviceUnavailable');
                logger_1.default.error('SSKTS-APP:ErrorModule', status, err.message, err);
                break;
            default:
                msg = req.__('common.error.internalServerError');
                logger_1.default.error('SSKTS-APP:ErrorModule', status, err.message, err);
                break;
        }
        status = err.code;
    }
    else {
        log('Error');
        status = HTTPStatus.INTERNAL_SERVER_ERROR;
        msg = req.__('common.error.internalServerError');
        logger_1.default.error('SSKTS-APP:ErrorModule', 'Error', status, err.message, err);
    }
    deleteSession(req.session);
    /**
     * エラーメッセージ
     * Property: プロパティが無い
     * Access: 不正なアクセス
     * Validation: 不正な値のPOST
     * Expire: 有効期限切れ
     * ExternalModule: 外部モジュールエラー
     */
    if (req.xhr) {
        res.status(status).send({ error: 'Something failed.' });
    }
    else {
        res.locals.message = msg;
        res.locals.error = err;
        res.status(status).render('error/error');
    }
    return;
}
exports.errorRender = errorRender;
/**
 * セッション削除
 * @function deleteSession
 * @param {Express.Session | undefined} session
 */
function deleteSession(session) {
    if (session !== undefined) {
        delete session.purchase;
        delete session.mvtk;
        delete session.complete;
        delete session.auth;
    }
}
exports.deleteSession = deleteSession;
