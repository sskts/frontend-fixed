/**
 * パフォーマンス一覧
 * @namespace PerformancesModule
 */

import * as express from 'express';
import * as request from 'request';

/**
 * パフォーマンス一覧表示
 * @memberOf PerformancesModule
 * @function index
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
export function index(req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (!req.session) return next(req.__('common.error.property'));
    return res.render('performance');
}

/**
 * パフォーマンスリスト取得
 * @memberOf PerformancesModule
 * @function getPerformances
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {void}
 */
export function getPerformances(req: express.Request, res: express.Response): void {
    const endpoint: string = process.env.MP_API_ENDPOINT;
    const method: string = 'performances';

    const options: request.Options = {
        url: `${endpoint}/${method}/?day=${req.body.day}`,
        method: 'GET',
        json: true
    };

    request.get(options, (error, response, body) => {
        res.json({
            error: error,
            response: response,
            result: body
        });
    });
}
