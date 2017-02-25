/**
 * ムビチケ入力
 * @namespace Purchase.Mvtk.MvtkInputModule
 */

import * as MVTK from '@motionpicture/mvtk-service';
import * as express from 'express';
import * as moment from 'moment';
import MvtkInputForm from '../../../forms/Purchase/Mvtk/MvtkInputForm';
import * as PurchaseSession from '../../../models/Purchase/PurchaseModel';

/**
 * ムビチケ券入力ページ表示
 * @memberOf Purchase.Mvtk.MvtkInputModule
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
    if (!purchaseModel.reserveSeats) return next(new Error(req.__('common.error.property')));

    //購入者情報入力表示
    res.locals.error = null;
    res.locals.step = PurchaseSession.PurchaseModel.TICKET_STATE;
    res.locals.transactionId = purchaseModel.transactionMP.id;
    res.locals.reserveSeatLength = purchaseModel.reserveSeats.list_tmp_reserve.length;
    return res.render('purchase/mvtk/input');
}

/**
 * 認証
 * @memberOf Purchase.Mvtk.MvtkInputModule
 * @function auth
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
export function auth(req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (!req.session) return next(new Error(req.__('common.error.property')));
    const purchaseModel = new PurchaseSession.PurchaseModel((<any>req.session).purchase);
    if (!purchaseModel.transactionMP) return next(new Error(req.__('common.error.property')));

    //取引id確認
    if (req.body.transaction_id !== purchaseModel.transactionMP.id) return next(new Error(req.__('common.error.access')));

    const form = MvtkInputForm(req);
    form(req, res, () => {
        if (!(<any>req).form) return next(new Error(req.__('common.error.property')));
        if ((<any>req).form.isValid) {
            if (!purchaseModel.performance) return next(new Error(req.__('common.error.property')));
            const mvtkService = MVTK.createPurchaseNumberAuthService();
            mvtkService.purchaseNumberAuth({
                kgygishCd: 'SSK000', //興行会社コード
                jhshbtsCd: '1', //情報種別コード
                knyknrNoInfoIn: req.body.mvtk.map((value: {
                    code: string,
                    password: string
                }) => {
                    return {
                        KNYKNR_NO: value.code, //購入管理番号
                        PIN_CD: value.password // PINコード
                    };
                }),
                skhnCd: purchaseModel.performance.attributes.film.coa_title_code + '00', //作品コード
                stCd: '18', //サイトコード
                jeiYmd: moment(purchaseModel.performance.attributes.day).format('YYYY/MM/DD') //上映年月日
            }).then((result) => {
                console.log(result);
                return res.redirect('/purchase/mvtk/confirm');
            }).catch((err) => {
                return next(new Error(err.message));
            });
        } else {
            if (!purchaseModel.transactionMP) return next(new Error(req.__('common.error.property')));
            if (!purchaseModel.reserveSeats) return next(new Error(req.__('common.error.property')))
            //購入者情報入力表示
            res.locals.error = null;
            res.locals.step = PurchaseSession.PurchaseModel.TICKET_STATE;
            res.locals.transactionId = purchaseModel.transactionMP.id;
            res.locals.reserveSeatLength = purchaseModel.reserveSeats.list_tmp_reserve.length;
            return res.render('purchase/mvtk/input');
        }
    });

}
