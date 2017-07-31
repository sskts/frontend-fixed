/**
 * 照会
 * @namespace InquiryModule
 */

import * as COA from '@motionpicture/coa-service';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as MP from '../../../libs/MP/sskts-api';
import LoginForm from '../../forms/Inquiry/LoginForm';
import * as InquirySession from '../../models/Inquiry/InquiryModel';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';
import * as UtilModule from '../Util/UtilModule';
const log = debug('SSKTS:InquiryModule');

/**
 * 照会認証ページ表示
 * @memberof InquiryModule
 * @function login
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (req.query.theater === undefined) {
        const status = 404;
        res.status(status).render('error/notFound');

        return;
    }
    try {
        res.locals.portalTheaterSite = await getPortalTheaterSite(req);
        res.locals.theaterCode = (req.query.theater !== undefined) ? req.query.theater : '';
        res.locals.reserveNum = (req.query.reserve !== undefined) ? req.query.reserve : '';
        res.locals.telephone = '';
        res.locals.error = null;
        res.render('inquiry/login');

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
 * 劇場URL取得
 * @memberof InquiryModule
 * @function getPortalTheaterSite
 * @param {Request} req
 * @returns {Promise<string>}
 */
async function getPortalTheaterSite(req: Request): Promise<string> {
    const theater = await MP.services.theater.getTheater({
        auth: await UtilModule.createAuth(req),
        theaterId: req.query.theater
    });
    const website = theater.attributes.websites.find((value) => value.group === 'PORTAL');
    if (website === undefined) throw ErrorUtilModule.ERROR_PROPERTY;

    return website.url;
}

/**
 * 照会認証
 * @memberof InquiryModule
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
        const validationResult = await req.getValidationResult();
        if (validationResult.isEmpty()) {
            const makeInquiryResult = await MP.services.transaction.makeInquiry({
                auth: await UtilModule.createAuth(req),
                inquiryTheater: req.body.theaterCode, // 施設コード
                inquiryId: Number(req.body.reserveNum), // 座席チケット購入番号
                inquiryPass: req.body.telephone // 電話番号
            });
            log('照会情報', makeInquiryResult);
            // inquiryModel.transactionId = await MP.services.transaction.findByInquiryKey({
            //     theaterCode: req.body.theaterCode, // 施設コード
            //     reserveNum: Number(req.body.reserveNum), // 座席チケット購入番号
            //     tel: req.body.telephone // 電話番号
            // });
            if (makeInquiryResult === null) {
                res.locals.portalTheaterSite = await getPortalTheaterSite(req);
                res.locals.theaterCode = req.body.theaterCode;
                res.locals.reserveNum = req.body.reserveNum;
                res.locals.telephone = req.body.telephone;
                res.locals.error = getInquiryError(req);
                res.render('inquiry/login');

                return;
            }
            inquiryModel.transactionId = makeInquiryResult.id;
            log('MP取引Id取得', inquiryModel.transactionId);
            inquiryModel.login = req.body;
            inquiryModel.stateReserve = await COA.services.reserve.stateReserve({
                theaterCode: req.body.theaterCode, // 施設コード
                reserveNum: req.body.reserveNum, // 座席チケット購入番号
                telephone: req.body.telephone // 電話番号
            });
            log('COA照会情報取得', inquiryModel.stateReserve);
            if (inquiryModel.stateReserve === null) throw ErrorUtilModule.ERROR_PROPERTY;
            const performanceId = UtilModule.getPerformanceId({
                theaterCode: req.body.theaterCode,
                day: inquiryModel.stateReserve.dateJouei,
                titleCode: inquiryModel.stateReserve.titleCode,
                titleBranchNum: inquiryModel.stateReserve.titleBranchNum,
                screenCode: inquiryModel.stateReserve.screenCode,
                timeBegin: inquiryModel.stateReserve.timeBegin
            });
            log('パフォーマンスID取得', performanceId);
            inquiryModel.performance = await MP.services.performance.getPerformance({
                auth: await UtilModule.createAuth(req),
                performanceId: performanceId
            });
            log('MPパフォーマンス取得');
            req.session.inquiry = inquiryModel.toSession();
            //購入者内容確認へ
            res.redirect(`/inquiry/${inquiryModel.transactionId}/?theater=${req.body.theaterCode}`);

            return;
        } else {
            res.locals.portalTheaterSite = await getPortalTheaterSite(req);
            res.locals.theaterCode = req.body.theaterCode;
            res.locals.reserveNum = req.body.reserveNum;
            res.locals.telephone = req.body.telephone;
            res.locals.error = validationResult.mapped();
            res.render('inquiry/login');

            return;
        }
    } catch (err) {
        const error = (err instanceof Error)
            ? new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message)
            : new ErrorUtilModule.CustomError(err, undefined);
        next(error);

        return;
    }
}

/**
 * 照会エラー取得
 * @memberof InquiryModule
 * @function getGMOError
 * @param {Request} req
 * @returns {any}
 */
function getInquiryError(req: Request) {
    return {
        reserveNum: {
            parm: 'reserveNum', msg: `${req.__('common.purchase_number')}${req.__('common.validation.inquiry')}`, value: ''
        },
        telephone: {
            parm: 'telephone', msg: `${req.__('common.tel_num')}${req.__('common.validation.inquiry')}`, value: ''
        }
    };
}

/**
 * 照会確認ページ表示
 * @memberof InquiryModule
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
export function index(req: Request, res: Response, next: NextFunction): void {
    if (req.session === undefined) {
        next(new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_PROPERTY, undefined));

        return;
    }
    if (req.query.theater === undefined) {
        next(new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_PROPERTY, undefined));

        return;
    }
    const inquiryModel = new InquirySession.InquiryModel(req.session.inquiry);
    if (inquiryModel.stateReserve !== null
        && inquiryModel.performance !== null
        && inquiryModel.login !== null
        && inquiryModel.transactionId !== null) {
        res.locals.theaterCode = inquiryModel.performance.attributes.theater.id;
        res.locals.stateReserve = inquiryModel.stateReserve;
        res.locals.performance = inquiryModel.performance;
        res.locals.login = inquiryModel.login;
        res.locals.transactionId = inquiryModel.transactionId;
        delete req.session.inquiry;
        res.render('inquiry/index');

        return;
    } else {
        //照会認証ページへ
        res.redirect(`/inquiry/login?theater=${req.query.theater}&transactionId=${req.params.transactionId}`);

        return;
    }
}
