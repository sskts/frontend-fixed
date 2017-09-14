/**
 * 照会
 * @namespace InquiryModule
 */
import * as sasaki from '@motionpicture/sasaki-api-nodejs';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import LoginForm from '../../forms/Inquiry/LoginForm';
import { AuthModel } from '../../models/Auth/AuthModel';
import { InquiryModel } from '../../models/Inquiry/InquiryModel';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';
const log = debug('SSKTS:InquiryModule');

/**
 * 照会認証ページ表示
 * @memberof InquiryModule
 * @function loginRender
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
export async function loginRender(req: Request, res: Response, next: NextFunction): Promise<void> {
    const theaterCode = (req.query.orderNumber !== undefined) ? req.query.orderNumber.split('-')[0] : req.query.theater;
    if (theaterCode === undefined) {
        const status = 404;
        res.status(status).render('error/notFound');

        return;
    }
    try {
        if (req.session === undefined) throw ErrorUtilModule.ErrorType.Property;
        const authModel = new AuthModel(req.session.auth);
        const options = {
            endpoint: (<string>process.env.SSKTS_API_ENDPOINT),
            auth: authModel.create()
        };
        const inquiryModel = new InquiryModel();
        // 劇場のショップを検索
        inquiryModel.movieTheaterOrganization = await sasaki.service.organization(options).findMovieTheaterByBranchCode({
            branchCode: theaterCode
        });
        log('劇場のショップを検索', inquiryModel.movieTheaterOrganization);
        inquiryModel.login = {
            reserveNum: (req.query.reserve !== undefined) ? req.query.reserve : '',
            telephone: ''
        };
        res.locals.inquiryModel = inquiryModel;
        res.locals.error = null;
        res.render('inquiry/login');

        return;
    } catch (err) {
        const error = (err instanceof Error) ? err : new ErrorUtilModule.AppError(err, undefined);
        next(error);

        return;
    }
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
export async function inquiryAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (req.session === undefined) throw ErrorUtilModule.ErrorType.Property;
        const authModel = new AuthModel(req.session.auth);
        const options = {
            endpoint: (<string>process.env.SSKTS_API_ENDPOINT),
            auth: authModel.create()
        };
        LoginForm(req);
        const validationResult = await req.getValidationResult();
        if (validationResult.isEmpty()) {
            const inquiryModel = new InquiryModel();
            inquiryModel.movieTheaterOrganization = await sasaki.service.organization(options).findMovieTheaterByBranchCode({
                branchCode: req.body.theaterCode
            });
            log('劇場のショップを検索', inquiryModel.movieTheaterOrganization);
            if (inquiryModel.movieTheaterOrganization === null) throw ErrorUtilModule.ErrorType.Property;
            inquiryModel.login = {
                reserveNum: req.body.reserveNum,
                telephone: req.body.telephone
            };
            inquiryModel.order = await sasaki.service.order(options).findByOrderInquiryKey({
                telephone: inquiryModel.login.telephone,
                confirmationNumber: Number(inquiryModel.login.reserveNum),
                theaterCode: inquiryModel.movieTheaterOrganization.location.branchCode
            });
            log('照会情報', inquiryModel.order);
            if (inquiryModel.order === null) {
                res.locals.inquiryModel = inquiryModel;
                res.locals.error = getInquiryError(req);
                res.render('inquiry/login');

                return;
            }
            inquiryModel.save(req.session);
            //購入者内容確認へ
            res.redirect(
                `/inquiry/${inquiryModel.order.orderNumber}/?theater=${inquiryModel.movieTheaterOrganization.location.branchCode}`
            );

            return;
        } else {
            const inquiryModel = new InquiryModel();
            inquiryModel.movieTheaterOrganization = await sasaki.service.organization(options).findMovieTheaterByBranchCode({
                branchCode: req.body.theaterCode
            });
            log('劇場のショップを検索', inquiryModel.movieTheaterOrganization);
            if (inquiryModel.movieTheaterOrganization === null) throw ErrorUtilModule.ErrorType.Property;
            inquiryModel.login = {
                reserveNum: req.body.reserveNum,
                telephone: req.body.telephone
            };
            res.locals.inquiryModel = inquiryModel;
            res.locals.error = validationResult.mapped();
            res.render('inquiry/login');

            return;
        }
    } catch (err) {
        const error = (err instanceof Error) ? err : new ErrorUtilModule.AppError(err, undefined);
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
 * @function confirmRender
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
export function confirmRender(req: Request, res: Response, next: NextFunction): void {
    try {
        if (req.session === undefined) throw ErrorUtilModule.ErrorType.Property;
        if (req.query.theater === undefined) throw ErrorUtilModule.ErrorType.Property;
        if (req.session.inquiry === undefined) {
            res.redirect(`/inquiry/login?orderNumber=${req.params.orderNumber}`);

            return;
        }

        const inquiryModel = new InquiryModel(req.session.inquiry);
        res.locals.inquiryModel = inquiryModel;
        delete req.session.inquiry;
        res.render('inquiry/index');

        return;
    } catch (err) {
        const error = (err instanceof Error) ? err : new ErrorUtilModule.AppError(err, undefined);
        next(error);
    }
}
