/**
 * ムビチケ入力
 * @namespace Purchase.Mvtk.MvtkInputModule
 */

import * as COA from '@motionpicture/coa-service';
import * as MVTK from '@motionpicture/mvtk-service';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as moment from 'moment';
import MvtkInputForm from '../../../forms/Purchase/Mvtk/MvtkInputForm';
import * as PurchaseSession from '../../../models/Purchase/PurchaseModel';
import * as MvtkUtilModule from '../../Purchase/Mvtk/MvtkUtilModule';
import * as ErrorUtilModule from '../../Util/ErrorUtilModule';
import * as UtilModule from '../../Util/UtilModule';
const log = debug('SSKTS');

/**
 * ムビチケ券入力ページ表示
 * @memberOf Purchase.Mvtk.MvtkInputModule
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
export function index(req: Request, res: Response, next: NextFunction): void {
    try {
        if (req.session === undefined) throw ErrorUtilModule.ERROR_PROPERTY;
        if (req.session.purchase === undefined) throw ErrorUtilModule.ERROR_EXPIRE;
        const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
        if (purchaseModel.isExpired()) throw ErrorUtilModule.ERROR_EXPIRE;
        if (purchaseModel.transactionMP === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.reserveSeats === null) throw ErrorUtilModule.ERROR_PROPERTY;

        // ムビチケセッション削除
        delete (<any>req.session).mvtk;

        // 購入者情報入力表示
        res.locals.mvtkInfo = (process.env.NODE_ENV === 'development')
            ? [{ code: '3400999842', password: '7648' }]
            : [{ code: '', password: '' }];
        res.locals.step = PurchaseSession.PurchaseModel.TICKET_STATE;
        res.locals.transactionId = purchaseModel.transactionMP.id;
        res.locals.reserveSeatLength = purchaseModel.reserveSeats.list_tmp_reserve.length;
        res.locals.error = null;
        res.render('purchase/mvtk/input', { layout: 'layouts/purchase/layout' });
        return;
    } catch (err) {
        const error = (err instanceof Error)
            ? new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message)
            : new ErrorUtilModule.CustomError(err, undefined);
        next(error);
        return;
    }
}

/**
 * 券種選択
 * @memberOf Purchase.Mvtk.MvtkInputModule
 * @function select
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
export async function select(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (req.session === undefined) {
        next(new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_PROPERTY, undefined));
        return;
    }
    try {
        if (req.session.purchase === undefined) throw ErrorUtilModule.ERROR_EXPIRE;
        const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
        if (purchaseModel.isExpired()) throw ErrorUtilModule.ERROR_EXPIRE;
        if (purchaseModel.transactionMP === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.reserveSeats === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.performance === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.performanceCOA === null) throw ErrorUtilModule.ERROR_PROPERTY;
        //取引id確認
        if (req.body.transaction_id !== purchaseModel.transactionMP.id) {
            throw ErrorUtilModule.ERROR_ACCESS;
        }
        MvtkInputForm(req);
        const validationResult = await req.getValidationResult();
        if (!validationResult.isEmpty()) throw ErrorUtilModule.ERROR_ACCESS;
        const mvtkService = MVTK.createPurchaseNumberAuthService();
        const inputInfo: InputInfo[] = JSON.parse(req.body.mvtk);
        const purchaseNumberAuthResults = await mvtkService.purchaseNumberAuth({
            kgygishCd: MvtkUtilModule.COMPANY_CODE, //興行会社コード
            jhshbtsCd: MVTK.PurchaseNumberAuthUtilities.INFORMATION_TYPE_CODE_VALID, //情報種別コード
            knyknrNoInfoIn: inputInfo.map((value) => {
                return {
                    KNYKNR_NO: value.code, //購入管理番号
                    PIN_CD: value.password // PINコード
                };
            }),
            skhnCd: MvtkUtilModule.getfilmCode(
                purchaseModel.performanceCOA.titleCode,
                purchaseModel.performanceCOA.titleBranchNum), // 作品コード
            stCd: MvtkUtilModule.getSiteCode(purchaseModel.performance.attributes.theater.id), // サイトコード
            jeiYmd: moment(purchaseModel.performance.attributes.day).format('YYYY/MM/DD') //上映年月日
        });
        log('ムビチケ認証', purchaseNumberAuthResults);
        const validationList: string[] = [];
        // ムビチケセッション作成
        const mvtkList: PurchaseSession.IMvtk[] = [];
        for (const purchaseNumberAuthResult of purchaseNumberAuthResults) {
            for (const info of purchaseNumberAuthResult.ykknInfo) {
                const input = inputInfo.find((value) => {
                    return (value.code === purchaseNumberAuthResult.knyknrNo);
                });
                if (input === undefined) continue;
                // ムビチケチケットコード取得
                const ticket = await COA.MasterService.mvtkTicketcode({
                    theater_code: purchaseModel.performance.attributes.theater.id,
                    kbn_denshiken: purchaseNumberAuthResult.dnshKmTyp,
                    kbn_maeuriken: purchaseNumberAuthResult.znkkkytsknGkjknTyp,
                    kbn_kensyu: info.ykknshTyp,
                    sales_price: Number(info.knshknhmbiUnip),
                    app_price: Number(info.kijUnip),
                    kbn_eisyahousiki: info.eishhshkTyp,
                    title_code: purchaseModel.performanceCOA.titleCode,
                    title_branch_num: purchaseModel.performanceCOA.titleBranchNum
                });
                log('ムビチケチケットコード取得', ticket);
                mvtkList.push({
                    code: purchaseNumberAuthResult.knyknrNo,
                    password: UtilModule.bace64Encode(input.password),
                    ykknInfo: info,
                    ticket: ticket
                });
            }
            if (purchaseNumberAuthResult.knyknrNoMkujyuCd !== undefined) {
                validationList.push(purchaseNumberAuthResult.knyknrNo);
            }
        }
        // 認証エラーバリデーション
        if (validationList.length > 0) {
            res.locals.error = JSON.stringify(validationList);
            log('認証エラー');
            throw ErrorUtilModule.ERROR_VALIDATION;
        }
        req.session.mvtk = mvtkList;
        res.redirect('/purchase/mvtk/confirm');
    } catch (err) {
        if (err === ErrorUtilModule.ERROR_VALIDATION) {
            const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
            if (purchaseModel.reserveSeats === null || purchaseModel.transactionMP === null) {
                next(new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_PROPERTY, undefined));
                return;
            }
            res.locals.mvtkInfo = JSON.parse(req.body.mvtk);
            res.locals.step = PurchaseSession.PurchaseModel.TICKET_STATE;
            res.locals.transactionId = purchaseModel.transactionMP.id;
            res.locals.reserveSeatLength = purchaseModel.reserveSeats.list_tmp_reserve.length;
            res.render('purchase/mvtk/input', { layout: 'layouts/purchase/layout' });
            return;
        }
        const error = (err instanceof Error)
            ? new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message)
            : new ErrorUtilModule.CustomError(err, undefined);
        next(error);
        return;
    }
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
    /**
     * エラー
     */
    error: string | null;
}
