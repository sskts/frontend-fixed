/**
 * パフォーマンス一覧
 * @namespace PerformancesModule
 */

import * as express from 'express';
import * as MP from '../../../../libs/MP';

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
    if (!req.session) return next(new Error(req.__('common.error.property')));
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
    MP.getPerformances(req.body.theater, req.body.day).then((result) => {
        res.json({
            error: null,
            result: result
        });
    }).catch((err) => {
        res.json({
            error: err,
            result: null
        });
    });
}
