import * as debug from 'debug';
import * as HTTPStatus from 'http-status';
import logger from '../../../../app/middlewares/logger';

const log = debug('SSKTS:MP-util');

/**
 * 言語
 * @interface ILanguage
 */
export interface ILanguage {
    en: string;
    ja: string;
}

/**
 * 認証
 * @interface IAuth
 */
export interface IAuth {
    accessToken: string;
}

/**
 * エンドポイント
 * @const endPoint
 */
export const endPoint = process.env.MP_ENDPOINT;

/**
 * タイムアウト
 * @const timeout
 */
export const timeout = 10000;

/**
 * エラー
 * @function errorHandler
 * @param {any} args
 * @param {any} response
 * @requires {void}
 */
export function errorHandler(args: any, response: any): void {
    logger.error('MP-API:errorHandler', args, response.body, response.statusCode);
    if (response.statusCode === HTTPStatus.NOT_FOUND) {
        throw new Error('NOT_FOUND');
    }
    let message: string = '';
    if (response.body.errors !== undefined && Array.isArray(response.body.errors)) {
        for (const error of response.body.errors) {
            if (error.description !== undefined) {
                message = error.description;
                break;
            }
        }
        log(response.body.errors);
    }
    throw new Error(message);
}
