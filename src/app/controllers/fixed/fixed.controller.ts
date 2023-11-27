/**
 * 照会
 * @namespace Fixed.FixedModule
 */
import * as cinerinoService from '@cinerino/sdk';
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
export async function settingRender(
    req: Request<undefined, undefined>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (req.session === undefined) {
            throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        }
        const options = await getApiOption(req);
        const searchResult = await new req.cinerino.service.Seller(
            options
        ).search({});
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
 */
export async function getInquiryData(
    req: Request<
        undefined,
        undefined,
        {
            theaterCode: string;
            reserveNum: string;
            telephone: string;
        }
    >,
    res: Response
): Promise<void> {
    try {
        if (req.session === undefined) {
            throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        }
        const options = await getApiOption(req);
        inquiryLoginForm(req);
        const validationResult = await req.getValidationResult();
        if (validationResult.isEmpty()) {
            const inquiryModel = new InquiryModel();
            const searchResult = await new req.cinerino.service.Seller(
                options
            ).search({
                branchCode: { $eq: req.body.theaterCode },
            });
            const seller = searchResult.data[0];
            inquiryModel.seller = seller;
            if (
                seller?.id === undefined ||
                seller?.location?.branchCode === undefined
            ) {
                throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
            }
            inquiryModel.login = {
                reserveNum: req.body.reserveNum,
                telephone: req.body.telephone,
            };
            const orderService = new req.cinerino.service.Order({
                ...options,
                seller: { id: seller.id },
            });
            const findByOrderInquiryKey4ssktsResult =
                await orderService.findByOrderInquiryKey4sskts({
                    telephone: inquiryModel.login.telephone,
                    confirmationNumber: inquiryModel.login.reserveNum,
                    theaterCode: seller.location.branchCode,
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

            log('オーダーOut', inquiryModel.order);

            if (inquiryModel.order === undefined) {
                throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
            }

            // 印刷用
            const reservations = createPrintReservations(inquiryModel);
            res.json({ result: reservations });

            return;
        }
        res.json({ result: [] });
    } catch (err) {
        log('オーダーerr', err);
        res.json({ result: [] });
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
export function createPrintReservations(
    inquiryModel: InquiryModel
): IReservation[] {
    const { seller, order, acceptedOffers } = inquiryModel;
    if (
        order === undefined ||
        acceptedOffers === undefined ||
        acceptedOffers.length === 0 ||
        seller?.location === undefined
    ) {
        throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
    }
    const theaterName =
        typeof seller.location.name === 'string'
            ? seller.location.name
            : seller.location.name === undefined ||
              seller.location.name.ja === undefined
            ? ''
            : seller.location.name.ja;

    return acceptedOffers.map((offer) => {
        const itemOffered = offer.itemOffered;
        if (
            itemOffered.typeOf !==
                cinerinoService.factory.reservationType.EventReservation ||
            itemOffered.reservationFor.superEvent.workPerformed === undefined ||
            itemOffered.reservationFor.location === undefined ||
            itemOffered.reservationFor.location.name === undefined ||
            itemOffered.reservedTicket.ticketToken === undefined ||
            itemOffered.reservedTicket.coaTicketInfo === undefined ||
            itemOffered.reservationFor.coaInfo === undefined
        ) {
            throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        }

        return {
            reserveNo: itemOffered.reservationNumber,
            filmNameJa:
                itemOffered.reservationFor.name.ja === undefined
                    ? ''
                    : itemOffered.reservationFor.name.ja,
            filmNameEn: '',
            theaterName: theaterName,
            screenName:
                itemOffered.reservationFor.location.name === undefined ||
                itemOffered.reservationFor.location.name.ja === undefined
                    ? ''
                    : itemOffered.reservationFor.location.name.ja,
            performanceDay: moment(itemOffered.reservationFor.startDate).format(
                'YYYY/MM/DD'
            ),
            performanceStartTime: timeFormat(
                moment(itemOffered.reservationFor.startDate).toDate(),
                itemOffered.reservationFor.coaInfo.dateJouei
            ),
            seatCode: itemOffered.reservedTicket.coaTicketInfo.seatNum,
            ticketName: itemOffered.reservedTicket.coaTicketInfo.ticketName,
            ticketSalePrice: itemOffered.reservedTicket.coaTicketInfo.salePrice,
            qrStr: itemOffered.reservedTicket.ticketToken,
        };
    });
}

// tslint:disable-next-line:variable-name
export function topRender(_req: Request, res: Response, next: NextFunction) {
    try {
        res.render('index/index');
    } catch (err) {
        next(err);
    }
}
