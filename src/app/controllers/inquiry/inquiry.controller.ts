/**
 * 照会
 * @namespace InquiryModule
 */
import * as cinerinoService from '@cinerino/sdk';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as HTTPStatus from 'http-status';
import { formatTelephone, getApiOption } from '../../functions';
import { inquiryLoginForm } from '../../functions/forms';
import { AppError, ErrorType, InquiryModel } from '../../models';
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
export async function loginRender(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const theaterCode = req.query.theater;
    if (theaterCode === undefined) {
        const status = 404;
        res.status(status).render('error/notFound');

        return;
    }
    try {
        if (req.session === undefined) {
            throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        }
        const options = getApiOption(req);
        const inquiryModel = new InquiryModel();
        // 劇場のショップを検索
        const searchResult = await new cinerinoService.service.Seller(
            options
        ).search({
            branchCode: { $eq: theaterCode },
        });
        inquiryModel.seller = searchResult.data[0];
        log('劇場のショップを検索', inquiryModel.seller);
        inquiryModel.login = {
            reserveNum:
                req.query.reserve !== undefined ? req.query.reserve : '',
            telephone: '',
        };
        res.locals.inquiryModel = inquiryModel;
        res.locals.error = undefined;
        res.render('inquiry/login');

        return;
    } catch (err) {
        next(err);
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
export async function inquiryAuth(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (req.session === undefined) {
            throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        }
        const options = getApiOption(req);
        inquiryLoginForm(req);
        const validationResult = await req.getValidationResult();
        if (validationResult.isEmpty()) {
            const inquiryModel = new InquiryModel();
            const searchResult = await new cinerinoService.service.Seller(
                options
            ).search({
                branchCode: { $eq: req.body.theaterCode },
            });
            inquiryModel.seller = searchResult.data[0];
            log('劇場のショップを検索');
            if (
                inquiryModel.seller === undefined ||
                inquiryModel.seller.location === undefined ||
                inquiryModel.seller.location.branchCode === undefined
            ) {
                throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
            }
            inquiryModel.login = {
                reserveNum: req.body.reserveNum,
                telephone: req.body.telephone,
            };
            log('照会情報', {
                telephone: formatTelephone(inquiryModel.login.telephone),
                confirmationNumber: inquiryModel.login.reserveNum,
                theaterCode: inquiryModel.seller.location.branchCode,
            });
            const orderService = new cinerinoService.service.Order(options);
            const findByOrderInquiryKey4ssktsResult =
                await orderService.findByOrderInquiryKey4sskts({
                    telephone: formatTelephone(inquiryModel.login.telephone),
                    confirmationNumber: inquiryModel.login.reserveNum,
                    theaterCode: inquiryModel.seller.location.branchCode,
                });
            const order = Array.isArray(findByOrderInquiryKey4ssktsResult)
                ? findByOrderInquiryKey4ssktsResult[0]
                : findByOrderInquiryKey4ssktsResult;
            const acceptedOffers =
                await orderService.searchAcceptedOffersByConfirmationNumber({
                    confirmationNumber: order.confirmationNumber,
                    orderNumber: order.orderNumber,
                });
            if (acceptedOffers.length === 0) {
                throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
            }
            inquiryModel.order = order;
            inquiryModel.acceptedOffers = acceptedOffers;
            log('照会情報');
            if (inquiryModel.order === undefined) {
                res.locals.inquiryModel = inquiryModel;
                res.locals.error = getInquiryError(req);
                res.render('inquiry/login');

                return;
            }
            inquiryModel.save(req.session);
            // 購入者内容確認へ
            res.redirect(
                `/inquiry/${inquiryModel.order.orderNumber}/?theater=${inquiryModel.seller.location.branchCode}`
            );

            return;
        } else {
            const inquiryModel = new InquiryModel();
            const searchResult = await new cinerinoService.service.Seller(
                options
            ).search({
                branchCode: { $eq: req.body.theaterCode },
            });
            inquiryModel.seller = searchResult.data[0];
            log('劇場のショップを検索');
            if (inquiryModel.seller === undefined) {
                throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
            }
            inquiryModel.login = {
                reserveNum: req.body.reserveNum,
                telephone: req.body.telephone,
            };
            res.locals.inquiryModel = inquiryModel;
            res.locals.error = validationResult.mapped();
            res.render('inquiry/login');

            return;
        }
    } catch (err) {
        console.error(err);
        next(err);
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
            parm: 'reserveNum',
            msg: `${req.__('common.purchase_number')}${req.__(
                'common.validation.inquiry'
            )}`,
            value: '',
        },
        telephone: {
            parm: 'telephone',
            msg: `${req.__('common.tel_num')}${req.__(
                'common.validation.inquiry'
            )}`,
            value: '',
        },
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
export function confirmRender(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    try {
        if (req.session === undefined || req.query.theater === undefined) {
            throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        }
        if (req.session.inquiry === undefined) {
            res.redirect(
                `/inquiry/login?orderNumber=${req.params.orderNumber}&theater=${req.query.theater}`
            );

            return;
        }

        const inquiryModel = new InquiryModel(req.session.inquiry);
        res.locals.inquiryModel = inquiryModel;
        delete req.session.inquiry;
        res.render('inquiry/index');

        return;
    } catch (err) {
        next(err);
    }
}
