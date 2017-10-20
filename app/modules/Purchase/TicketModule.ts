/**
 * 購入券種選択
 * @namespace Purchase.TicketModule
 */
import * as sasaki from '@motionpicture/sskts-api-nodejs-client';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as HTTPStatus from 'http-status';
import TicketForm from '../../forms/Purchase/TicketForm';
import { AuthModel } from '../../models/Auth/AuthModel';
import { IReserveTicket, PurchaseModel } from '../../models/Purchase/PurchaseModel';
import { deleteSession } from '../Error/ErrorModule';
import { AppError, ErrorType } from '../Util/ErrorUtilModule';
import * as InputModule from './InputModule';
const log = debug('SSKTS:Purchase.TicketModule');

/**
 * 券種選択
 * @memberof Purchase.TicketModule
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
        const authModel = new AuthModel(req.session.auth);
        const options = {
            endpoint: (<string>process.env.SSKTS_API_ENDPOINT),
            auth: authModel.create()
        };
        if (purchaseModel.individualScreeningEvent === null) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        if (purchaseModel.isExpired()) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Expire);
        if (!purchaseModel.accessAuth(PurchaseModel.TICKET_STATE)) {
            throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Access);
        }

        if (authModel.isMember()) {
            if (purchaseModel.profile === null) {
                const contacts = await sasaki.service.person(options).getContacts({
                    personId: 'me'
                });
                log('会員情報取得', contacts);
                purchaseModel.profile = {
                    familyName: contacts.familyName,
                    givenName: contacts.givenName,
                    email: contacts.email,
                    emailConfirm: contacts.email,
                    telephone: contacts.telephone.replace(/\-/g, '')
                };
            }
            if (purchaseModel.creditCards.length === 0) {
                const creditCards = await sasaki.service.person(options).findCreditCards({
                    personId: 'me'
                });
                log('会員クレジット情報取得', purchaseModel.creditCards);
                purchaseModel.creditCards = creditCards.filter((creditCard) => {
                    // GMO定数へ変更
                    return (creditCard.deleteFlag === '0');
                });
            }
        }

        //券種取得
        res.locals.error = '';
        res.locals.salesTickets = purchaseModel.getSalesTickets(req);
        res.locals.purchaseModel = purchaseModel;
        res.locals.step = PurchaseModel.TICKET_STATE;
        //セッション更新
        purchaseModel.save(req.session);
        //券種選択表示
        res.render('purchase/ticket', { layout: 'layouts/purchase/layout' });
    } catch (err) {
        next(err);
    }
}

/**
 * 選択チケット
 * @interface ISelectTicket
 */
export interface ISelectTicket {
    /**
     * 座席セクション
     */
    section: string;
    /**
     * 座席番号
     */
    seatCode: string;
    /**
     * チケットコード
     */
    ticketCode: string;
    /**
     * チケット名
     */
    ticketName: string;
    /**
     * 販売単価
     */
    salePrice: number;
    /**
     * メガネ有り無し
     */
    glasses: boolean;
    /**
     * メガネ加算単価
     */
    addPriceGlasses: number;
    /**
     * ムビチケ購入番号
     */
    mvtkNum: string;
}

