"use strict";
const HTTPStatus = require("http-status");
const logger_1 = require("../../middlewares/logger");
const ErrorUtilModule = require("../Util/ErrorUtilModule");
/**
 * Not Found
 * @memberof ErrorModule
 * @function notFoundRender
 * @param {Request} req
 * @param {Response} res
 * @returns {void}
 */
function notFoundRender(req, res) {
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
function errorRender(err, req, res) {
    let status = HTTPStatus.INTERNAL_SERVER_ERROR;
    let msg = err.message;
    if (err instanceof ErrorUtilModule.CustomError) {
        switch (err.code) {
            case ErrorUtilModule.ErrorType.Property:
                status = HTTPStatus.BAD_REQUEST;
                msg = req.__('common.error.property');
                err.message = 'Error Property';
                break;
            case ErrorUtilModule.ErrorType.Access:
                status = HTTPStatus.BAD_REQUEST;
                msg = req.__('common.error.access');
                err.message = 'Error Access';
                break;
            case ErrorUtilModule.ErrorType.Validation:
                status = HTTPStatus.BAD_REQUEST;
                msg = req.__('common.error.validation');
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
    logger_1.default.error('SSKTS-APP:ErrorModule.index', status, err);
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
