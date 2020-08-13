/**
 * 購入座席選択
 * @namespace Purchase.SeatModule
 */

import * as cinerinoService from '@cinerino/sdk';
import * as COA from '@motionpicture/coa-service';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as fs from 'fs-extra';
import * as HTTPStatus from 'http-status';
import { Digits, getApiOption } from '../../functions';
import { purchaseSalesTicketsForm, purchaseScreenStateReserveForm, purchaseSeatSelectForm } from '../../functions/forms';
import { AppError, ErrorType, PurchaseModel } from '../../models';
const log = debug('SSKTS:Purchase.SeatModule');

/**
 * 座席選択
 * @memberof Purchase.SeatModule
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
        if (!purchaseModel.accessAuth(PurchaseModel.SEAT_STATE)) {
            throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Access);
        }

        res.locals.reserveSeats = (purchaseModel.seatReservationAuthorization !== undefined)
            ? JSON.stringify(purchaseModel.seatReservationAuthorization) //仮予約中
            : undefined;
        res.locals.error = undefined;
        res.locals.reserveError = undefined;
        res.locals.purchaseModel = purchaseModel;
        res.locals.step = PurchaseModel.SEAT_STATE;
        res.render('purchase/seat', { layout: 'layouts/purchase/layout' });
    } catch (err) {
        next(err);
    }
}

/**
 * パフォーマンス変更
 * @memberof Purchase.SeatModule
 * @function performanceChange
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function performanceChange(req: Request, res: Response): Promise<void> {
    try {
        if (req.session === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        const options = getApiOption(req);
        const purchaseModel = new PurchaseModel(req.session.purchase);
        if (purchaseModel.isExpired()) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Expire);
        // イベント情報取得
        purchaseModel.screeningEvent = await new cinerinoService.service.Event(options).findById({
            id: req.query.performanceId
        });
        purchaseModel.save(req.session);
        res.json({
            err: undefined,
            result: {
                screeningEvent: purchaseModel.screeningEvent
            }
        });

    } catch (err) {
        res.json({
            err: err.message,
            result: undefined
        });
    }
}

/**
 * 選択座席
 * @interface ReserveSeats
 */
interface ISelectSeats {
    seatNum: string;
    seatSection: string;
}

