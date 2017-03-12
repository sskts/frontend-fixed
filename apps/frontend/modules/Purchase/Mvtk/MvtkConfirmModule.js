"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * ムビチケ確認
 * @namespace Purchase.Mvtks.MvtkConfirmModule
 */
const MVTK = require("@motionpicture/mvtk-service");
const debug = require("debug");
const PurchaseSession = require("../../../models/Purchase/PurchaseModel");
const debugLog = debug('SSKTS ');
/**
 * ムビチケ券適用確認ページ表示
 * @memberOf Purchase.Mvtk.MvtkConfirmModule
 * @function index
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
function index(req, res, next) {
    if (!req.session)
        return next(new Error(req.__('common.error.property')));
    const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
    if (!purchaseModel.transactionMP)
        return next(new Error(req.__('common.error.property')));
    // ムビチケ券適用確認ページ表示
    res.locals.error = null;
    res.locals.step = PurchaseSession.PurchaseModel.TICKET_STATE;
    res.locals.transactionId = purchaseModel.transactionMP.id;
    res.locals.mvtk = req.session.mvtk;
    res.locals.MVTK_TICKET_TYPE = MVTK.Constants.TICKET_TYPE;
    return res.render('purchase/mvtk/confirm');
}
exports.index = index;
/**
 * 券種選択へ
 * @memberOf Purchase.Mvtk.MvtkConfirmModule
 * @function submit
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
function submit(req, res, next) {
    if (!req.session)
        return next(new Error(req.__('common.error.property')));
    const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
    if (!purchaseModel.transactionMP)
        return next(new Error(req.__('common.error.property')));
    //取引id確認
    if (req.body.transaction_id !== purchaseModel.transactionMP.id)
        return next(new Error(req.__('common.error.access')));
    // ムビチケ情報を購入セッションへ保存
    debugLog('ムビチケ情報を購入セッションへ保存');
    purchaseModel.mvtk = req.session.mvtk;
    req.session.purchase = purchaseModel.toSession();
    // ムビチケセッション削除
    delete req.session.mvtk;
    return res.redirect('/purchase/ticket');
}
exports.submit = submit;
