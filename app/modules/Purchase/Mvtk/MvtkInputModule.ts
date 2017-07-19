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
import logger from '../../../middlewares/logger';
import * as PurchaseSession from '../../../models/Purchase/PurchaseModel';
import * as MvtkUtilModule from '../../Purchase/Mvtk/MvtkUtilModule';
import * as ErrorUtilModule from '../../Util/ErrorUtilModule';
import * as UtilModule from '../../Util/UtilModule';
const log = debug('SSKTS:Purchase.Mvtk.MvtkInputModule');

/**
 * ムビチケ券入力ページ表示
 * @memberof Purchase.Mvtk.MvtkInputModule
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
        delete req.session.mvtk;

        // 購入者情報入力表示
        res.locals.mvtkInfo = [{ code: '', password: '' }];
        res.locals.transactionId = purchaseModel.transactionMP.id;
        res.locals.reserveSeatLength = purchaseModel.reserveSeats.listTmpReserve.length;
        res.locals.error = null;
        res.locals.step = PurchaseSession.PurchaseModel.TICKET_STATE;
        res.render('purchase/mvtk/input', { layout: 'layouts/purchase/layout' });
    } catch (err) {
        const error = (err instanceof Error)
            ? new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message)
            : new ErrorUtilModule.CustomError(err, undefined);
        next(error);
    }
}

/**
 * 券種選択
 * @memberof Purchase.Mvtk.MvtkInputModule
 * @function select
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
// tslint:disable-next-line:max-func-body-length
// tslint:disable-next-line:cyclomatic-complexity
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
        if (req.body.transactionId !== purchaseModel.transactionMP.id) {
            throw ErrorUtilModule.ERROR_ACCESS;
        }
        MvtkInputForm(req);
        const validationResult = await req.getValidationResult();
        if (!validationResult.isEmpty()) throw ErrorUtilModule.ERROR_ACCESS;
        const mvtkService = MVTK.createPurchaseNumberAuthService();
        const inputInfo: InputInfo[] = JSON.parse(req.body.mvtk);
        const purchaseNumberAuthIn = {
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
        };
        let purchaseNumberAuthResults;
        try {
            purchaseNumberAuthResults = await mvtkService.purchaseNumberAuth(purchaseNumberAuthIn);
            log('ムビチケ認証', purchaseNumberAuthResults);
        } catch (err) {
            logger.error('SSKTS-APP:MvtkInputModule.select purchaseNumberAuthIn', purchaseNumberAuthIn);
            logger.error('SSKTS-APP:MvtkInputModule.select purchaseNumberError', err);
            throw err;
        }
        if (purchaseNumberAuthResults === undefined) throw ErrorUtilModule.ERROR_PROPERTY;
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
                const ticket = await COA.services.master.mvtkTicketcode({
                    theaterCode: purchaseModel.performance.attributes.theater.id,
                    kbnDenshiken: purchaseNumberAuthResult.dnshKmTyp,
                    kbnMaeuriken: purchaseNumberAuthResult.znkkkytsknGkjknTyp,
                    kbnKensyu: info.ykknshTyp,
                    salesPrice: Number(info.knshknhmbiUnip),
                    appPrice: Number(info.kijUnip),
                    kbnEisyahousiki: info.eishhshkTyp,
                    titleCode: purchaseModel.performanceCOA.titleCode,
                    titleBranchNum: purchaseModel.performanceCOA.titleBranchNum
                });
                log('ムビチケチケットコード取得', ticket);
                const validTicket = {
                    ykknshTyp: info.ykknshTyp, // 有効券種区分
                    eishhshkTyp: info.eishhshkTyp, // 映写方式区分
                    ykknKnshbtsmiNum: info.ykknKnshbtsmiNum, // 有効期限券種別枚数
                    knshknhmbiUnip: info.knshknhmbiUnip, // 鑑賞券販売単価
                    kijUnip: info.kijUnip, // 計上単価
                    dnshKmTyp: purchaseNumberAuthResult.dnshKmTyp, // 電子券区分
                    znkkkytsknGkjknTyp: purchaseNumberAuthResult.znkkkytsknGkjknTyp // 全国共通券・劇場券区分
                };
                mvtkList.push({
                    code: purchaseNumberAuthResult.knyknrNo,
                    password: UtilModule.bace64Encode(input.password),
                    ykknInfo: validTicket,
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
            logger.error('SSKTS-APP:MvtkInputModule.select purchaseNumberAuthIn', purchaseNumberAuthIn);
            logger.error('SSKTS-APP:MvtkInputModule.select purchaseNumberAuthOut', purchaseNumberAuthResults);
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
            res.locals.transactionId = purchaseModel.transactionMP.id;
            res.locals.reserveSeatLength = purchaseModel.reserveSeats.listTmpReserve.length;
            res.locals.step = PurchaseSession.PurchaseModel.TICKET_STATE;
            res.render('purchase/mvtk/input', { layout: 'layouts/purchase/layout' });

            return;
        }
        const error = (err instanceof Error)
            ? new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message)
            : new ErrorUtilModule.CustomError(err, undefined);
        next(error);
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