/**
 * 座席決定
 * @memberof Purchase.SeatModule
 * @function seatSelect
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
// tslint:disable-next-line:max-func-body-length
export async function seatSelect(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (req.session === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        const purchaseModel = new PurchaseModel(req.session.purchase);
        if (purchaseModel.transaction === undefined
            || purchaseModel.screeningEvent === undefined
            || purchaseModel.screeningEvent.coaInfo === undefined) {
            throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        }
        if (purchaseModel.isExpired()) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Expire);
        //取引id確認
        if (req.body.transactionId !== purchaseModel.transaction.id) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        const options = getApiOption(req);
        //バリデーション
        purchaseSeatSelectForm(req);
        const validationResult = await req.getValidationResult();
        if (!validationResult.isEmpty()) {
            res.locals.reserveSeats = req.body.seats;
            res.locals.error = validationResult.mapped();
            res.locals.reserveError = undefined;
            res.locals.purchaseModel = purchaseModel;
            res.locals.step = PurchaseModel.SEAT_STATE;
            res.render('purchase/seat', { layout: 'layouts/purchase/layout' });

            return;
        }
        const selectSeats: ISelectSeats[] = JSON.parse(req.body.seats).listTmpReserve;
        //予約中
        if (purchaseModel.seatReservationAuthorization !== undefined) {
            await new cinerinoService.service.transaction.PlaceOrder4sskts(options)
                .cancelSeatReservationAuthorization({
                    id: purchaseModel.seatReservationAuthorization.id,
                    purpose: {
                        id: purchaseModel.transaction.id,
                        typeOf: purchaseModel.transaction.typeOf
                    }
                });
            purchaseModel.seatReservationAuthorization = undefined;
            purchaseModel.save(req.session);
            log('仮予約削除');
        }

        if (purchaseModel.salesTickets === undefined) {
            //コアAPI券種取得
            const salesTicketResult = await COA.services.reserve.salesTicket({
                theaterCode: purchaseModel.screeningEvent.coaInfo.theaterCode,
                dateJouei: purchaseModel.screeningEvent.coaInfo.dateJouei,
                titleCode: purchaseModel.screeningEvent.coaInfo.titleCode,
                titleBranchNum: purchaseModel.screeningEvent.coaInfo.titleBranchNum,
                timeBegin: purchaseModel.screeningEvent.coaInfo.timeBegin
            });
            purchaseModel.salesTickets = salesTicketResult;
            log('コアAPI券種取得');
        }
        if (purchaseModel.salesTickets.length === 0) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);

        purchaseModel.seatReservationAuthorization = await new cinerinoService.service.transaction.PlaceOrder4sskts(options)
            .createSeatReservationAuthorization({
                object: {
                    event: {
                        id: purchaseModel.screeningEvent.id
                    },
                    acceptedOffer: selectSeats.map((seat) => {
                        const salesTicket = purchaseModel.salesTickets[0];

                        return {
                            seatSection: seat.seatSection,
                            seatNumber: seat.seatNum,
                            ticketInfo: {
                                ticketCode: salesTicket.ticketCode,
                                mvtkAppPrice: 0,
                                ticketCount: 1,
                                addGlasses: 0,
                                kbnEisyahousiki: '00',
                                mvtkNum: '',
                                mvtkKbnDenshiken: '00',
                                mvtkKbnMaeuriken: '00',
                                mvtkKbnKensyu: '00',
                                mvtkSalesPrice: 0
                            }
                        };
                    })
                },
                purpose: {
                    id: purchaseModel.transaction.id,
                    typeOf: purchaseModel.transaction.typeOf
                }
            });
        log('SSKTSオーソリ追加');
        purchaseModel.orderCount = 0;
        log('GMOオーソリカウント初期化');
        purchaseModel.reserveTickets = [];
        log('選択チケット初期化');

        //セッション更新
        purchaseModel.save(req.session);
        // ムビチケセッション削除
        delete req.session.mvtk;
        //券種選択へ
        res.redirect('/purchase/ticket');

        return;
    } catch (err) {
        if (err.hasOwnProperty('errors')
            && (Number(err.code) === HTTPStatus.CONFLICT || Number(err.code) === HTTPStatus.SERVICE_UNAVAILABLE)) {
            const purchaseModel = new PurchaseModel((<Express.Session>req.session).purchase);
            res.locals.reserveSeats = undefined;
            res.locals.error = undefined;
            res.locals.reserveError = err.code;
            res.locals.purchaseModel = purchaseModel;
            res.locals.step = PurchaseModel.SEAT_STATE;
            res.render('purchase/seat', { layout: 'layouts/purchase/layout' });

            return;
        }
        next(err);
    }
}

/**
 * スクリーン状態取得
 * @memberof Purchase.SeatModule
 * @function getScreenStateReserve
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
export async function getScreenStateReserve(req: Request, res: Response): Promise<void> {
    try {
        // バリデーション
        purchaseScreenStateReserveForm(req);
        const validationResult = await req.getValidationResult();
        if (!validationResult.isEmpty()) throw ErrorType.Validation;
        const theaterCode = `00${req.body.theaterCode}`.slice(Digits['02']);
        const screenCode = `000${req.body.screenCode}`.slice(Digits['03']);
        const screen = await fs.readJSON(`${__dirname}/../../../../public/json/theaters/${theaterCode}/${screenCode}.json`);
        const setting = await fs.readJSON(`${__dirname}/../../../../public/json/theaters/setting.json`);
        const state = await COA.services.reserve.stateReserveSeat({
            theaterCode: req.body.theaterCode, // 施設コード
            dateJouei: req.body.dateJouei, // 上映日
            titleCode: req.body.titleCode, // 作品コード
            titleBranchNum: req.body.titleBranchNum, // 作品枝番
            timeBegin: req.body.timeBegin, // 上映時刻
            screenCode: req.body.screenCode // スクリーンコード
        });
        res.json({
            err: undefined,
            result: {
                screen: screen,
                setting: setting,
                state: state
            }
        });
    } catch (err) {
        res.json({ err: err, result: undefined });
    }
}

/**
 * 券種情報をセションへ保存
 * @memberof Purchase.SeatModule
 * @function getSalesTickets
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
export async function saveSalesTickets(req: Request, res: Response): Promise<void> {
    try {
        //バリデーション
        purchaseSalesTicketsForm(req);
        const validationResult = await req.getValidationResult();
        if (!validationResult.isEmpty()) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Validation);
        if (req.session === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);

        const purchaseModel = new PurchaseModel(req.session.purchase);
        //コアAPI券種取得
        purchaseModel.salesTickets = await COA.services.reserve.salesTicket({
            theaterCode: req.body.theaterCode,
            dateJouei: req.body.dateJouei,
            titleCode: req.body.titleCode,
            titleBranchNum: req.body.titleBranchNum,
            timeBegin: req.body.timeBegin
            // flgMember: coa.services.reserve.FlgMember.NonMember
        });
        log('コアAPI券種取得');
        purchaseModel.save(req.session);
        res.json({ err: undefined });
    } catch (err) {
        res.json({ err: err.message });
    }
}
