/**
 * ムビチケ入力
 * @namespace Purchase.Mvtk.MvtkInputModule
 */

import * as COA from '@motionpicture/coa-service';
import * as mvtkReserve from '@motionpicture/mvtk-reserve-service';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as HTTPStatus from 'http-status';
import * as moment from 'moment';
import { bace64Encode, Digits } from '../../../functions';
import { purchaseMvtkInputForm } from '../../../functions/forms';
import logger from '../../../middlewares/logger';
import { AppError, ErrorType, IMvtk, PurchaseModel } from '../../../models';
import { COMPANY_CODE } from './mvtk-util.controller';
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
            || purchaseModel.screeningEvent === null
            || purchaseModel.screeningEvent.coaInfo === undefined) {
            throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        }
        //取引id確認
        if (req.body.transactionId !== purchaseModel.transaction.id) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        purchaseMvtkInputForm(req);
        const validationResult = await req.getValidationResult();
        if (!validationResult.isEmpty()) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Access);
        const inputInfoList: IInputInfo[] = JSON.parse(req.body.mvtk);
        mvtkValidation(inputInfoList);
        log('ムビチケ券検証');
        const purchaseNumberAuthIn: mvtkReserve.services.auth.purchaseNumberAuth.IPurchaseNumberAuthIn = {
            kgygishCd: COMPANY_CODE, //興行会社コード
            jhshbtsCd: mvtkReserve.services.auth.purchaseNumberAuth.InformationTypeCode.Valid, //情報種別コード
            knyknrNoInfoIn: inputInfoList.map((value) => {
                return {
                    knyknrNo: value.code, //購入管理番号
                    pinCd: value.password // PINコード
                };
            }),
            skhnCd: purchaseModel.getMvtkfilmCode(), // 作品コード
            stCd: Number(purchaseModel.screeningEvent.coaInfo.theaterCode.slice(Digits['02'])).toString(), // サイトコード
            jeiYmd: moment(purchaseModel.screeningEvent.coaInfo.dateJouei).format('YYYY/MM/DD') //上映年月日
        };
        let purchaseNumberAuthResult: mvtkReserve.services.auth.purchaseNumberAuth.IPurchaseNumberAuthResult;
        try {
            purchaseNumberAuthResult = await mvtkReserve.services.auth.purchaseNumberAuth.purchaseNumberAuth(purchaseNumberAuthIn);
            if (purchaseNumberAuthResult.knyknrNoInfoOut === null) {
                throw new Error('purchaseNumberAuthResult.knyknrNoInfoOut === null');
            }
            log('ムビチケ認証', purchaseNumberAuthResult);
        } catch (err) {
            logger.error('SSKTS-APP:MvtkInputModule.auth', purchaseNumberAuthIn, err);
            throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.ExternalModule, err.message);
        }
        const validationList: string[] = [];

        // ムビチケセッション作成
        const mvtkList: IMvtk[] = [];
        for (const purchaseNumberInfo of purchaseNumberAuthResult.knyknrNoInfoOut) {
            if (purchaseNumberInfo.ykknInfo === null) continue;
            for (const info of purchaseNumberInfo.ykknInfo) {
                const input = inputInfoList.find((value) => {
                    return (value.code === purchaseNumberInfo.knyknrNo);
                });
                if (input === undefined) continue;
                // ムビチケチケットコード取得
                const ticket = await COA.services.master.mvtkTicketcode({
                    theaterCode: purchaseModel.screeningEvent.coaInfo.theaterCode,
                    kbnDenshiken: purchaseNumberInfo.dnshKmTyp,
                    kbnMaeuriken: purchaseNumberInfo.znkkkytsknGkjknTyp,
                    kbnKensyu: info.ykknshTyp,
                    salesPrice: Number(info.knshknhmbiUnip),
                    appPrice: Number(info.kijUnip),
                    kbnEisyahousiki: info.eishhshkTyp,
                    titleCode: purchaseModel.screeningEvent.coaInfo.titleCode,
                    titleBranchNum: purchaseModel.screeningEvent.coaInfo.titleBranchNum,
                    dateJouei: purchaseModel.screeningEvent.coaInfo.dateJouei
                });
                log('ムビチケチケットコード取得', ticket);
                const validTicket = {
                    ykknshTyp: info.ykknshTyp, // 有効券種区分
                    eishhshkTyp: info.eishhshkTyp, // 映写方式区分
                    ykknKnshbtsmiNum: info.ykknKnshbtsmiNum, // 有効期限券種別枚数
                    knshknhmbiUnip: info.knshknhmbiUnip, // 鑑賞券販売単価
                    kijUnip: info.kijUnip, // 計上単価
                    dnshKmTyp: purchaseNumberInfo.dnshKmTyp, // 電子券区分
                    znkkkytsknGkjknTyp: purchaseNumberInfo.znkkkytsknGkjknTyp // 全国共通券・劇場券区分
                };
                mvtkList.push({
                    code: purchaseNumberInfo.knyknrNo,
                    password: bace64Encode(input.password),
                    ykknInfo: validTicket,
                    ticket: ticket
                });
            }
            if (purchaseNumberInfo.knyknrNoMkujyuCd !== undefined) {
                validationList.push(purchaseNumberInfo.knyknrNo);
            }
        }
        // 認証エラーバリデーション
        if (validationList.length > 0) {
            logger.error('SSKTS-APP:MvtkInputModule.auth', purchaseNumberAuthResult);
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
function mvtkValidation(inputInfoList: IInputInfo[]): void {
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
interface IInputInfo {
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
