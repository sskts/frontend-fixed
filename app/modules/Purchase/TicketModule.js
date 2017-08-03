"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 購入券種選択
 * @namespace Purchase.TicketModule
 */
const MVTK = require("@motionpicture/mvtk-service");
const debug = require("debug");
const moment = require("moment");
const MP = require("../../../libs/MP/sskts-api");
const TicketForm_1 = require("../../forms/Purchase/TicketForm");
const PurchaseModel_1 = require("../../models/Purchase/PurchaseModel");
const ErrorUtilModule = require("../Util/ErrorUtilModule");
const UtilModule = require("../Util/UtilModule");
const MvtkUtilModule = require("./Mvtk/MvtkUtilModule");
const log = debug('SSKTS:Purchase.TicketModule');
/**
 * 券種選択
 * @memberof Purchase.TicketModule
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
function index(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.session === undefined)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (req.session.purchase === undefined)
                throw ErrorUtilModule.ERROR_EXPIRE;
            const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
            if (purchaseModel.individualScreeningEvent === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (purchaseModel.isExpired())
                throw ErrorUtilModule.ERROR_EXPIRE;
            if (!purchaseModel.accessAuth(PurchaseModel_1.PurchaseModel.TICKET_STATE))
                throw ErrorUtilModule.ERROR_ACCESS;
            //券種取得
            res.locals.error = '';
            res.locals.salesTickets = purchaseModel.getSalesTickets(req);
            res.locals.purchaseModel = purchaseModel;
            res.locals.step = PurchaseModel_1.PurchaseModel.TICKET_STATE;
            //セッション更新
            purchaseModel.save(req.session);
            //券種選択表示
            res.render('purchase/ticket', { layout: 'layouts/purchase/layout' });
            return;
        }
        catch (err) {
            const error = (err instanceof Error)
                ? new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message)
                : new ErrorUtilModule.CustomError(err, undefined);
            next(error);
            return;
        }
    });
}
exports.index = index;
/**
 * 券種決定
 * @memberof Purchase.TicketModule
 * @function select
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
// tslint:disable-next-line:cyclomatic-complexity
// tslint:disable-next-line:max-func-body-length
function select(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.session === undefined) {
            next(new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_PROPERTY, undefined));
            return;
        }
        try {
            if (req.session.purchase === undefined)
                throw ErrorUtilModule.ERROR_EXPIRE;
            const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
            if (purchaseModel.isExpired())
                throw ErrorUtilModule.ERROR_EXPIRE;
            if (purchaseModel.transaction === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (purchaseModel.individualScreeningEvent === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (purchaseModel.seatReservationAuthorization === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            //取引id確認
            if (req.body.transactionId !== purchaseModel.transaction.id)
                throw ErrorUtilModule.ERROR_ACCESS;
            //バリデーション
            TicketForm_1.default(req);
            const validationResult = yield req.getValidationResult();
            if (validationResult.isEmpty()) {
                const selectTickets = JSON.parse(req.body.reserveTickets);
                purchaseModel.reserveTickets = yield ticketValidation(req, res, purchaseModel, selectTickets);
                log('券種検証');
                // COAオーソリ削除
                yield MP.service.transaction.placeOrder.cancelSeatReservationAuthorization({
                    auth: yield UtilModule.createAuth(req.session.auth),
                    transactionId: purchaseModel.transaction.id,
                    authorizationId: purchaseModel.seatReservationAuthorization.id
                });
                log('MPCOAオーソリ削除');
                //COAオーソリ追加
                const createSeatReservationAuthorizationArgs = {
                    auth: yield UtilModule.createAuth(req.session.auth),
                    transactionId: purchaseModel.transaction.id,
                    eventIdentifier: purchaseModel.individualScreeningEvent.identifier,
                    offers: purchaseModel.reserveTickets.map((reserveTicket) => {
                        return {
                            seatSection: reserveTicket.section,
                            seatNumber: reserveTicket.seatCode,
                            ticket: {
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
                                mvtkKbnMaeuriken: reserveTicket.mvtkKbnKensyu,
                                mvtkKbnKensyu: reserveTicket.mvtkKbnKensyu,
                                mvtkSalesPrice: reserveTicket.mvtkSalesPrice
                            }
                        };
                    })
                };
                log('MPCOAオーソリ追加IN', createSeatReservationAuthorizationArgs.offers[0]);
                purchaseModel.seatReservationAuthorization = yield MP.service.transaction.placeOrder
                    .createSeatReservationAuthorization(createSeatReservationAuthorizationArgs);
                log('MPCOAオーソリ追加', purchaseModel.seatReservationAuthorization);
                if (purchaseModel.mvtkAuthorization !== null) {
                    yield MP.service.transaction.placeOrder.cancelMvtkAuthorization({
                        auth: yield UtilModule.createAuth(req.session.auth),
                        transactionId: purchaseModel.transaction.id,
                        authorizationId: purchaseModel.mvtkAuthorization.id
                    });
                    log('MPムビチケオーソリ削除');
                }
                if (purchaseModel.mvtk.length > 0 && purchaseModel.isReserveMvtkTicket()) {
                    // 購入管理番号情報
                    const mvtkInfo = MvtkUtilModule.createMvtkInfo(purchaseModel);
                    log('購入管理番号情報', mvtkInfo);
                    if (mvtkInfo === null)
                        throw ErrorUtilModule.ERROR_ACCESS;
                    const mvtkFilmCode = MvtkUtilModule.getfilmCode(purchaseModel.individualScreeningEvent.coaInfo.titleCode, purchaseModel.individualScreeningEvent.coaInfo.titleBranchNum);
                    // 興行会社ユーザー座席予約番号(予約番号)
                    const startDate = {
                        day: `${moment(purchaseModel.individualScreeningEvent.coaInfo.dateJouei).format('YYYY/MM/DD')}`,
                        time: `${purchaseModel.getScreeningTime().start}:00`
                    };
                    const createMvtkAuthorizationArgs = {
                        auth: yield UtilModule.createAuth(req.session.auth),
                        transactionId: purchaseModel.transaction.id,
                        mvtk: {
                            price: purchaseModel.getMvtkPrice(),
                            kgygishCd: MvtkUtilModule.COMPANY_CODE,
                            yykDvcTyp: MVTK.SeatInfoSyncUtilities.RESERVED_DEVICE_TYPE_ENTERTAINER_SITE_PC,
                            trkshFlg: MVTK.SeatInfoSyncUtilities.DELETE_FLAG_FALSE,
                            // tslint:disable-next-line:max-line-length
                            kgygishSstmZskyykNo: `${purchaseModel.individualScreeningEvent.coaInfo.dateJouei}${purchaseModel.seatReservationAuthorization.result.tmpReserveNum}`,
                            kgygishUsrZskyykNo: String(purchaseModel.seatReservationAuthorization.result.tmpReserveNum),
                            jeiDt: `${startDate.day} ${startDate.time}`,
                            kijYmd: startDate.day,
                            stCd: MvtkUtilModule.getSiteCode(purchaseModel.individualScreeningEvent.coaInfo.theaterCode),
                            screnCd: purchaseModel.individualScreeningEvent.coaInfo.screenCode,
                            knyknrNoInfo: mvtkInfo.purchaseNoInfo.map((purchaseNoInfo) => {
                                return {
                                    knyknrNo: purchaseNoInfo.KNYKNR_NO,
                                    pinCd: purchaseNoInfo.PIN_CD,
                                    knshInfo: purchaseNoInfo.KNSH_INFO.map((knshInfo) => {
                                        return {
                                            knshTyp: knshInfo.KNSH_TYP,
                                            miNum: knshInfo.MI_NUM
                                        };
                                    })
                                };
                            }),
                            zskInfo: mvtkInfo.seat.map((seat) => {
                                return { zskCd: seat.ZSK_CD };
                            }),
                            skhnCd: mvtkFilmCode // 作品コード
                        }
                    };
                    log('MPムビチケオーソリ追加IN', createMvtkAuthorizationArgs);
                    // tslint:disable-next-line:max-line-length
                    purchaseModel.mvtkAuthorization = yield MP.service.transaction.placeOrder.createMvtkAuthorization(createMvtkAuthorizationArgs);
                    log('MPムビチケオーソリ追加', purchaseModel.mvtkAuthorization);
                }
                purchaseModel.save(req.session);
                log('セッション更新');
                res.redirect('/purchase/input');
                return;
            }
            else {
                throw ErrorUtilModule.ERROR_ACCESS;
            }
        }
        catch (err) {
            if (err === ErrorUtilModule.ERROR_VALIDATION) {
                if (req.session.purchase === undefined)
                    throw ErrorUtilModule.ERROR_EXPIRE;
                const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
                if (purchaseModel.individualScreeningEvent === null)
                    throw ErrorUtilModule.ERROR_PROPERTY;
                res.locals.error = '';
                res.locals.salesTickets = purchaseModel.getSalesTickets(req);
                res.locals.purchaseModel = purchaseModel;
                res.locals.step = PurchaseModel_1.PurchaseModel.TICKET_STATE;
                res.render('purchase/ticket', { layout: 'layouts/purchase/layout' });
                return;
            }
            const error = (err instanceof Error)
                ? new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message)
                : new ErrorUtilModule.CustomError(err, undefined);
            next(error);
            return;
        }
    });
}
exports.select = select;
/**
 * 券種検証
 * @memberof Purchase.TicketModule
 * @function ticketValidation
 * @param {Request} req
 * @param {PurchaseModel} purchaseModel
 * @param {ISelectTicket[]} rselectTickets
 * @returns {Promise<void>}
 */
