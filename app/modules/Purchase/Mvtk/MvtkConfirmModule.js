"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * ムビチケ確認
 * @namespace Purchase.Mvtks.MvtkConfirmModule
 */
const MVTK = require("@motionpicture/mvtk-service");
const debug = require("debug");
const PurchaseSession = require("../../../models/Purchase/PurchaseModel");
const ErrorUtilModule = require("../../Util/ErrorUtilModule");
const log = debug('SSKTS');
/**
 * ムビチケ券適用確認ページ表示
 * @memberOf Purchase.Mvtk.MvtkConfirmModule
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
function index(req, res, next) {
    try {
        if (req.session === undefined)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (req.session.purchase === undefined)
            throw ErrorUtilModule.ERROR_EXPIRE;
        const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
        if (purchaseModel.transactionMP === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (req.session.mvtk === null) {
            res.redirect('/purchase/mvtk');
            return;
        }
        // ムビチケ券適用確認ページ表示
        res.locals.error = null;
        res.locals.step = PurchaseSession.PurchaseModel.TICKET_STATE;
        res.locals.transactionId = purchaseModel.transactionMP.id;
        res.locals.mvtk = req.session.mvtk;
        res.locals.purchaseNoList = creatPurchaseNoList(req.session.mvtk);
        res.locals.MVTK_TICKET_TYPE = MVTK.Constants.TICKET_TYPE;
        res.render('purchase/mvtk/confirm', { layout: 'layouts/purchase/layout' });
        return;
    }
    catch (err) {
        const error = (err instanceof Error)
            ? new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message)
            : new ErrorUtilModule.CustomError(err, undefined);
        next(error);
        return;
    }
}
exports.index = index;
/**
 * 購入番号リスト生成
 * @memberOf Purchase.Mvtk.MvtkConfirmModule
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
 * @memberOf Purchase.Mvtk.MvtkConfirmModule
 * @function submit
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
function submit(req, res, next) {
    try {
        if (req.session === undefined)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (req.session.purchase === undefined)
            throw ErrorUtilModule.ERROR_EXPIRE;
        const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
        if (purchaseModel.transactionMP === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        //取引id確認
        if (req.body.transaction_id !== purchaseModel.transactionMP.id) {
            throw ErrorUtilModule.ERROR_ACCESS;
        }
        // ムビチケ情報を購入セッションへ保存
        log('ムビチケ情報を購入セッションへ保存');
        purchaseModel.mvtk = req.session.mvtk;
        req.session.purchase = purchaseModel.toSession();
        // ムビチケセッション削除
        delete req.session.mvtk;
        res.redirect('/purchase/ticket');
        return;
    }
    catch (err) {
        const error = (err instanceof Error)
            ? new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message)
            : new ErrorUtilModule.CustomError(err, undefined);
        next(error);
        return;
    }
}
exports.submit = submit;
