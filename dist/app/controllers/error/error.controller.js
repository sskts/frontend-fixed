"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSession = exports.errorRender = exports.notFoundRender = void 0;
const debug = require("debug");
const HTTPStatus = require("http-status");
const logger_1 = require("../../middlewares/logger");
const models_1 = require("../../models");
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
function errorRender(err, req, res, _next) {
    return __awaiter(this, void 0, void 0, function* () {
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
            }
            if (err.errorType !== undefined &&
                err.errorType === models_1.ErrorType.Expire) {
                msg = req.__('common.error.expire');
            }
            status = err
                .code;
        }
        else {
            log('Error', err);
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
    });
}
exports.errorRender = errorRender;
/**
 * セッション削除
 * @function deleteSession
 */
function deleteSession(session) {
    if (session !== undefined) {
        delete session.auth;
    }
}
exports.deleteSession = deleteSession;