// tslint:disable-next-line:cyclomatic-complexity
// tslint:disable-next-line:max-func-body-length
function ticketValidation(req, res, purchaseModel, selectTickets) {
    return __awaiter(this, void 0, void 0, function* () {
        if (purchaseModel.individualScreeningEvent === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.salesTickets === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        const result = [];
        //コアAPI券種取得
        const salesTickets = purchaseModel.salesTickets;
        for (const ticket of selectTickets) {
            if (ticket.mvtkNum !== '') {
                // ムビチケ
                if (purchaseModel.mvtk === null)
                    throw ErrorUtilModule.ERROR_PROPERTY;
                const mvtkTicket = purchaseModel.mvtk.find((value) => {
                    return (value.code === ticket.mvtkNum && value.ticket.ticketCode === ticket.ticketCode);
                });
                if (mvtkTicket === undefined)
                    throw ErrorUtilModule.ERROR_ACCESS;
                const reserveTicket = {
                    section: ticket.section,
                    seatCode: ticket.seatCode,
                    ticketCode: mvtkTicket.ticket.ticketCode,
                    ticketName: (ticket.glasses)
                        ? `${mvtkTicket.ticket.ticketName}${req.__('common.glasses')}`
                        : mvtkTicket.ticket.ticketName,
                    ticketNameEng: mvtkTicket.ticket.ticketNameEng,
                    ticketNameKana: mvtkTicket.ticket.ticketNameKana,
                    stdPrice: 0,
                    addPrice: mvtkTicket.ticket.addPrice,
                    disPrice: 0,
                    salePrice: (ticket.glasses)
                        ? mvtkTicket.ticket.addPrice + mvtkTicket.ticket.addPriceGlasses
                        : mvtkTicket.ticket.addPrice,
                    ticketNote: '',
                    addPriceGlasses: (ticket.glasses)
                        ? mvtkTicket.ticket.addPriceGlasses
                        : 0,
                    glasses: ticket.glasses,
                    mvtkAppPrice: Number(mvtkTicket.ykknInfo.kijUnip),
                    kbnEisyahousiki: mvtkTicket.ykknInfo.eishhshkTyp,
                    mvtkNum: mvtkTicket.code,
                    mvtkKbnDenshiken: mvtkTicket.ykknInfo.dnshKmTyp,
                    mvtkKbnMaeuriken: mvtkTicket.ykknInfo.znkkkytsknGkjknTyp,
                    mvtkKbnKensyu: mvtkTicket.ykknInfo.ykknshTyp,
                    mvtkSalesPrice: Number(mvtkTicket.ykknInfo.knshknhmbiUnip) // ムビチケ販売単価
                };
                result.push(reserveTicket);
            }
            else {
                // 通常券種
                const salesTicket = salesTickets.find((value) => {
                    return (value.ticketCode === ticket.ticketCode);
                });
                if (salesTicket === undefined)
                    throw ErrorUtilModule.ERROR_ACCESS;
                // 制限単位、人数制限判定
                const mismatchTickets = [];
                const sameTickets = selectTickets.filter((value) => {
                    return (value.ticketCode === salesTicket.ticketCode);
                });
                if (sameTickets.length === 0)
                    throw ErrorUtilModule.ERROR_ACCESS;
                if (salesTicket.limitUnit === '001') {
                    if (sameTickets.length % salesTicket.limitCount !== 0) {
                        if (mismatchTickets.indexOf(ticket.ticketCode) === -1) {
                            mismatchTickets.push(ticket.ticketCode);
                        }
                    }
                }
                else if (salesTicket.limitUnit === '002') {
                    if (sameTickets.length < salesTicket.limitCount) {
                        if (mismatchTickets.indexOf(ticket.ticketCode) === -1) {
                            mismatchTickets.push(ticket.ticketCode);
                        }
                    }
                }
                if (mismatchTickets.length > 0) {
                    res.locals.error = JSON.stringify(mismatchTickets);
                    throw ErrorUtilModule.ERROR_VALIDATION;
                }
                result.push({
                    section: ticket.section,
                    seatCode: ticket.seatCode,
                    ticketCode: salesTicket.ticketCode,
                    ticketName: (ticket.glasses)
                        ? `${salesTicket.ticketName}${req.__('common.glasses')}`
                        : salesTicket.ticketName,
                    ticketNameEng: salesTicket.ticketNameEng,
                    ticketNameKana: salesTicket.ticketNameKana,
                    stdPrice: salesTicket.stdPrice,
                    addPrice: salesTicket.addPrice,
                    disPrice: 0,
                    salePrice: (ticket.glasses)
                        ? salesTicket.salePrice + salesTicket.addGlasses
                        : salesTicket.salePrice,
                    ticketNote: salesTicket.ticketNote,
                    addPriceGlasses: (ticket.glasses)
                        ? salesTicket.addGlasses
                        : 0,
                    glasses: ticket.glasses,
                    mvtkAppPrice: 0,
                    kbnEisyahousiki: '00',
                    mvtkNum: '',
                    mvtkKbnDenshiken: '00',
                    mvtkKbnMaeuriken: '00',
                    mvtkKbnKensyu: '00',
                    mvtkSalesPrice: 0 // ムビチケ販売単価
                });
            }
        }
        return result;
    });
}
