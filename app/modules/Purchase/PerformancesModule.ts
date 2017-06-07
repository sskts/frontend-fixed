/**
 * パフォーマンス一覧
 * @namespace Purchase.PerformancesModule
 */

import { NextFunction, Request, Response } from 'express';
import * as MP from '../../../libs/MP';
import * as PurchaseSession from '../../models/Purchase/PurchaseModel';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';

/**
 * パフォーマンス一覧表示
 * @memberof Purchase.PerformancesModule
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
    res.locals.step = PurchaseSession.PurchaseModel.PERFORMANCE_STATE;
    res.render('purchase/performances', { layout: 'layouts/purchase/layout' });

    return;
}

/**
 * パフォーマンスリスト取得
 * @memberof Purchase.PerformancesModule
 * @function getPerformances
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getPerformances(req: Request, res: Response): Promise<void> {
    try {
        const result = await MP.getPerformances(req.body.theater, req.body.day);
        res.json({ error: null, result: result });
    } catch (err) {
        res.json({ error: err, result: null });
    }
}
