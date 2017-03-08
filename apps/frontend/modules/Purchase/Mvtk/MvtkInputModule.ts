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
import * as UtilModule from '../../Util/UtilModule';
const debugLog = debug('SSKTS ');

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

    // ムビチケセッション削除
    delete (<any>req.session).mvtk;

    // 購入者情報入力表示
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
    // サイトコード
    const siteCode = (process.env.NODE_ENV === 'dev')
        ? '15'
        : String(Number(purchaseModel.performance.attributes.theater.id));
    // 作品コード
    const num = 10;
    const filmNo = (Number(purchaseModel.performance.attributes.film.coa_title_branch_num) < num)
        ? `${purchaseModel.performance.attributes.film.coa_title_code}0${purchaseModel.performance.attributes.film.coa_title_branch_num}`
        : `${purchaseModel.performance.attributes.film.coa_title_code}${purchaseModel.performance.attributes.film.coa_title_branch_num}`;

    const result = await mvtkService.purchaseNumberAuth({
        kgygishCd: UtilModule.COMPANY_CODE, //興行会社コード
        jhshbtsCd: MVTK.PurchaseNumberAuthUtilities.INFORMATION_TYPE_CODE_VALID, //情報種別コード
        knyknrNoInfoIn: inputInfo.map((value) => {
            return {
                KNYKNR_NO: value.code, //購入管理番号
                PIN_CD: value.password // PINコード
            };
        }),
        skhnCd: filmNo, // 作品コード
        stCd: siteCode, // サイトコード
        jeiYmd: moment(purchaseModel.performance.attributes.day).format('YYYY/MM/DD') //上映年月日
    });

    debugLog('ムビチケ認証');
    const ticketMaster = await COA.MasterService.ticket({
        theater_code: purchaseModel.performance.attributes.theater.id
    });
    const mvtkList: PurchaseSession.Mvtk[] = [];
    for (const purchaseNumberAuthResult of result) {
        for (const info of purchaseNumberAuthResult.ykknInfo) {
            const input = inputInfo.find((value) => {
                return (value.code === purchaseNumberAuthResult.knyknrNo);
            });
            if (!input) continue;

            // ムビチケチケットコード取得
            const ticketCode = await COA.MasterService.mvtkTicketcode({
                theater_code: purchaseModel.performance.attributes.theater.id,
                kbn_denshiken: MVTK.Constants.ELECTRONIC_TICKET_ELECTRONIC,
                kbn_maeuriken: MVTK.Constants.ADVANCE_TICKET_COMMON,
                kbn_kensyu: info.ykknshTyp,
                sales_price: Number(info.knshknhmbiUnip),
                app_price: Number(info.kijUnip)
            });

            // チケットマスター取得
            const ticket = ticketMaster.find((value) => {
                return (value.ticket_code === ticketCode);
            });
            if (!ticket) continue;

            mvtkList.push({
                code: purchaseNumberAuthResult.knyknrNo,
                password: UtilModule.bace64Encode(input.password),
                ykknInfo: info,
                ticket: {
                    code: ticketCode,
                    name: {
                        ja: ticket.ticket_name,
                        en: ticket.ticket_name_eng
                    }
                }
            });
        }
    }

    (<any>req.session).mvtk = mvtkList;
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
