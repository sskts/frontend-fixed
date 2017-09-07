/**
 * 照会
 * @namespace Fixed.FixedModule
 */
import * as COA from '@motionpicture/coa-service';
import * as sasaki from '@motionpicture/sasaki-api-nodejs';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as moment from 'moment';
import inquiryLoginForm from '../../forms/Inquiry/LoginForm';
import { AuthModel } from '../../models/Auth/AuthModel';
import { InquiryModel } from '../../models/Inquiry/InquiryModel';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';
import * as UtilModule from '../Util/UtilModule';
const log = debug('SSKTS:Fixed.FixedModule');

/**
 * 券売機TOPページ表示
 * @memberof Fixed.FixedModule
 * @function render
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
export async function render(_: Request, res: Response): Promise<void> {
    res.locals.ticketingSite = process.env.TICKETING_SITE_URL;
    res.render('index/index');
    log('券売機TOPページ表示');
}

/**
 * 券売機設定ページ表示
 * @memberof Fixed.FixedModule
 * @function settingRender
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function settingRender(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (req.session === undefined) throw ErrorUtilModule.ErrorType.Property;
        const authModel = new AuthModel();
        const options = {
            endpoint: (<string>process.env.SSKTS_API_ENDPOINT),
            auth: authModel.create()
        };
        const movieTheaters = await sasaki.service.organization(options).searchMovieTheaters();
        log('movieTheaters: ', movieTheaters);
        res.locals.movieTheaters = movieTheaters;
        res.render('setting/index');
    } catch (err) {
        next(new ErrorUtilModule.CustomError(ErrorUtilModule.ErrorType.ExternalModule, err.message));
    }
}

/**
 * 利用停止ページ表示
 * @memberof Fixed.FixedModule
 * @function stopRender
 * @param {Response} res
 * @returns {void}
 */
export function stopRender(_: Request, res: Response): void {
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
        if (req.session === undefined) throw ErrorUtilModule.ErrorType.Property;
        const authModel = new AuthModel(req.session.auth);
        const options = {
            endpoint: (<string>process.env.SSKTS_API_ENDPOINT),
            auth: authModel.create()
        };
        inquiryLoginForm(req);
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

            if (inquiryModel.order === null) {
                // 本予約して照会情報取得
                if (req.session.fixed === undefined) throw ErrorUtilModule.ErrorType.Property;
                if (req.session.fixed.updateReserveIn === undefined) throw ErrorUtilModule.ErrorType.Property;
                const updReserve = await COA.services.reserve.updReserve(req.session.fixed.updateReserveIn);
                log('COA本予約', updReserve);
                inquiryModel.order = await sasaki.service.order(options).findByOrderInquiryKey({
                    telephone: inquiryModel.login.telephone,
                    confirmationNumber: Number(inquiryModel.login.reserveNum),
                    theaterCode: inquiryModel.movieTheaterOrganization.location.branchCode
                });
                log('COA照会情報取得', inquiryModel.order);
                if (inquiryModel.order === null) throw ErrorUtilModule.ErrorType.Property;
            }

            // 印刷用
            const order = inquiryModel.order;
            const reservations = inquiryModel.order.acceptedOffers.map((offer) => {
                if (offer.itemOffered.reservationFor.workPerformed === undefined) throw ErrorUtilModule.ErrorType.Property;
                if (offer.itemOffered.reservationFor.location === undefined) throw ErrorUtilModule.ErrorType.Property;
                if (offer.itemOffered.reservationFor.location.name === undefined) throw ErrorUtilModule.ErrorType.Property;
                if (inquiryModel.movieTheaterOrganization === null) throw ErrorUtilModule.ErrorType.Property;

                return {
                    reserveNo: order.orderInquiryKey.confirmationNumber,
                    filmNameJa: offer.itemOffered.reservationFor.workPerformed.name,
                    filmNameEn: '',
                    theaterName: inquiryModel.movieTheaterOrganization.location.name.ja,
                    screenName: offer.itemOffered.reservationFor.location.name.ja,
                    performanceDay: moment(offer.itemOffered.reservationFor.startDate).format('YYYY/MM/DD'),
                    performanceStartTime:  UtilModule.timeFormat(
                        (<Date>offer.itemOffered.reservationFor.startDate),
                        offer.itemOffered.reservationFor.coaInfo.dateJouei
                    ),
                    seatCode: offer.itemOffered.reservedTicket.coaTicketInfo.seatNum,
                    ticketName: (offer.itemOffered.reservedTicket.coaTicketInfo.addGlasses > 0)
                        ? `${offer.itemOffered.reservedTicket.coaTicketInfo.ticketName}${req.__('common.glasses')}`
                        : offer.itemOffered.reservedTicket.coaTicketInfo.ticketName,
                    ticketSalePrice: offer.itemOffered.reservedTicket.coaTicketInfo.salePrice,
                    qrStr: offer.itemOffered.reservedTicket.ticketToken
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
