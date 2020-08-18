/**
 * 購入確認
 * @namespace Purchase.ConfirmModule
 */
import * as cinerinoService from '@cinerino/sdk';
import * as mvtkReserve from '@motionpicture/mvtk-reserve-service';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as HTTPStatus from 'http-status';
import { getApiOption } from '../../functions';
import { AppError, ErrorType, PurchaseModel } from '../../models';

const log = debug('SSKTS:Purchase.ConfirmModule');

/**
 * 購入者内容確認
 * @memberof Purchase.ConfirmModule
 * @function render
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
export async function render(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (req.session === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        const purchaseModel = new PurchaseModel(req.session.purchase);
        if (purchaseModel.isExpired()) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Expire);
        if (!purchaseModel.accessAuth(PurchaseModel.CONFIRM_STATE)) {
            throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Access);
        }

        //購入者内容確認表示
        res.locals.updateReserve = undefined;
        res.locals.error = undefined;
        res.locals.purchaseModel = purchaseModel;
        res.locals.step = PurchaseModel.CONFIRM_STATE;
        //セッション更新
        purchaseModel.save(req.session);
        res.render('purchase/confirm', { layout: 'layouts/purchase/layout' });
    } catch (err) {
        next(err);
    }
}

/**
 *  予約情報からムビチケ情報作成
 */
export function createMovieTicketsFromAuthorizeSeatReservation(params: {
    authorizeSeatReservation: cinerinoService.factory.action.authorize.offer.seatReservation.IAction<
        cinerinoService.factory.service.webAPI.Identifier.COA
    >;
    checkMovieTicketAction: cinerinoService.factory.action.check.paymentMethod.movieTicket.IAction;
    seller: cinerinoService.factory.chevre.seller.ISeller;
}) {
    const results: cinerinoService.factory.chevre.paymentMethod.paymentCard.movieTicket.IMovieTicket[] = [];
    const authorizeSeatReservation = params.authorizeSeatReservation;
    const checkMovieTicketAction = params.checkMovieTicketAction;
    const seller = params.seller;
    if (checkMovieTicketAction.result === undefined) {
        return [];
    }
    const movieTickets = checkMovieTicketAction.result.movieTickets;

    authorizeSeatReservation.object.acceptedOffer.forEach((o) => {
        const findReservation =
            movieTickets.find((m) => {
                return m.identifier === o.ticketInfo.mvtkNum && m.serviceType === o.ticketInfo.mvtkKbnKensyu;
            });
        if (findReservation === undefined) {
            return;
        }
        results.push({
            typeOf: cinerinoService.factory.paymentMethodType.MovieTicket,
            identifier: findReservation.identifier,
            accessCode: findReservation.accessCode,
            serviceType: findReservation.serviceType,
            serviceOutput: {
                ...findReservation.serviceOutput,
                reservedTicket: {
                    ...findReservation.serviceOutput.reservedTicket,
                    ticketedSeat: {
                        ...findReservation.serviceOutput.reservedTicket.ticketedSeat,
                        seatNumber: o.seatNumber,
                        seatSection: o.seatSection
                    }
                }
            },
            project: seller.project
        });
    });

    return results;
}

/**
 * 購入結果
 * @interface IPurchaseResult
 */
interface IPurchaseResult {
    mvtk: undefined | mvtkReserve.services.seat.seatInfoSync.ISeatInfoSyncResult;
    order: undefined | cinerinoService.factory.transaction.placeOrder.IResult;
    mail: undefined | any;
    cognito: undefined | any;
    complete: undefined | any;
}

/**
 * 購入確定
 * @memberof Purchase.ConfirmModule
 * @function purchase
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 * @description フロー(本予約成功、本予約失敗、購入期限切れ)
 */
// tslint:disable-next-line:max-func-body-length
export async function purchase(req: Request, res: Response): Promise<void> {
    const purchaseResult: IPurchaseResult = {
        mvtk: undefined,
        order: undefined,
        mail: undefined,
        cognito: undefined,
        complete: undefined
    };
    try {
        if (req.session === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        const options = getApiOption(req);
        const purchaseModel = new PurchaseModel(req.session.purchase);
        const transaction = purchaseModel.transaction;
        const seller = purchaseModel.seller;
        const seatReservationAuthorization = purchaseModel.seatReservationAuthorization;
        if (transaction === undefined
            || req.body.transactionId !== transaction.id
            || seller === undefined
            || seatReservationAuthorization === undefined) {
            throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        }
        //購入期限切れ
        if (purchaseModel.isExpired()) {
            delete req.session.purchase;
            throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Expire);
        }
        const mvtkTickets = purchaseModel.reserveTickets.filter((ticket) => {
            return (ticket.mvtkNum !== '');
        });
        const checkMovieTicketAction = purchaseModel.checkMovieTicketAction;
        // ムビチケ使用
        if (purchaseModel.mvtk !== undefined
            && mvtkTickets.length > 0
            && checkMovieTicketAction !== undefined) {
            const movieTickets = createMovieTicketsFromAuthorizeSeatReservation({
                authorizeSeatReservation: seatReservationAuthorization,
                seller,
                checkMovieTicketAction
            });
            const identifiers: string[] = [];
            movieTickets.forEach((m) => {
                const findResult = identifiers.find((i) => i === m.identifier);
                if (findResult !== undefined) {
                    return;
                }
                identifiers.push(m.identifier);
            });
            const paymentService = new cinerinoService.service.Payment(options);
            for (const identifier of identifiers) {
                await paymentService.authorizeMovieTicket({
                    object: {
                        typeOf: cinerinoService.factory.paymentMethodType.MovieTicket,
                        amount: 0,
                        movieTickets: movieTickets.filter((m) => m.identifier === identifier)
                    },
                    purpose: transaction
                });
            }
            log('Mvtk payment');
        }

        purchaseResult.order = await new cinerinoService.service.transaction.PlaceOrder4sskts(options)
            .confirm({
                id: transaction.id,
                sendEmailMessage: false
            });
        log('Order confirmation');

        //購入情報をセッションへ
        const complete = {
            transaction: purchaseModel.transaction,
            screeningEvent: purchaseModel.screeningEvent,
            profile: purchaseModel.profile,
            seatReservationAuthorization: purchaseModel.seatReservationAuthorization,
            reserveTickets: purchaseModel.reserveTickets
        };
        req.session.complete = complete;
        purchaseResult.complete = complete;
        // 購入セッション削除
        delete req.session.purchase;
        // 購入完了情報を返す
        res.json({ result: purchaseResult });
    } catch (err) {
        log('purchase error', err);
        if (err.code !== undefined) {
            res.status(err.code);
        } else {
            res.status(httpStatus.BAD_REQUEST);
        }
        res.json({ error: err });
    }
}

/**
 * 完了情報取得
 * @memberof Purchase.ConfirmModule
 * @function getCompleteData
 * @param {Request} req
 * @param {Response} res
 * @returns {void}
 */
export function getCompleteData(req: Request, res: Response): void {
    try {
        if (req.session === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        if (req.session.complete === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Expire);
        res.json({ result: req.session.complete });
    } catch (err) {
        log('getCompleteData error', err);
        if (err.code !== undefined) {
            res.status(err.code);
        } else {
            res.status(httpStatus.BAD_REQUEST);
        }
        res.json({ error: err });
    }
}