/**
 * 券種決定
 * @memberof Purchase.TicketModule
 * @function ticketSelect
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
// tslint:disable-next-line:max-func-body-length cyclomatic-complexity
export async function ticketSelect(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (req.session === undefined) {
        next(new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property));

        return;
    }
    try {
        const authModel = new AuthModel(req.session.auth);
        const options = {
            endpoint: (<string>process.env.SSKTS_API_ENDPOINT),
            auth: authModel.create()
        };
        const purchaseModel = new PurchaseModel(req.session.purchase);
        if (purchaseModel.isExpired()) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Expire);
        if (purchaseModel.transaction === null
            || purchaseModel.individualScreeningEvent === null
            || purchaseModel.seatReservationAuthorization === null
            || req.body.transactionId !== purchaseModel.transaction.id) {
            throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        }
        //バリデーション
        TicketForm(req);
        const validationResult = await req.getValidationResult();
        if (validationResult.isEmpty()) {
            const selectTickets: ISelectTicket[] = JSON.parse(req.body.reserveTickets);
            purchaseModel.reserveTickets = convertToReserveTickets(req, purchaseModel, selectTickets);
            log('券種変換');
            ticketValidation(purchaseModel);
            log('券種検証');
            //COAオーソリ追加
            const changeSeatReservationOffersArgs = {
                transactionId: purchaseModel.transaction.id,
                actionId: purchaseModel.seatReservationAuthorization.id,
                eventIdentifier: purchaseModel.individualScreeningEvent.identifier,
                offers: (<IReserveTicket[]>purchaseModel.reserveTickets).map((reserveTicket) => {
                    return {
                        seatSection: reserveTicket.section,
                        seatNumber: reserveTicket.seatCode,
                        ticketInfo: {
                            ticketCode: reserveTicket.ticketCode,
                            ticketName: reserveTicket.ticketName,
                            ticketNameEng: reserveTicket.ticketNameEng,
                            ticketNameKana: reserveTicket.ticketNameKana,
                            stdPrice: reserveTicket.stdPrice,
                            addPrice: reserveTicket.addPrice,
                            disPrice: reserveTicket.disPrice,
                            salePrice: reserveTicket.salePrice,
                            mvtkAppPrice: reserveTicket.mvtkAppPrice,
                            ticketCount: 1,
                            seatNum: reserveTicket.seatCode,
                            addGlasses: reserveTicket.addPriceGlasses,
                            kbnEisyahousiki: reserveTicket.kbnEisyahousiki,
                            mvtkNum: reserveTicket.mvtkNum,
                            mvtkKbnDenshiken: reserveTicket.mvtkKbnDenshiken,
                            mvtkKbnMaeuriken: reserveTicket.mvtkKbnMaeuriken,
                            mvtkKbnKensyu: reserveTicket.mvtkKbnKensyu,
                            mvtkSalesPrice: reserveTicket.mvtkSalesPrice
                        }
                    };
                })
            };
            purchaseModel.seatReservationAuthorization = await sasaki.service.transaction.placeOrder(options)
                .changeSeatReservationOffers(changeSeatReservationOffersArgs);
            if (purchaseModel.seatReservationAuthorization === null) {
                throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
            }
            log('SSKTSCOA仮予約更新');
            if (purchaseModel.mvtkAuthorization !== null) {
                await sasaki.service.transaction.placeOrder(options).cancelMvtkAuthorization({
                    transactionId: purchaseModel.transaction.id,
                    actionId: purchaseModel.mvtkAuthorization.id
                });
                log('SSKTSムビチケオーソリ削除');
            }
            if (purchaseModel.mvtk.length > 0 && purchaseModel.isReserveMvtkTicket()) {
                // 購入管理番号情報
                const mvtkSeatInfoSync = purchaseModel.getMvtkSeatInfoSync();
                log('購入管理番号情報', mvtkSeatInfoSync);
                if (mvtkSeatInfoSync === null) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
                const createMvtkAuthorizationArgs = {
                    transactionId: purchaseModel.transaction.id,
                    mvtk: {
                        price: purchaseModel.getMvtkPrice(),
                        transactionId: purchaseModel.transaction.id,
                        seatInfoSyncIn: mvtkSeatInfoSync
                    }
                };
                log('SSKTSムビチケオーソリ追加IN', createMvtkAuthorizationArgs);
                log('seatInfoSyncIn.knyknrNoInfo', createMvtkAuthorizationArgs.mvtk.seatInfoSyncIn.knyknrNoInfo[0]);
                purchaseModel.mvtkAuthorization = await sasaki.service.transaction.placeOrder(options)
                    .createMvtkAuthorization(createMvtkAuthorizationArgs);
                log('SSKTSムビチケオーソリ追加', purchaseModel.mvtkAuthorization);
            }
            purchaseModel.save(req.session);
            log('セッション更新');

            if (authModel.isMember() && purchaseModel.getReserveAmount() === 0) {
                // 情報入力スキップ
                await InputModule.purchaserInformationRegistrationOfMember(req, res, next);
            } else {
                res.redirect('/purchase/input');
            }
        } else {
            throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        }
    } catch (err) {
        if (err.code === HTTPStatus.BAD_REQUEST
            && err.errorType === ErrorType.Validation) {
            // 割引条件エラー
            const purchaseModel = new PurchaseModel(req.session.purchase);
            purchaseModel.reserveTickets = JSON.parse(req.body.reserveTickets);
            res.locals.error = err.message;
            res.locals.salesTickets = purchaseModel.getSalesTickets(req);
            res.locals.purchaseModel = purchaseModel;
            res.locals.step = PurchaseModel.TICKET_STATE;
            res.render('purchase/ticket', { layout: 'layouts/purchase/layout' });

            return;
        } else if (err.code === HTTPStatus.BAD_REQUEST
            && err.errors
            && err.errors.filter((error: any) => error.reason === 'Argument').length > 0) {
            // 割引条件エラー
            const purchaseModel = new PurchaseModel(req.session.purchase);
            purchaseModel.reserveTickets = JSON.parse(req.body.reserveTickets);
            const errors = err.errors.map((error: any) => {
                const index = Number(error.argumentName.split('.')[1]);

                return purchaseModel.reserveTickets[index].ticketCode;
            });
            res.locals.error = JSON.stringify(errors);
            res.locals.salesTickets = purchaseModel.getSalesTickets(req);
            res.locals.purchaseModel = purchaseModel;
            res.locals.step = PurchaseModel.TICKET_STATE;
            res.render('purchase/ticket', { layout: 'layouts/purchase/layout' });

            return;
        } else if (err.code === HTTPStatus.NOT_FOUND
            && err.errors
            && err.errors.find((error: any) => error.entityName.indexOf('offers') > -1) !== undefined) {
            // 券種が存在しない
            deleteSession(req.session);
            const status = err.code;
            res.locals.message = req.__('purchase.ticket.notFound');
            res.locals.error = err;
            res.status(status).render('error/error');

            return;
        }
        next(err);
    }
}

/**
 * 券種変換
 * @memberof Purchase.TicketModule
 * @function convertToReserveTickets
 * @param {Request} req
 * @param {PurchaseModel} purchaseModel
 * @param {ISelectTicket[]} rselectTickets
 * @returns {void}
 */
