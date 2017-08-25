/**
 * 照会
 * @namespace Fixed.FixedModule
 */
import * as COA from '@motionpicture/coa-service';
import * as ssktsApi from '@motionpicture/sasaki-api-nodejs';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as moment from 'moment';
import inquiryLoginForm from '../../forms/Inquiry/LoginForm';
import { AuthModel } from '../../models/Auth/AuthModel';
import { InquiryModel } from '../../models/Inquiry/InquiryModel';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';
const log = debug('SSKTS:Fixed.FixedModule');

/**
 * 券売機TOPページ表示
 * @memberof Fixed.FixedModule
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
export async function index(_: Request, res: Response): Promise<void> {
    res.locals.ticketingSite = process.env.TICKETING_SITE_URL;
    res.render('index/index');
    log('券売機TOPページ表示');
}

/**
 * 券売機設定ページ表示
 * @memberof Fixed.FixedModule
 * @function setting
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function setting(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (req.session === undefined) throw ErrorUtilModule.ERROR_PROPERTY;
        const authModel = new AuthModel();
        const options = {
            endpoint: process.env.SSKTS_API_ENDPOINT,
            auth: authModel.create()
        };
        const movieTheaters = await ssktsApi.service.organization(options).searchMovieTheaters();
        log('movieTheaters: ', movieTheaters);
        res.locals.movieTheaters = movieTheaters;
        res.render('setting/index');
    } catch (err) {
        next(new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message));
    }
}

/**
 * 利用停止ページ表示
 * @memberof Fixed.FixedModule
 * @function stop
 * @param {Response} res
 * @returns {void}
 */
export function stop(_: Request, res: Response): void {
    res.render('stop/index');
}

/**
 * 照会情報取得
 * @memberof Fixed.FixedModule
 * @function getInquiryData
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getInquiryData(req: Request, res: Response): Promise<void> {
    try {
        if (req.session === undefined) throw ErrorUtilModule.ERROR_PROPERTY;
        const authModel = new AuthModel(req.session.auth);
        const options = {
            endpoint: process.env.SSKTS_API_ENDPOINT,
            auth: authModel.create()
        };
        inquiryLoginForm(req);
        const validationResult = await req.getValidationResult();
        if (validationResult.isEmpty()) {
            const inquiryModel = new InquiryModel();
            inquiryModel.movieTheaterOrganization = await ssktsApi.service.organization(options).findMovieTheaterByBranchCode({
                branchCode: req.body.theaterCode
            });
            log('劇場のショップを検索', inquiryModel.movieTheaterOrganization);
            if (inquiryModel.movieTheaterOrganization === null) throw ErrorUtilModule.ERROR_PROPERTY;
            inquiryModel.login = {
                reserveNum: req.body.reserveNum,
                telephone: req.body.telephone
            };
            inquiryModel.order = await ssktsApi.service.order(options).findByOrderInquiryKey({
                telephone: inquiryModel.login.telephone,
                orderNumber: Number(inquiryModel.login.reserveNum),
                theaterCode: inquiryModel.movieTheaterOrganization.location.branchCode
            });

            if (inquiryModel.order === null) {
                // 本予約して照会情報取得
                if (req.session.fixed === undefined) throw ErrorUtilModule.ERROR_PROPERTY;
                if (req.session.fixed.updateReserveIn === undefined) throw ErrorUtilModule.ERROR_PROPERTY;
                const updReserve = await COA.services.reserve.updReserve(req.session.fixed.updateReserveIn);
                log('COA本予約', updReserve);
                inquiryModel.order = await ssktsApi.service.order(options).findByOrderInquiryKey({
                    telephone: inquiryModel.login.telephone,
                    orderNumber: Number(inquiryModel.login.reserveNum),
                    theaterCode: inquiryModel.movieTheaterOrganization.location.branchCode
                });
                log('COA照会情報取得', inquiryModel.order);
                if (inquiryModel.order === null) throw ErrorUtilModule.ERROR_PROPERTY;
            }

            // 印刷用
            const order = inquiryModel.order;
            const reservations = inquiryModel.order.acceptedOffers.map((offer) => {
                if (offer.reservationFor.workPerformed === undefined) throw ErrorUtilModule.ERROR_PROPERTY;
                if (offer.reservationFor.location === undefined) throw ErrorUtilModule.ERROR_PROPERTY;
                if (offer.reservationFor.location.name === undefined) throw ErrorUtilModule.ERROR_PROPERTY;
                if (inquiryModel.movieTheaterOrganization === null) throw ErrorUtilModule.ERROR_PROPERTY;

                return {
                    reserveNo: order.orderInquiryKey.orderNumber,
                    filmNameJa: offer.reservationFor.workPerformed.name,
                    filmNameEn: '',
                    theaterName: inquiryModel.movieTheaterOrganization.location.name.ja,
                    screenName: offer.reservationFor.location.name.ja,
                    performanceDay: moment(offer.reservationFor.startDate).format('YYYY/MM/DD'),
                    performanceStartTime: inquiryModel.getScreeningTime(offer).start,
                    seatCode: offer.reservedTicket.coaTicketInfo.seatNum,
                    ticketName: (offer.reservedTicket.coaTicketInfo.addGlasses > 0)
                        ? `${offer.reservedTicket.coaTicketInfo.ticketName}${req.__('common.glasses')}`
                        : offer.reservedTicket.coaTicketInfo.ticketName,
                    ticketSalePrice: offer.reservedTicket.coaTicketInfo.salePrice,
                    qrStr: offer.reservedTicket.ticketToken
                };
            });
            delete req.session.fixed;
            res.json({ result: reservations });

            return;
        }
        res.json({ result: null });
    } catch (err) {
        res.json({ result: null });
    }
}
