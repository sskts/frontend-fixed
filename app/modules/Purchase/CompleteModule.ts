/**
 * 購入完了
 * @namespace Purchase.CompleteModule
 */

import { NextFunction, Request, Response } from 'express';
import * as HTTPStatus from 'http-status';
import { PurchaseModel } from '../../models/Purchase/PurchaseModel';
import { AppError, ErrorType } from '../Util/ErrorUtilModule';
/**
 * 購入完了表示
 * @memberof Purchase.CompleteModule
 * @function render
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
export function render(req: Request, res: Response, next: NextFunction): void {
    try {
        if (req.session === undefined
            || req.session.complete === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        //購入者内容確認表示
        const purchaseModel = new PurchaseModel(req.session.complete);
        res.locals.purchaseModel = purchaseModel;
        res.locals.step = PurchaseModel.COMPLETE_STATE;
        res.render('purchase/complete', { layout: 'layouts/purchase/layout' });
    } catch (err) {
        next(err);
    }
}
