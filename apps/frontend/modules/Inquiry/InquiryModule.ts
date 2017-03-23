/**
 * 照会
 * @namespace InquiryModule
 */

import * as COA from '@motionpicture/coa-service';
import * as debug from 'debug';
import * as express from 'express';
import * as MP from '../../../../libs/MP';
import LoginForm from '../../forms/Inquiry/LoginForm';
import * as InquirySession from '../../models/Inquiry/InquiryModel';
import * as UtilModule from '../Util/UtilModule';
const debugLog = debug('SSKTS ');

/**
 * 照会認証ページ表示
 * @memberOf InquiryModule
 * @function login
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {void}
 */
// tslint:disable-next-line:variable-name
export function login(req: express.Request, res: express.Response): void {
    res.locals.theater_code = (req.query && req.query.theater) ? req.query.theater : '';
    res.locals.reserve_num = '';
    res.locals.tel_num = '';
    if (process.env.NODE_ENV === 'development') {
        res.locals.theater_code = '118';
        res.locals.reserve_num = '59';
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
    if (!req.session) return next(new Error(req.__('common.error.property')));
    const inquiryModel = new InquirySession.InquiryModel(req.session.inquiry);
    LoginForm(req);
    req.getValidationResult().then((result) => {
        if (result.isEmpty()) {
            MP.makeInquiry({
                inquiry_theater: req.body.theater_code, // 施設コード
                inquiry_id: Number(req.body.reserve_num), // 座席チケット購入番号
                inquiry_pass: req.body.tel_num // 電話番号
            }).then((transactionId) => {
                inquiryModel.transactionId = transactionId;
                debugLog('MP取引Id取得', inquiryModel.transactionId);
                getStateReserve(req, inquiryModel).then(() => {
                    //購入者内容確認へ
                    return res.redirect(`/inquiry/${inquiryModel.transactionId}/`);
                }).catch((err) => {
                    return next(new Error(err.message));
                });
            }).catch(() => {
                res.locals.theater_code = req.body.theater_code;
                res.locals.reserve_num = req.body.reserve_num;
                res.locals.tel_num = req.body.tel_num;
                res.locals.error = getInquiryError(req);
                return res.render('inquiry/login');
            });
        } else {
            res.locals.theater_code = req.body.theater_code;
            res.locals.reserve_num = req.body.reserve_num;
            res.locals.tel_num = req.body.tel_num;
            res.locals.error = result.mapped();
            return res.render('inquiry/login');
        }
    }).catch(() => {
        return next(new Error(req.__('common.error.property')));
    });
}

/**
 * 照会エラー取得
 * @memberOf InquiryModule
 * @function getGMOError
 * @param {express.Request} req
 * @returns {any}
 */
function getInquiryError(req: Express.Request) {
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
 * 照会情報取得
 * @memberOf InquiryModule
 * @function getStateReserve
 * @param {express.Request} req
 * @param {InquirySession.InquiryModel} inquiryModel
 * @returns {Promise<void>}
 */
async function getStateReserve(req: express.Request, inquiryModel: InquirySession.InquiryModel): Promise<void> {
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

    if (!req.session) throw req.__('common.error.property');
    (<any>req.session).inquiry = inquiryModel.toSession();
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
    if (!req.session) return next(new Error(req.__('common.error.property')));
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
        return res.redirect('/inquiry/login?transaction_id=' + (<string>req.params.transactionId));
    }
}
