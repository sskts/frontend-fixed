/**
 * 購入完了
 * @namespace Purchase.CompleteModule
 */

import { NextFunction, Request, Response } from 'express';
import { PurchaseModel } from '../../models/Purchase/PurchaseModel';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';
/**
 * 購入完了表示
 * @memberof Purchase.CompleteModule
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
export function index(req: Request, res: Response, next: NextFunction): void {
    try {
        if (req.session === undefined) throw ErrorUtilModule.ERROR_PROPERTY;
        if (req.session.complete === undefined) throw ErrorUtilModule.ERROR_ACCESS;
        //購入者内容確認表示
        const purchaseModel = new PurchaseModel(req.session.complete);
        res.locals.purchaseModel = purchaseModel;
        res.locals.step = PurchaseModel.COMPLETE_STATE;
        res.render('purchase/complete', { layout: 'layouts/purchase/layout' });

        return;
    } catch (err) {
        const error = (err instanceof Error)
            ? new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message)
            : new ErrorUtilModule.CustomError(err, undefined);
        next(error);

        return;
    }
}
