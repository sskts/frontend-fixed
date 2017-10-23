/**
 * ムビチケ入力
 * @namespace Purchase.Mvtk.MvtkInputModule
 */

import * as COA from '@motionpicture/coa-service';
import * as MVTK from '@motionpicture/mvtk-service';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as HTTPStatus from 'http-status';
import * as moment from 'moment';
import MvtkInputForm from '../../../forms/Purchase/Mvtk/MvtkInputForm';
import logger from '../../../middlewares/logger';
import { IMvtk, PurchaseModel } from '../../../models/Purchase/PurchaseModel';
import * as MvtkUtilModule from '../../Purchase/Mvtk/MvtkUtilModule';
import { AppError, ErrorType } from '../../Util/ErrorUtilModule';
import * as UtilModule from '../../Util/UtilModule';
const log = debug('SSKTS:Purchase.Mvtk.MvtkInputModule');

/**
 * ムビチケ券入力ページ表示
 * @memberof Purchase.Mvtk.MvtkInputModule
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
        if (purchaseModel.transaction === null) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        // ムビチケセッション削除
        delete req.session.mvtk;

        // 購入者情報入力表示
        res.locals.mvtkInfo = [{ code: '', password: '' }];
        res.locals.error = null;
        res.locals.purchaseModel = purchaseModel;
        res.locals.step = PurchaseModel.TICKET_STATE;
        res.render('purchase/mvtk/input', { layout: 'layouts/purchase/layout' });
    } catch (err) {
        next(err);
    }
}

/**
 * ムビチケ認証
 * @memberof Purchase.Mvtk.MvtkInputModule
 * @function auth
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
// tslint:disable-next-line:max-func-body-length cyclomatic-complexity
export async function auth(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (req.session === undefined) {
        next(new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property));

        return;
    }
    try {
        const purchaseModel = new PurchaseModel(req.session.purchase);
        if (purchaseModel.isExpired()) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Expire);
        if (purchaseModel.transaction === null
            || purchaseModel.individualScreeningEvent === null) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        //取引id確認
        if (req.body.transactionId !== purchaseModel.transaction.id) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        MvtkInputForm(req);
        const validationResult = await req.getValidationResult();
        if (!validationResult.isEmpty()) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Access);
        const mvtkService = MVTK.createPurchaseNumberAuthService();
        const inputInfoList: InputInfo[] = JSON.parse(req.body.mvtk);
        mvtkValidation(inputInfoList);
        log('ムビチケ券検証');
        const purchaseNumberAuthIn = {
            kgygishCd: MvtkUtilModule.COMPANY_CODE, //興行会社コード
            jhshbtsCd: MVTK.PurchaseNumberAuthUtilities.INFORMATION_TYPE_CODE_VALID, //情報種別コード
            knyknrNoInfoIn: inputInfoList.map((value) => {
                return {
                    KNYKNR_NO: value.code, //購入管理番号
                    PIN_CD: value.password // PINコード
                };
            }),
            skhnCd: purchaseModel.getMvtkfilmCode(), // 作品コード
            stCd: `00${purchaseModel.individualScreeningEvent.coaInfo.theaterCode}`.slice(UtilModule.DIGITS['02']), // サイトコード
            jeiYmd: moment(purchaseModel.individualScreeningEvent.coaInfo.dateJouei).format('YYYY/MM/DD') //上映年月日
        };
        let purchaseNumberAuthResults;
        try {
            purchaseNumberAuthResults = await mvtkService.purchaseNumberAuth(purchaseNumberAuthIn);
            log('ムビチケ認証', purchaseNumberAuthResults);
        } catch (err) {
            logger.error(
                'SSKTS-APP:MvtkInputModule.select',
                `in: ${purchaseNumberAuthIn}`,
                `err: ${err}`
            );
            throw err;
        }
        const validationList: string[] = [];
        // ムビチケセッション作成
        const mvtkList: IMvtk[] = [];
        for (const purchaseNumberAuthResult of purchaseNumberAuthResults) {
            for (const info of purchaseNumberAuthResult.ykknInfo) {
                const input = inputInfoList.find((value) => {
                    return (value.code === purchaseNumberAuthResult.knyknrNo);
                });
                if (input === undefined) continue;
                // ムビチケチケットコード取得
                const ticket = await COA.services.master.mvtkTicketcode({
                    theaterCode: purchaseModel.individualScreeningEvent.coaInfo.theaterCode,
                    kbnDenshiken: purchaseNumberAuthResult.dnshKmTyp,
                    kbnMaeuriken: purchaseNumberAuthResult.znkkkytsknGkjknTyp,
                    kbnKensyu: info.ykknshTyp,
                    salesPrice: Number(info.knshknhmbiUnip),
                    appPrice: Number(info.kijUnip),
                    kbnEisyahousiki: info.eishhshkTyp,
                    titleCode: purchaseModel.individualScreeningEvent.coaInfo.titleCode,
                    titleBranchNum: purchaseModel.individualScreeningEvent.coaInfo.titleBranchNum
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
            log('認証エラー');
            logger.error('SSKTS-APP:MvtkInputModule.select purchaseNumberAuthIn', purchaseNumberAuthIn);
            logger.error('SSKTS-APP:MvtkInputModule.select purchaseNumberAuthOut', purchaseNumberAuthResults);
            throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Validation, JSON.stringify(validationList));
        }
        req.session.mvtk = mvtkList;
        res.redirect('/purchase/mvtk/confirm');
    } catch (err) {
        if (err.errorType === ErrorType.Validation) {
            const purchaseModel = new PurchaseModel(req.session.purchase);
            res.locals.mvtkInfo = JSON.parse(req.body.mvtk);
            res.locals.purchaseModel = purchaseModel;
            res.locals.step = PurchaseModel.TICKET_STATE;
            res.locals.error = err.errors[0].message;
            res.render('purchase/mvtk/input', { layout: 'layouts/purchase/layout' });

            return;
        }
        next(err);
    }
}

/**
 * ムビチケ券検証
 * @function mvtkValidation
 * @param {InputInfo[]} inputInfoList
 */
function mvtkValidation(inputInfoList: InputInfo[]): void {
    const codeList = inputInfoList.map((inputInfo) => {
        return inputInfo.code;
    });
    const validationList = codeList.filter((code, index) => {
        return codeList.indexOf(code) === index && index !== codeList.lastIndexOf(code);
    });
    if (validationList.length > 0) {
        throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Validation, JSON.stringify(validationList));
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
