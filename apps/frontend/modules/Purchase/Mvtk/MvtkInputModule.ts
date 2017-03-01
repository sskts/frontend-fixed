/**
 * ムビチケ入力
 * @namespace Purchase.Mvtk.MvtkInputModule
 */

import * as COA from '@motionpicture/coa-service';
import * as MVTK from '@motionpicture/mvtk-service';
import * as debug from 'debug';
import * as express from 'express';
import * as moment from 'moment';
import MvtkInputForm from '../../../forms/Purchase/Mvtk/MvtkInputForm';
import * as PurchaseSession from '../../../models/Purchase/PurchaseModel';
const debugLog = debug('SSKTS: ');

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
 * 券種選択
 * @memberOf Purchase.Mvtk.MvtkInputModule
 * @function select
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
export function select(req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (!req.session) return next(new Error(req.__('common.error.property')));
    const purchaseModel = new PurchaseSession.PurchaseModel((<any>req.session).purchase);
    if (!purchaseModel.transactionMP) return next(new Error(req.__('common.error.property')));

    //取引id確認
    if (req.body.transaction_id !== purchaseModel.transactionMP.id) return next(new Error(req.__('common.error.access')));

    const form = MvtkInputForm(req);
    form(req, res, () => {
        if (!(<any>req).form) return next(new Error(req.__('common.error.property')));
        if ((<any>req).form.isValid) {
            auth(req, purchaseModel).then(() => {
                return res.redirect('/purchase/mvtk/confirm');
            }).catch((err) => {
                return next(new Error(err.message));
            });
        } else {
            if (!purchaseModel.transactionMP) return next(new Error(req.__('common.error.property')));
            if (!purchaseModel.reserveSeats) return next(new Error(req.__('common.error.property')));
            //購入者情報入力表示
            res.locals.error = null;
            res.locals.step = PurchaseSession.PurchaseModel.TICKET_STATE;
            res.locals.transactionId = purchaseModel.transactionMP.id;
            res.locals.reserveSeatLength = purchaseModel.reserveSeats.list_tmp_reserve.length;
            return res.render('purchase/mvtk/input');
        }
    });
}

/**
 * 認証
 * @memberOf Purchase.Mvtk.MvtkInputModule
 * @function auth
 * @param {express.Request} req
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {Promise<void>}
 */
export async function auth(req: express.Request, purchaseModel: PurchaseSession.PurchaseModel): Promise<void> {
    if (!purchaseModel.performance) throw new Error(req.__('common.error.property'));
    const mvtkService = MVTK.createPurchaseNumberAuthService();
    const inputInfo: InputInfo[] = JSON.parse(req.body.mvtk);
    const siteCode = (process.env.NODE_ENV === 'dev')
        ? '15'
        : String(Number(purchaseModel.performance.attributes.theater.id));
    const num = 10;
    const branchNo = (Number(purchaseModel.performance.attributes.film.coa_title_branch_num) < num)
        ? '0' + purchaseModel.performance.attributes.film.coa_title_branch_num
        : purchaseModel.performance.attributes.film.coa_title_branch_num;

    const result = await mvtkService.purchaseNumberAuth({
        kgygishCd: 'SSK000', //興行会社コード
        jhshbtsCd: '1', //情報種別コード
        knyknrNoInfoIn: inputInfo.map((value) => {
            return {
                KNYKNR_NO: value.code, //購入管理番号
                PIN_CD: value.password // PINコード
            };
        }),
        skhnCd: purchaseModel.performance.attributes.film.coa_title_code + branchNo, //作品コード
        stCd: siteCode, //todoサイトコード
        jeiYmd: moment(purchaseModel.performance.attributes.day).format('YYYY/MM/DD') //上映年月日
    });

    debugLog('ムビチケ認証: ', result);

    const mvtkList: PurchaseSession.Mvtk[] = [];
    for (const purchaseNumberAuthResult of result) {
        for (const info of purchaseNumberAuthResult.ykknInfo) {
            const input = inputInfo.find((value) => {
                return (value.code === purchaseNumberAuthResult.knyknrNo);
            });
            // ムビチケチケットコード取得
            // const ticketCode = await COA.MasterService.mvtkTicketcode({
            //     theater_code: purchaseModel.performance.attributes.theater.id,
            //     kbn_denshiken: MVTK.Constants.ELECTRONIC_TICKET_ELECTRONIC,
            //     kbn_maeuriken: MVTK.Constants.ADVANCE_TICKET_COMMON,
            //     kbn_kensyu: info.ykknshTyp,
            //     sales_price: Number(info.knshknhmbiUnip),
            //     app_price: Number(info.kijUnip)
            // });
            const ticketCode = '01';
            const ticketType = MVTK.Constants.TICKET_TYPE.find((value) => {
                return (value.code === info.ykknshTyp);
            });
            mvtkList.push({
                code: purchaseNumberAuthResult.knyknrNo,
                password: (input) ? input.password : '',
                ykknInfo: info,
                ticketCode: ticketCode,
                ticketName: (ticketType) ? ticketType.name : ''
            });
        }
    }
    purchaseModel.mvtk = mvtkList;
    (<any>req.session).purchase = purchaseModel.toSession();
}

/**
 * 入力情報
 * InputInfo
 */
interface InputInfo {
    /**
     * 購入管理番号
     */
    code: string;
    /**
     * PINコード
     */
    password: string;
}
