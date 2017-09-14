/**
 * 購入完了
 * @namespace Purchase.CompleteModule
 */
"use strict";
const PurchaseModel_1 = require("../../models/Purchase/PurchaseModel");
const ErrorUtilModule = require("../Util/ErrorUtilModule");
/**
 * 購入完了表示
 * @memberof Purchase.CompleteModule
 * @function render
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
function render(req, res, next) {
    try {
        if (req.session === undefined)
            throw ErrorUtilModule.ErrorType.Property;
        if (req.session.complete === undefined)
            throw ErrorUtilModule.ErrorType.Access;
        //購入者内容確認表示
        const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.complete);
        res.locals.purchaseModel = purchaseModel;
        res.locals.step = PurchaseModel_1.PurchaseModel.COMPLETE_STATE;
        res.render('purchase/complete', { layout: 'layouts/purchase/layout' });
        return;
    }
    catch (err) {
        const error = (err instanceof Error) ? err : new ErrorUtilModule.AppError(err, undefined);
        next(error);
        return;
    }
}
exports.render = render;
