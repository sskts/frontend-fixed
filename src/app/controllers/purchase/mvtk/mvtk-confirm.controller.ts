/**
 * ムビチケ確認
 * @namespace Purchase.Mvtk.MvtkConfirmModule
 */
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as HTTPStatus from 'http-status';
import { AppError, ErrorType, IMovieTicket, PurchaseModel } from '../../../models';

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
export function render(req: Request, res: Response, next: NextFunction): void {
    try {
        if (req.session === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        const purchaseModel = new PurchaseModel(req.session.purchase);
        if (purchaseModel.isExpired()) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Expire);
        if (req.session.mvtk === undefined) {
            res.redirect('/purchase/mvtk');

            return;
        }

        // ムビチケ券適用確認ページ表示
        res.locals.error = undefined;
        res.locals.purchaseModel = purchaseModel;
        res.locals.mvtk = req.session.mvtk;
        res.locals.purchaseNoList = creatPurchaseNoList(req.session.mvtk);
        res.locals.step = PurchaseModel.TICKET_STATE;
        res.render('purchase/mvtk/confirm', { layout: 'layouts/purchase/layout' });
    } catch (err) {
        next(err);
    }
}

/**
 * 購入番号リスト生成
 * @memberof Purchase.Mvtk.MvtkConfirmModule
 * @function creatPurchaseNoList
 * @param {PurchaseSession.IMovieTicket[]} movieTicket
 * @returns {string[]}
 */
function creatPurchaseNoList(movieTickets: IMovieTicket[]) {
    const result: string[] = [];
    for (const target of movieTickets) {
        const purchaseNo = result.find((value) => {
            return (value === target.code);
        });
        if (purchaseNo === undefined) result.push(target.code);
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
export function submit(req: Request, res: Response, next: NextFunction): void {
    try {
        if (req.session === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        const purchaseModel = new PurchaseModel(req.session.purchase);
        if (purchaseModel.isExpired()) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Expire);
        if (purchaseModel.transaction === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);

        //取引id確認
        if (req.body.transactionId !== purchaseModel.transaction.id) {
            throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        }
        // ムビチケ情報を購入セッションへ保存
        log('ムビチケ情報を購入セッションへ保存');
        purchaseModel.mvtk = req.session.mvtk;
        purchaseModel.save(req.session);
        // ムビチケセッション削除
        delete req.session.mvtk;
        res.redirect('/purchase/ticket');
    } catch (err) {
        next(err);
    }
}