function convertToReserveTickets(
    req: Request,
    purchaseModel: PurchaseModel,
    selectTickets: ISelectTicket[]
): IReserveTicket[] {
    if (purchaseModel.salesTickets === null) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);

    const result: IReserveTicket[] = [];
    //コアAPI券種取得
    const salesTickets = purchaseModel.salesTickets;

    for (const ticket of selectTickets) {
        if (ticket.mvtkNum !== '') {
            // ムビチケ
            if (purchaseModel.mvtk === null) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
            const mvtkTicket = purchaseModel.mvtk.find((value) => {
                return (value.code === ticket.mvtkNum && value.ticket.ticketCode === ticket.ticketCode);
            });
            if (mvtkTicket === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
            const reserveTicket: IReserveTicket = {
                section: ticket.section,
                seatCode: ticket.seatCode,
                ticketCode: mvtkTicket.ticket.ticketCode, // チケットコード
                ticketName: (ticket.glasses)
                    ? `${mvtkTicket.ticket.ticketName}${req.__('common.glasses')}`
                    : mvtkTicket.ticket.ticketName, // チケット名
                ticketNameEng: mvtkTicket.ticket.ticketNameEng, // チケット名（英）
                ticketNameKana: mvtkTicket.ticket.ticketNameKana, // チケット名（カナ）
                stdPrice: 0, // 標準単価
                addPrice: mvtkTicket.ticket.addPrice, // 加算単価
                disPrice: 0, // 割引額
                salePrice: (ticket.glasses)
                    ? (<number>mvtkTicket.ticket.addPrice) + (<number>mvtkTicket.ticket.addPriceGlasses)
                    : mvtkTicket.ticket.addPrice, // 販売単価
                ticketNote: '',
                addPriceGlasses: (ticket.glasses)
                    ? mvtkTicket.ticket.addPriceGlasses
                    : 0, // メガネ単価
                glasses: ticket.glasses, // メガネ有り無し
                mvtkAppPrice: Number(mvtkTicket.ykknInfo.kijUnip), // ムビチケ計上単価
                kbnEisyahousiki: mvtkTicket.ykknInfo.eishhshkTyp, // ムビチケ映写方式区分
                mvtkNum: mvtkTicket.code, // ムビチケ購入管理番号
                mvtkKbnDenshiken: mvtkTicket.ykknInfo.dnshKmTyp, // ムビチケ電子券区分
                mvtkKbnMaeuriken: mvtkTicket.ykknInfo.znkkkytsknGkjknTyp, // ムビチケ前売券区分
                mvtkKbnKensyu: mvtkTicket.ykknInfo.ykknshTyp, // ムビチケ券種区分
                mvtkSalesPrice: Number(mvtkTicket.ykknInfo.knshknhmbiUnip), // ムビチケ販売単価
                limitUnit: '001',
                limitCount: 1
            };
            result.push(reserveTicket);
        } else {
            // 通常券種
            const salesTicket = salesTickets.find((value) => {
                return (value.ticketCode === ticket.ticketCode);
            });
            if (salesTicket === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);

            result.push({
                section: ticket.section, // 座席セクション
                seatCode: ticket.seatCode, // 座席番号
                ticketCode: salesTicket.ticketCode, // チケットコード
                ticketName: (ticket.glasses)
                    ? `${salesTicket.ticketName}${req.__('common.glasses')}`
                    : salesTicket.ticketName, // チケット名
                ticketNameEng: salesTicket.ticketNameEng, // チケット名（英）
                ticketNameKana: salesTicket.ticketNameKana, // チケット名（カナ）
                stdPrice: salesTicket.stdPrice, // 標準単価
                addPrice: salesTicket.addPrice, // 加算単価
                disPrice: 0, // 割引額
                salePrice: (ticket.glasses)
                    ? (<number>salesTicket.salePrice) + (<number>salesTicket.addGlasses)
                    : salesTicket.salePrice, // 販売単価
                ticketNote: salesTicket.ticketNote,
                addPriceGlasses: (ticket.glasses)
                    ? salesTicket.addGlasses
                    : 0, // メガネ単価
                glasses: ticket.glasses, // メガネ有り無し
                mvtkAppPrice: 0, // ムビチケ計上単価
                kbnEisyahousiki: '00', // ムビチケ映写方式区分
                mvtkNum: '', // ムビチケ購入管理番号
                mvtkKbnDenshiken: '00', // ムビチケ電子券区分
                mvtkKbnMaeuriken: '00', // ムビチケ前売券区分
                mvtkKbnKensyu: '00', // ムビチケ券種区分
                mvtkSalesPrice: 0, // ムビチケ販売単価
                limitUnit: salesTicket.limitUnit,
                limitCount: salesTicket.limitCount
            });
        }
    }

    return result;
}

/**
 * 券種検証
 * @function ticketValidation
 * @param {PurchaseModel} purchaseModel
 */
function ticketValidation(
    purchaseModel: PurchaseModel
): void {
    // 制限単位、人数制限判定
    const result: string[] = [];
    if (purchaseModel.reserveTickets.length === 0) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
    purchaseModel.reserveTickets.forEach((reserveTicket) => {
        if (reserveTicket.limitUnit === '001') {
            const unitLimitTickets = purchaseModel.reserveTickets.filter((ticket) => {
                return (ticket.limitUnit === '001' && ticket.limitCount === reserveTicket.limitCount);
            });
            if (unitLimitTickets.length % reserveTicket.limitCount !== 0) {
                result.push(reserveTicket.ticketCode);
            }
        }
    });
    if (result.length > 0) {
        throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Validation, JSON.stringify(result));
    }
}
