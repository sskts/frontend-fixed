/**
 * パフォーマンス一覧
 * @namespace PerformancesModule
 */

import {NextFunction, Request, Response} from 'express';
import * as MP from '../../../libs/MP';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';

/**
 * パフォーマンス一覧表示
 * @memberOf PerformancesModule
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
export function index(req: Request, res: Response, next: NextFunction): void {
    if (req.session === undefined) {
        next(new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_PROPERTY, undefined));
        return;
    }
    res.render('performance');
    return;
}

/**
 * パフォーマンスリスト取得
 * @memberOf PerformancesModule
 * @function getPerformances
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export async function getPerformances(req: Request, res: Response): Promise<Response> {
    try {
        const result = await MP.getPerformances(req.body.theater, req.body.day);
        return res.json({ error: null, result: result });
    } catch (err) {
        return res.json({ error: err, result: null });
    }
}
