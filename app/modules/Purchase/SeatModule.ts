/**
 * 購入座席選択
 * @namespace Purchase.SeatModule
 */

import * as COA from '@motionpicture/coa-service';
import * as sasaki from '@motionpicture/sskts-api-nodejs-client';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as fs from 'fs-extra';
import * as HTTPStatus from 'http-status';
import * as seatForm from '../../forms/Purchase/SeatForm';
import { AuthModel } from '../../models/Auth/AuthModel';
import { PurchaseModel } from '../../models/Purchase/PurchaseModel';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';
import * as UtilModule from '../Util/UtilModule';
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
        if (req.session === undefined) throw ErrorUtilModule.ErrorType.Property;
        const purchaseModel = new PurchaseModel(req.session.purchase);
        if (purchaseModel.isExpired()) throw ErrorUtilModule.ErrorType.Expire;
        if (!purchaseModel.accessAuth(PurchaseModel.SEAT_STATE)) throw ErrorUtilModule.ErrorType.Access;

        res.locals.reserveSeats = (purchaseModel.seatReservationAuthorization !== null)
            ? JSON.stringify(purchaseModel.seatReservationAuthorization) //仮予約中
            : null;
        res.locals.error = null;
        res.locals.reserveError = null;
        res.locals.purchaseModel = purchaseModel;
        res.locals.step = PurchaseModel.SEAT_STATE;
        res.render('purchase/seat', { layout: 'layouts/purchase/layout' });
    } catch (err) {
        const error = (err instanceof Error) ? err : new ErrorUtilModule.AppError(err, undefined);
        next(error);
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
        if (req.session === undefined) throw ErrorUtilModule.ErrorType.Property;
        const authModel = new AuthModel(req.session.auth);
        const options = {
            endpoint: (<string>process.env.SSKTS_API_ENDPOINT),
            auth: authModel.create()
        };
        const purchaseModel = new PurchaseModel(req.session.purchase);
        if (purchaseModel.isExpired()) throw ErrorUtilModule.ErrorType.Expire;
        // イベント情報取得
        purchaseModel.individualScreeningEvent = await sasaki.service.event(options).findIndividualScreeningEvent({
            identifier: req.query.performanceId
        });
        purchaseModel.save(req.session);
        res.json({
            err: null,
            result: {
                individualScreeningEvent: purchaseModel.individualScreeningEvent
            }
        });

    } catch (err) {
        const error = (err instanceof Error) ? err : new ErrorUtilModule.AppError(err, undefined);
        res.json({
            err: error.message,
            result: null
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
        if (req.session === undefined) throw ErrorUtilModule.ErrorType.Property;
        const purchaseModel = new PurchaseModel(req.session.purchase);
        if (purchaseModel.transaction === null
            || purchaseModel.individualScreeningEvent === null) throw ErrorUtilModule.ErrorType.Property;
        if (purchaseModel.isExpired()) throw ErrorUtilModule.ErrorType.Expire;
        //取引id確認
        if (req.body.transactionId !== purchaseModel.transaction.id) throw ErrorUtilModule.ErrorType.Access;
        const authModel = new AuthModel(req.session.auth);
        const options = {
            endpoint: (<string>process.env.SSKTS_API_ENDPOINT),
            auth: authModel.create()
        };
        //バリデーション
        seatForm.seatSelect(req);
        const validationResult = await req.getValidationResult();
        if (!validationResult.isEmpty()) {
            res.locals.reserveSeats = req.body.seats;
            res.locals.error = validationResult.mapped();
            res.locals.reserveError = null;
            res.locals.purchaseModel = purchaseModel;
            res.locals.step = PurchaseModel.SEAT_STATE;
            res.render('purchase/seat', { layout: 'layouts/purchase/layout' });

            return;
        }
        const selectSeats: ISelectSeats[] = JSON.parse(req.body.seats).listTmpReserve;
        //予約中
        if (purchaseModel.seatReservationAuthorization !== null) {
            const cancelSeatReservationAuthorizationIn = {
                transactionId: purchaseModel.transaction.id,
                actionId: purchaseModel.seatReservationAuthorization.id
            };
            purchaseModel.seatReservationAuthorization = null;
            purchaseModel.save(req.session);
            await sasaki.service.transaction.placeOrder(options)
                .cancelSeatReservationAuthorization(cancelSeatReservationAuthorizationIn);
            log('仮予約削除');
        }

        if (purchaseModel.salesTickets === null) {
            //コアAPI券種取得
            const salesTicketResult = await COA.services.reserve.salesTicket({
                theaterCode: purchaseModel.individualScreeningEvent.coaInfo.theaterCode,
                dateJouei: purchaseModel.individualScreeningEvent.coaInfo.dateJouei,
                titleCode: purchaseModel.individualScreeningEvent.coaInfo.titleCode,
                titleBranchNum: purchaseModel.individualScreeningEvent.coaInfo.titleBranchNum,
                timeBegin: purchaseModel.individualScreeningEvent.coaInfo.timeBegin
            });
            purchaseModel.salesTickets = salesTicketResult;
            log('コアAPI券種取得', purchaseModel.salesTickets);
        }
        if (purchaseModel.salesTickets.length === 0) throw ErrorUtilModule.ErrorType.Access;

        const createSeatReservationAuthorizationArgs = {
            transactionId: purchaseModel.transaction.id,
            eventIdentifier: purchaseModel.individualScreeningEvent.identifier,
            offers: selectSeats.map((seat) => {
                const salesTicket = (<COA.services.reserve.ISalesTicketResult[]>purchaseModel.salesTickets)[0];

                return {
                    seatSection: seat.seatSection,
                    seatNumber: seat.seatNum,
                    ticketInfo: {
                        ticketCode: salesTicket.ticketCode,
                        ticketName: salesTicket.ticketName,
                        ticketNameEng: salesTicket.ticketNameEng,
                        ticketNameKana: salesTicket.ticketNameKana,
                        stdPrice: salesTicket.stdPrice,
                        addPrice: salesTicket.addPrice,
                        disPrice: 0,
                        salePrice: salesTicket.salePrice,
                        mvtkAppPrice: 0,
                        ticketCount: 1,
                        seatNum: seat.seatNum,
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
        };
        purchaseModel.seatReservationAuthorization = await sasaki.service.transaction.placeOrder(options)
            .createSeatReservationAuthorization(createSeatReservationAuthorizationArgs);
        log('SSKTSオーソリ追加', purchaseModel.seatReservationAuthorization);
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
            res.locals.reserveSeats = null;
            res.locals.error = null;
            res.locals.reserveError = err.code;
            res.locals.purchaseModel = purchaseModel;
            res.locals.step = PurchaseModel.SEAT_STATE;
            res.render('purchase/seat', { layout: 'layouts/purchase/layout' });

            return;
        }
        const error = (err instanceof Error) ? err : new ErrorUtilModule.AppError(err, undefined);
        next(error);

        return;
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
        //バリデーション
        seatForm.screenStateReserve(req);
        const validationResult = await req.getValidationResult();
        if (!validationResult.isEmpty()) throw ErrorUtilModule.ErrorType.Validation;
        const theaterCode = `00${req.body.theaterCode}`.slice(UtilModule.DIGITS['02']);
        const screenCode = `000${req.body.screenCode}`.slice(UtilModule.DIGITS['03']);
        const screen = await fs.readJSON(`./app/theaters/${theaterCode}/${screenCode}.json`);
        const setting = await fs.readJSON('./app/theaters/setting.json');
        const state = await COA.services.reserve.stateReserveSeat({
            theaterCode: req.body.theaterCode, // 施設コード
            dateJouei: req.body.dateJouei, // 上映日
            titleCode: req.body.titleCode, // 作品コード
            titleBranchNum: req.body.titleBranchNum, // 作品枝番
            timeBegin: req.body.timeBegin, // 上映時刻
            screenCode: req.body.screenCode // スクリーンコード
        });
        res.json({
            err: null,
            result: {
                screen: screen,
                setting: setting,
                state: state
            }
        });
    } catch (err) {
        res.json({ err: err, result: null });
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
        seatForm.salesTickets(req);
        const validationResult = await req.getValidationResult();
        if (!validationResult.isEmpty()) throw ErrorUtilModule.ErrorType.Validation;
        if (req.session === undefined) throw ErrorUtilModule.ErrorType.Property;

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
        log('コアAPI券種取得', purchaseModel.salesTickets);
        purchaseModel.save(req.session);
        res.json({ err: null });
    } catch (err) {
        res.json({ err: err });
    }
}
