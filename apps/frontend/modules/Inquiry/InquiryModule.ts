/**
 * 照会
 * @namespace InquiryModule
 */

import * as COA from '@motionpicture/coa-service';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as MP from '../../../../libs/MP';
import LoginForm from '../../forms/Inquiry/LoginForm';
import * as InquirySession from '../../models/Inquiry/InquiryModel';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';
import * as UtilModule from '../Util/UtilModule';
const debugLog = debug('SSKTS ');

/**
 * 照会認証ページ表示
 * @memberOf InquiryModule
 * @function login
 * @param {Request} req
 * @param {Response} res
 * @returns {void}
 */
// tslint:disable-next-line:variable-name
export function login(req: Request, res: Response): void {
    res.locals.theater_code = ((<object>req.query).hasOwnProperty('theater')) ? req.query.theater : '';
    res.locals.reserve_num = ((<object>req.query).hasOwnProperty('reserve')) ? req.query.reserve : '';
    res.locals.tel_num = '';
    res.locals.error = null;
    res.render('inquiry/login');
    return;
}

/**
 * 照会認証
 * @memberOf InquiryModule
 * @function auth
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
export async function auth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (req.session === undefined) throw ErrorUtilModule.ERROR_PROPERTY;
        const inquiryModel = new InquirySession.InquiryModel(req.session.inquiry);
        LoginForm(req);
        try {
            const validationResult = await req.getValidationResult();
            if (validationResult.isEmpty()) {
                try {
                    inquiryModel.transactionId = await MP.makeInquiry({
                        inquiry_theater: req.body.theater_code, // 施設コード
                        inquiry_id: Number(req.body.reserve_num), // 座席チケット購入番号
                        inquiry_pass: req.body.tel_num // 電話番号
                    });
                } catch (err) {
                    throw ErrorUtilModule.ERROR_VALIDATION;
                }
                debugLog('MP取引Id取得', inquiryModel.transactionId);

                inquiryModel.login = req.body;
                inquiryModel.stateReserve = await COA.ReserveService.stateReserve({
                    theater_code: req.body.theater_code, // 施設コード
                    reserve_num: req.body.reserve_num, // 座席チケット購入番号
                    tel_num: req.body.tel_num // 電話番号
                });
                debugLog('COA照会情報取得');

                const performanceId = UtilModule.getPerformanceId({
                    theaterCode: req.body.theater_code,
                    day: inquiryModel.stateReserve.date_jouei,
                    titleCode: inquiryModel.stateReserve.title_code,
                    titleBranchNum: inquiryModel.stateReserve.title_branch_num,
                    screenCode: inquiryModel.stateReserve.screen_code,
                    timeBegin: inquiryModel.stateReserve.time_begin
                });
                debugLog('パフォーマンスID取得', performanceId);

                inquiryModel.performance = await MP.getPerformance(performanceId);
                debugLog('MPパフォーマンス取得');

                req.session.inquiry = inquiryModel.toSession();

                //購入者内容確認へ
                res.redirect(`/inquiry/${inquiryModel.transactionId}/`);
                return;
            } else {
                res.locals.theater_code = req.body.theater_code;
                res.locals.reserve_num = req.body.reserve_num;
                res.locals.tel_num = req.body.tel_num;
                res.locals.error = validationResult.mapped();
                res.render('inquiry/login');
                return;
            }
        } catch (err) {
            throw err;
        }
    } catch (err) {
        if (err === ErrorUtilModule.ERROR_VALIDATION) {
            res.locals.theater_code = req.body.theater_code;
            res.locals.reserve_num = req.body.reserve_num;
            res.locals.tel_num = req.body.tel_num;
            res.locals.error = getInquiryError(req);
            res.render('inquiry/login');
            return;
        }
        next(ErrorUtilModule.getError(req, err));
        return;
    }
}

/**
 * 照会エラー取得
 * @memberOf InquiryModule
 * @function getGMOError
 * @param {Request} req
 * @returns {any}
 */
function getInquiryError(req: Request) {
    return {
        theater_code: {
            parm: 'theater_code', msg: `${req.__('common.theater_code')}${req.__('common.validation.inquiry')}`, value: ''
        },
        reserve_num: {
            parm: 'reserve_num', msg: `${req.__('common.purchase_number')}${req.__('common.validation.inquiry')}`, value: ''
        },
        tel_num: {
            parm: 'tel_num', msg: `${req.__('common.tel_num')}${req.__('common.validation.inquiry')}`, value: ''
        }
    };
}

/**
 * 照会確認ページ表示
 * @memberOf InquiryModule
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
export function index(req: Request, res: Response, next: NextFunction): void {
    if (req.session === undefined) {
        next(ErrorUtilModule.getError(req, ErrorUtilModule.ERROR_PROPERTY));
        return;
    }
    const inquiryModel = new InquirySession.InquiryModel((<any>req.session).inquiry);
    if (inquiryModel.stateReserve !== null
        && inquiryModel.performance !== null
        && inquiryModel.login !== null
        && inquiryModel.transactionId !== null) {
        res.locals.stateReserve = inquiryModel.stateReserve;
        res.locals.performance = inquiryModel.performance;
        res.locals.login = inquiryModel.login;
        res.locals.transactionId = inquiryModel.transactionId;

        res.render('inquiry/index');
        return;
    } else {
        //照会認証ページへ
        res.redirect('/inquiry/login?transaction_id=' + (<string>req.params.transactionId));
        return;
    }
}
