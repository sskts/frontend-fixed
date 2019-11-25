"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * ムビチケ確認
 * @namespace Purchase.Mvtk.MvtkConfirmModule
 */
const debug = require("debug");
const HTTPStatus = require("http-status");
const models_1 = require("../../../models");
const log = debug('SSKTS:Purchase.Mvtk.MvtkConfirmModule');
/**
 * ムビチケ券適用確認ページ表示
 * @memberof Purchase.Mvtk.MvtkConfirmModule
 * @function render
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
function render(req, res, next) {
    try {
        if (req.session === undefined)
            throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
        const purchaseModel = new models_1.PurchaseModel(req.session.purchase);
        if (purchaseModel.isExpired())
            throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Expire);
        if (req.session.mvtk === undefined) {
            res.redirect('/purchase/mvtk');
            return;
        }
        // ムビチケ券適用確認ページ表示
        res.locals.error = undefined;
        res.locals.purchaseModel = purchaseModel;
        res.locals.mvtk = req.session.mvtk;
        res.locals.purchaseNoList = creatPurchaseNoList(req.session.mvtk);
        res.locals.step = models_1.PurchaseModel.TICKET_STATE;
        res.render('purchase/mvtk/confirm', { layout: 'layouts/purchase/layout' });
    }
    catch (err) {
        next(err);
    }
}
exports.render = render;
/**
 * 購入番号リスト生成
 * @memberof Purchase.Mvtk.MvtkConfirmModule
 * @function creatPurchaseNoList
 * @param {PurchaseSession.Mvtk[]} mvtk
 * @returns {string[]}
 */
function creatPurchaseNoList(mvtk) {
    const result = [];
    for (const target of mvtk) {
        const purchaseNo = result.find((value) => {
            return (value === target.code);
        });
        if (purchaseNo === undefined)
            result.push(target.code);
    }
    return result;
}
/**
 * 券種選択へ
 * @memberof Purchase.Mvtk.MvtkConfirmModule
 * @function submit
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
function submit(req, res, next) {
    try {
        if (req.session === undefined)
            throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
        const purchaseModel = new models_1.PurchaseModel(req.session.purchase);
        if (purchaseModel.isExpired())
            throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Expire);
        if (purchaseModel.transaction === undefined)
            throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
        //取引id確認
        if (req.body.transactionId !== purchaseModel.transaction.id) {
            throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
        }
        // ムビチケ情報を購入セッションへ保存
        log('ムビチケ情報を購入セッションへ保存');
        purchaseModel.mvtk = req.session.mvtk;
        purchaseModel.save(req.session);
        // ムビチケセッション削除
        delete req.session.mvtk;
        res.redirect('/purchase/ticket');
    }
    catch (err) {
        next(err);
    }
}
exports.submit = submit;
