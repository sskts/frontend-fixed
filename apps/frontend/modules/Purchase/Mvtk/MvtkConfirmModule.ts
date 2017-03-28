/**
 * ムビチケ確認
 * @namespace Purchase.Mvtks.MvtkConfirmModule
 */
import * as MVTK from '@motionpicture/mvtk-service';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as PurchaseSession from '../../../models/Purchase/PurchaseModel';
import * as ErrorUtilModule from '../../Util/ErrorUtilModule';
const debugLog = debug('SSKTS ');

/**
 * ムビチケ券適用確認ページ表示
 * @memberOf Purchase.Mvtk.MvtkConfirmModule
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
export function index(req: Request, res: Response, next: NextFunction): void {
    try {
        if (req.session === undefined) throw ErrorUtilModule.ERROR_PROPERTY;
        if (!(<object>req.session).hasOwnProperty('purchase')) throw ErrorUtilModule.ERROR_EXPIRE;
        const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
        if (purchaseModel.transactionMP === null) throw ErrorUtilModule.ERROR_PROPERTY;

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
        res.render('purchase/mvtk/confirm');
        return;
    } catch (err) {
        next(ErrorUtilModule.getError(req, err));
        return;
    }

}

/**
 * 購入番号リスト生成
 * @memberOf Purchase.Mvtk.MvtkConfirmModule
 * @function creatPurchaseNoList
 * @param {PurchaseSession.Mvtk[]} mvtk
 * @returns {string[]}
 */
function creatPurchaseNoList(mvtk: PurchaseSession.IMvtk[]) {
    const result: string[] = [];
    for (const target of mvtk) {
        const purchaseNo = result.find((value) => {
            return (value === target.code);
        });
        if (purchaseNo !== undefined) result.push(target.code);
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
export function submit(req: Request, res: Response, next: NextFunction): void {
    try {
        if (req.session === undefined) throw ErrorUtilModule.ERROR_PROPERTY;
        if (!(<object>req.session).hasOwnProperty('purchase')) throw ErrorUtilModule.ERROR_EXPIRE;
        const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
        if (purchaseModel.transactionMP === null) throw ErrorUtilModule.ERROR_PROPERTY;

        //取引id確認
        if (req.body.transaction_id !== purchaseModel.transactionMP.id) {
            next(ErrorUtilModule.getError(req, ErrorUtilModule.ERROR_ACCESS));
            return;
        }
        // ムビチケ情報を購入セッションへ保存
        debugLog('ムビチケ情報を購入セッションへ保存');
        purchaseModel.mvtk = (<any>req.session).mvtk;
        req.session.purchase = purchaseModel.toSession();
        // ムビチケセッション削除
        delete req.session.mvtk;
        res.redirect('/purchase/ticket');
        return;
    } catch (err) {
        next(ErrorUtilModule.getError(req, err));
        return;
    }
}
