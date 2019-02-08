/**
 * 照会
 * @namespace Fixed.FixedModule
 */
import * as sasaki from '@motionpicture/sskts-api-nodejs-client';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as HTTPStatus from 'http-status';
import * as moment from 'moment';
import inquiryLoginForm from '../../forms/Inquiry/LoginForm';
import { AuthModel } from '../../models/Auth/AuthModel';
import { InquiryModel } from '../../models/Inquiry/InquiryModel';
import { AppError, ErrorType } from '../Util/ErrorUtilModule';
import * as UtilModule from '../Util/UtilModule';
const log = debug('SSKTS:Fixed.FixedModule');

/**
 * 券売機設定ページ表示
 * @memberof Fixed.FixedModule
 * @function settingRender
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function settingRender(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (req.session === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
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
        next(err);
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
        if (req.session === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
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
            if (inquiryModel.movieTheaterOrganization === null) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
            inquiryModel.login = {
                reserveNum: req.body.reserveNum,
                telephone: req.body.telephone
            };
            inquiryModel.order = await sasaki.service.order(options).findByOrderInquiryKey({
                telephone: inquiryModel.login.telephone,
                confirmationNumber: Number(inquiryModel.login.reserveNum),
                theaterCode: inquiryModel.movieTheaterOrganization.location.branchCode
            });

            log('オーダーIn', {
                telephone: inquiryModel.login.telephone,
                confirmationNumber: Number(inquiryModel.login.reserveNum),
                theaterCode: inquiryModel.movieTheaterOrganization.location.branchCode
            });

            log('オーダーOut', inquiryModel.order);

            if (inquiryModel.order === null) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);

            // 印刷用
            const reservations = createPrintReservations(inquiryModel);
            res.json({ result: reservations });

            return;
        }
        res.json({ result: null });
    } catch (err) {
        log('オーダーerr', err);
        res.json({ result: null });
    }
}

interface IReservation {
    reserveNo: number;
    filmNameJa: string;
    filmNameEn: string;
    theaterName: string;
    screenName: string;
    performanceDay: string;
    performanceStartTime: string;
    seatCode: string;
    ticketName: string;
    ticketSalePrice: number;
    qrStr: string;
}

/**
 * 印刷用予約情報生成
 * @function createPrintReservations
 * @param {Request} req
 * @param {InquiryModel} inquiryModel
 * @returns {IReservation[]}
 */
export function createPrintReservations(inquiryModel: InquiryModel): IReservation[] {
    if (inquiryModel.order === null
        || inquiryModel.movieTheaterOrganization === null) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
    const reserveNo = inquiryModel.order.confirmationNumber;
    const theaterName = inquiryModel.movieTheaterOrganization.location.name.ja;

    return inquiryModel.order.acceptedOffers.map((offer) => {
        if (offer.itemOffered.reservationFor.workPerformed === undefined
            || offer.itemOffered.reservationFor.location === undefined
            || offer.itemOffered.reservationFor.location.name === undefined
        ) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);

        return {
            reserveNo: reserveNo,
            filmNameJa: offer.itemOffered.reservationFor.workPerformed.name,
            filmNameEn: '',
            theaterName: theaterName,
            screenName: offer.itemOffered.reservationFor.location.name.ja,
            performanceDay: moment(offer.itemOffered.reservationFor.startDate).format('YYYY/MM/DD'),
            performanceStartTime: UtilModule.timeFormat(
                (<Date>offer.itemOffered.reservationFor.startDate),
                offer.itemOffered.reservationFor.coaInfo.dateJouei
            ),
            seatCode: offer.itemOffered.reservedTicket.coaTicketInfo.seatNum,
            ticketName: offer.itemOffered.reservedTicket.coaTicketInfo.ticketName,
            ticketSalePrice: offer.itemOffered.reservedTicket.coaTicketInfo.salePrice,
            qrStr: offer.itemOffered.reservedTicket.ticketToken
        };
    });
}
