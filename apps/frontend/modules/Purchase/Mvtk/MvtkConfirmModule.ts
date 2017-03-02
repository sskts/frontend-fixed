/**
 * ムビチケ確認
 * @namespace Purchase.Mvtks.MvtkConfirmModule
 */
import * as MVTK from '@motionpicture/mvtk-service';
import * as debug from 'debug';
import * as express from 'express';
import * as PurchaseSession from '../../../models/Purchase/PurchaseModel';
const debugLog = debug('SSKTS: ');

/**
 * ムビチケ券適用確認ページ表示
 * @memberOf Purchase.Mvtk.MvtkConfirmModule
 * @function index
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
export function index(req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (!req.session) return next(new Error(req.__('common.error.property')));
    const purchaseModel = new PurchaseSession.PurchaseModel((<any>req.session).purchase);
    if (!purchaseModel.transactionMP) return next(new Error(req.__('common.error.property')));

    // ムビチケ券適用確認ページ表示
    res.locals.error = null;
    res.locals.step = PurchaseSession.PurchaseModel.TICKET_STATE;
    res.locals.transactionId = purchaseModel.transactionMP.id;
    res.locals.mvtk = (<any>req.session).mvtk;
    res.locals.MVTK_TICKET_TYPE = MVTK.Constants.TICKET_TYPE;
    return res.render('purchase/mvtk/confirm');
}

/**
 * 券種選択へ
 * @memberOf Purchase.Mvtk.MvtkConfirmModule
 * @function submit
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
export function submit(req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (!req.session) return next(new Error(req.__('common.error.property')));
    const purchaseModel = new PurchaseSession.PurchaseModel((<any>req.session).purchase);
    if (!purchaseModel.transactionMP) return next(new Error(req.__('common.error.property')));

    //取引id確認
    if (req.body.transaction_id !== purchaseModel.transactionMP.id) return next(new Error(req.__('common.error.access')));
    // ムビチケ情報を購入セッションへ保存
    debugLog('ムビチケ情報を購入セッションへ保存');
    purchaseModel.mvtk = (<any>req.session).mvtk;
    (<any>req.session).purchase = purchaseModel.toSession();
    // ムビチケセッション削除
    delete (<any>req.session).mvtk;
    return res.redirect('/purchase/ticket');
}
