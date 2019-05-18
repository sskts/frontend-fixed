/**
 * 照会
 * @namespace Fixed.FixedModule
 */
import * as sasaki from '@motionpicture/sskts-api-nodejs-client';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as HTTPStatus from 'http-status';
import * as moment from 'moment';
import { getApiOption, timeFormat } from '../../functions';
import { inquiryLoginForm } from '../../functions/forms';
import { AppError, ErrorType, InquiryModel } from '../../models';
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
        const options = getApiOption(req);
        const searchResult = await new sasaki.service.Seller(options).search({});
        const sellers = searchResult.data;
        log('sellers: ', sellers);
        res.locals.sellers = sellers;
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
        const options = getApiOption(req);
        inquiryLoginForm(req);
        const validationResult = await req.getValidationResult();
        if (validationResult.isEmpty()) {
            const inquiryModel = new InquiryModel();
            const searchResult = await new sasaki.service.Seller(options).search({
                location: { branchCodes: [req.body.theaterCode] }
            });
            inquiryModel.seller = searchResult.data[0];
            if (inquiryModel.seller === undefined
                || inquiryModel.seller.location === undefined
                || inquiryModel.seller.location.branchCode === undefined) {
                throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
            }
            inquiryModel.login = {
                reserveNum: req.body.reserveNum,
                telephone: req.body.telephone
            };
            inquiryModel.order = await new sasaki.service.Order(options).findByOrderInquiryKey({
                telephone: inquiryModel.login.telephone,
                confirmationNumber: Number(inquiryModel.login.reserveNum),
                theaterCode: inquiryModel.seller.location.branchCode
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
    reserveNo: string;
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
        || inquiryModel.seller === undefined
        || inquiryModel.seller.location === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
    const reserveNo = inquiryModel.order.confirmationNumber;
    const theaterName = inquiryModel.seller.location.name.ja;

    return inquiryModel.order.acceptedOffers.map((offer) => {
        if (offer.itemOffered.typeOf !== sasaki.factory.chevre.reservationType.EventReservation
            || offer.itemOffered.reservationFor.workPerformed === undefined
            || offer.itemOffered.reservationFor.location === undefined
            || offer.itemOffered.reservationFor.location.name === undefined
            || offer.itemOffered.reservedTicket.ticketToken === undefined
            || offer.itemOffered.reservedTicket.coaTicketInfo === undefined
            || offer.itemOffered.reservationFor.coaInfo === undefined
        ) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);

        return {
            reserveNo: reserveNo,
            filmNameJa: offer.itemOffered.reservationFor.workPerformed.name,
            filmNameEn: '',
            theaterName: theaterName,
            screenName: offer.itemOffered.reservationFor.location.name.ja,
            performanceDay: moment(offer.itemOffered.reservationFor.startDate).format('YYYY/MM/DD'),
            performanceStartTime: timeFormat(
                moment(offer.itemOffered.reservationFor.startDate).toDate(),
                offer.itemOffered.reservationFor.coaInfo.dateJouei
            ),
            seatCode: offer.itemOffered.reservedTicket.coaTicketInfo.seatNum,
            ticketName: offer.itemOffered.reservedTicket.coaTicketInfo.ticketName,
            ticketSalePrice: offer.itemOffered.reservedTicket.coaTicketInfo.salePrice,
            qrStr: offer.itemOffered.reservedTicket.ticketToken
        };
    });
}
