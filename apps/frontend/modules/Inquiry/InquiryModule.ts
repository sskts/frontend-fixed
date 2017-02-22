/**
 * 照会
 * @namespace InquiryModule
 */

import * as COA from '@motionpicture/coa-service';
import * as express from 'express';
import * as MP from '../../../../libs/MP';
import LoginForm from '../../forms/Inquiry/LoginForm';
import * as InquirySession from '../../models/Inquiry/InquiryModel';
import UtilModule from '../Util/UtilModule';

/**
 * 照会認証ページ表示
 * @memberOf InquiryModule
 * @function login
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {void}
 */
// tslint:disable-next-line:variable-name
export function login(_req: express.Request, res: express.Response): void {
    res.locals.theater_code = '';
    res.locals.reserve_num = '';
    res.locals.tel_num = '';
    if (process.env.NODE_ENV === 'dev') {
        res.locals.theater_code = '118';
        res.locals.reserve_num = '18';
        res.locals.tel_num = '09040007648';
    }
    res.locals.error = null;
    return res.render('inquiry/login');
}

/**
 * 照会認証
 * @memberOf InquiryModule
 * @function auth
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
export function auth(req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (!req.session) return next(req.__('common.error.property'));
    const inquiryModel = new InquirySession.InquiryModel((<any>req.session).inquiry);
    const form = LoginForm(req);
    form(req, res, () => {
        if (!(<any>req).form) return next(req.__('common.error.property'));
        if ((<any>req).form.isValid) {
            getStateReserve(req, inquiryModel).then(
                () => {
                    //購入者内容確認へ
                    return res.redirect(`/inquiry/${inquiryModel.transactionId}/`);
                },
                (err) => {
                    return next(new Error(err.message));
                }
            );
        } else {
            res.locals.error = (<any>req).form.getErrors();
            return res.render('inquiry/login');
        }
    });
}

/**
 * 照会情報取得
 * @memberOf InquiryModule
 * @function getStateReserve
 * @param {express.Request} req
 * @param {InquirySession.InquiryModel} inquiryModel
 * @returns {Promise<void>}
 */
async function getStateReserve(req: express.Request, inquiryModel: InquirySession.InquiryModel): Promise<void> {
    inquiryModel.transactionId = await MP.makeInquiry({
        /**
         * 施設コード
         */
        inquiry_theater: req.body.theater_code,
        /**
         * 座席チケット購入番号
         */
        inquiry_id: req.body.reserve_num,
        /**
         * 電話番号
         */
        inquiry_pass: req.body.tel_num
    });
    console.log('MP取引Id取得', inquiryModel.transactionId);

    inquiryModel.login = req.body;

    inquiryModel.stateReserve = await COA.stateReserveInterface.call({
        /**
         * 施設コード
         */
        theater_code: req.body.theater_code,
        /**
         * 座席チケット購入番号
         */
        reserve_num: req.body.reserve_num,
        /**
         * 電話番号
         */
        tel_num: req.body.tel_num
    });
    console.log('COA照会情報取得');

    const performanceId = UtilModule.getPerformanceId({
        theaterCode: req.body.theater_code,
        day: inquiryModel.stateReserve.date_jouei,
        titleCode: inquiryModel.stateReserve.title_code,
        titleBranchNum: inquiryModel.stateReserve.title_branch_num,
        screenCode: inquiryModel.stateReserve.screen_code,
        timeBegin: inquiryModel.stateReserve.time_begin
    });
    console.log('パフォーマンスID取得', performanceId);
    inquiryModel.performance = await MP.getPerformance({
        id: performanceId
    });
    console.log('MPパフォーマンス取得');

    if (!req.session) throw req.__('common.error.property');
    (<any>req.session).inquiry = inquiryModel.formatToSession();
}

/**
 * 照会確認ページ表示
 * @memberOf InquiryModule
 * @function index
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
export function index(req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (!req.session) return next(req.__('common.error.property'));
    const inquiryModel = new InquirySession.InquiryModel((<any>req.session).inquiry);
    if (inquiryModel.stateReserve
        && inquiryModel.performance
        && inquiryModel.login
        && inquiryModel.transactionId) {
        res.locals.stateReserve = inquiryModel.stateReserve;
        res.locals.performance = inquiryModel.performance;
        res.locals.login = inquiryModel.login;
        res.locals.transactionId = inquiryModel.transactionId;

        return res.render('inquiry/index');
    } else {
        //照会認証ページへ
        return res.redirect('/inquiry/login?transaction_id=' + req.params.transactionId);
    }
}
