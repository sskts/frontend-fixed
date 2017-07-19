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
const MP = require("../../../libs/MP");
const TicketForm_1 = require("../../forms/Purchase/TicketForm");
const PurchaseSession = require("../../models/Purchase/PurchaseModel");
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
            const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
            if (purchaseModel.isExpired())
                throw ErrorUtilModule.ERROR_EXPIRE;
            if (!purchaseModel.accessAuth(PurchaseSession.PurchaseModel.TICKET_STATE))
                throw ErrorUtilModule.ERROR_ACCESS;
            if (purchaseModel.performance === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (purchaseModel.transactionMP === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (purchaseModel.performanceCOA === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            //券種取得
            const salesTicketsResult = yield getSalesTickets(req, purchaseModel);
            const performance = purchaseModel.performance;
            const flgMvtkUse = purchaseModel.performanceCOA.flgMvtkUse;
            const dateMvtkBegin = purchaseModel.performanceCOA.dateMvtkBegin;
            const dateToday = moment().format('YYYYMMDD');
            res.locals.error = '';
            res.locals.mvtkFlg = (flgMvtkUse === '1' && dateMvtkBegin !== undefined && Number(dateMvtkBegin) <= Number(dateToday));
            res.locals.tickets = salesTicketsResult;
            res.locals.mvtkLength = (purchaseModel.mvtk === null) ? 0 : purchaseModel.mvtk.length;
            res.locals.performance = performance;
            res.locals.reserveSeats = purchaseModel.reserveSeats;
            res.locals.reserveTickets = purchaseModel.reserveTickets;
            res.locals.transactionId = purchaseModel.transactionMP.id;
            res.locals.kbnJoueihousiki = purchaseModel.performanceCOA.kbnJoueihousiki;
            res.locals.step = PurchaseSession.PurchaseModel.TICKET_STATE;
            //セッション更新
            req.session.purchase = purchaseModel.toSession();
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
            const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
            if (purchaseModel.isExpired())
                throw ErrorUtilModule.ERROR_EXPIRE;
            if (purchaseModel.transactionMP === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (purchaseModel.performance === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (purchaseModel.reserveSeats === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (purchaseModel.reserveTickets === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (purchaseModel.authorizationCOA === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (purchaseModel.performanceCOA === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            //取引id確認
            if (req.body.transactionId !== purchaseModel.transactionMP.id)
                throw ErrorUtilModule.ERROR_ACCESS;
            //バリデーション
            TicketForm_1.default(req);
            const validationResult = yield req.getValidationResult();
            if (validationResult.isEmpty()) {
                const reserveTickets = JSON.parse(req.body.reserveTickets);
                purchaseModel.reserveTickets = yield ticketValidation(req, res, purchaseModel, reserveTickets);
                log('券種検証');
                // COAオーソリ削除
                yield MP.services.transaction.removeAuthorization({
                    accessToken: yield UtilModule.getAccessToken(req),
                    transactionId: purchaseModel.transactionMP.id,
                    authorizationId: purchaseModel.authorizationCOA.id
                });
                log('MPCOAオーソリ削除');
                //COAオーソリ追加
                purchaseModel.authorizationCOA = yield MP.services.transaction.addCOAAuthorization({
                    accessToken: yield UtilModule.getAccessToken(req),
                    transaction: purchaseModel.transactionMP,
                    reserveSeatsTemporarilyResult: purchaseModel.reserveSeats,
                    salesTicketResults: purchaseModel.reserveTickets,
                    performance: purchaseModel.performance,
                    theaterCode: purchaseModel.performanceCOA.theaterCode,
                    titleCode: purchaseModel.performanceCOA.titleCode,
                    titleBranchNum: purchaseModel.performanceCOA.titleBranchNum,
                    screenCode: purchaseModel.performanceCOA.screenCode,
                    price: purchaseModel.getPrice()
                });
                log('MPCOAオーソリ追加', purchaseModel.authorizationCOA);
                if (purchaseModel.authorizationMvtk !== null) {
                    // ムビチケオーソリ削除
                    yield MP.services.transaction.removeAuthorization({
                        accessToken: yield UtilModule.getAccessToken(req),
                        transactionId: purchaseModel.transactionMP.id,
                        authorizationId: purchaseModel.authorizationMvtk.id
                    });
                    log('MPムビチケオーソリ削除');
                }
                if (purchaseModel.mvtk !== null && purchaseModel.isReserveMvtkTicket()) {
                    // 購入管理番号情報
                    const mvtk = MvtkUtilModule.createMvtkInfo(purchaseModel.reserveTickets, purchaseModel.mvtk);
                    const mvtkTickets = mvtk.tickets;
                    const mvtkSeats = mvtk.seats;
                    log('購入管理番号情報', mvtkTickets);
                    if (mvtkTickets.length === 0 || mvtkSeats.length === 0)
                        throw ErrorUtilModule.ERROR_ACCESS;
                    const mvtkFilmCode = MvtkUtilModule.getfilmCode(purchaseModel.performanceCOA.titleCode, purchaseModel.performanceCOA.titleBranchNum);
                    // 興行会社ユーザー座席予約番号(予約番号)
                    const startDate = {
                        day: `${moment(purchaseModel.performance.attributes.day).format('YYYY/MM/DD')}`,
                        time: `${UtilModule.timeFormat(purchaseModel.performance.attributes.timeStart)}:00`
                    };
                    purchaseModel.authorizationMvtk = yield MP.services.transaction.addMvtkauthorization({
                        accessToken: yield UtilModule.getAccessToken(req),
                        transaction: purchaseModel.transactionMP,
                        amount: purchaseModel.getMvtkPrice(),
                        kgygishCd: MvtkUtilModule.COMPANY_CODE,
                        yykDvcTyp: MVTK.SeatInfoSyncUtilities.RESERVED_DEVICE_TYPE_ENTERTAINER_SITE_PC,
                        trkshFlg: MVTK.SeatInfoSyncUtilities.DELETE_FLAG_FALSE,
                        // tslint:disable-next-line:max-line-length
                        kgygishSstmZskyykNo: `${purchaseModel.performance.attributes.day}${purchaseModel.reserveSeats.tmpReserveNum}`,
                        kgygishUsrZskyykNo: String(purchaseModel.reserveSeats.tmpReserveNum),
                        jeiDt: `${startDate.day} ${startDate.time}`,
                        kijYmd: startDate.day,
                        stCd: MvtkUtilModule.getSiteCode(purchaseModel.performance.attributes.theater.id),
                        screnCd: purchaseModel.performanceCOA.screenCode,
                        knyknrNoInfo: mvtkTickets,
                        zskInfo: mvtkSeats,
                        skhnCd: mvtkFilmCode // 作品コード
                    });
                    log('MPムビチケオーソリ追加');
                }
                req.session.purchase = purchaseModel.toSession();
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
                const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
                if (purchaseModel.transactionMP === null)
                    throw ErrorUtilModule.ERROR_PROPERTY;
                if (purchaseModel.performanceCOA === null)
                    throw ErrorUtilModule.ERROR_PROPERTY;
                const salesTicketsResult = yield getSalesTickets(req, purchaseModel);
                const performance = purchaseModel.performance;
                const flgMvtkUse = purchaseModel.performanceCOA.flgMvtkUse;
                const dateMvtkBegin = purchaseModel.performanceCOA.dateMvtkBegin;
                res.locals.mvtkFlg = (flgMvtkUse === '1' && dateMvtkBegin < moment().format('YYYYMMDD')) ? true : false;
                res.locals.mvtkLength = (purchaseModel.mvtk === null) ? 0 : purchaseModel.mvtk.length;
                res.locals.tickets = salesTicketsResult;
                res.locals.performance = performance;
                res.locals.reserveSeats = purchaseModel.reserveSeats;
                res.locals.reserveTickets = JSON.parse(req.body.reserveTickets);
                res.locals.transactionId = purchaseModel.transactionMP.id;
                res.locals.kbnJoueihousiki = purchaseModel.performanceCOA.kbnJoueihousiki;
                res.locals.step = PurchaseSession.PurchaseModel.TICKET_STATE;
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
 * 券種リスト取得
 * @memberof Purchase.TicketModule
 * @function getSalesTickets
 * @param {Request} req
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {Promise<SalesTicket[]>}
 */
function getSalesTickets(req, purchaseModel) {
    return __awaiter(this, void 0, void 0, function* () {
        if (purchaseModel.performance === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.performanceCOA === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.salesTicketsCOA === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        const result = [];
        for (const ticket of purchaseModel.salesTicketsCOA) {
            result.push({
                ticketCode: ticket.ticketCode,
                ticketName: ticket.ticketName,
                ticketNameKana: ticket.ticketNameKana,
                ticketNameEng: ticket.ticketNameEng,
                stdPrice: ticket.stdPrice,
                addPrice: ticket.addPrice,
                salePrice: ticket.salePrice,
                ticketNote: ticket.ticketNote,
                addPriceGlasses: 0,
                mvtkNum: '',
                glasses: false // メガネ有無
            });
            if (ticket.addGlasses > 0) {
                result.push({
                    ticketCode: ticket.ticketCode,
                    ticketName: `${ticket.ticketName}${req.__('common.glasses')}`,
                    ticketNameKana: ticket.ticketNameKana,
                    ticketNameEng: ticket.ticketNameEng,
                    stdPrice: ticket.stdPrice,
                    addPrice: ticket.addPrice,
                    salePrice: ticket.salePrice + ticket.addGlasses,
                    ticketNote: ticket.ticketNote,
                    addPriceGlasses: ticket.addGlasses,
                    mvtkNum: '',
                    glasses: true // メガネ有無
                });
            }
        }
        if (purchaseModel.mvtk === null)
            return result;
        // ムビチケ情報からチケット情報へ変換
        const mvtkTickets = [];
        for (const mvtk of purchaseModel.mvtk) {
            for (let i = 0; i < Number(mvtk.ykknInfo.ykknKnshbtsmiNum); i += 1) {
                mvtkTickets.push({
                    ticketCode: mvtk.ticket.ticketCode,
                    ticketName: mvtk.ticket.ticketName,
                    ticketNameKana: mvtk.ticket.ticketNameKana,
                    ticketNameEng: mvtk.ticket.ticketNameEng,
                    stdPrice: 0,
                    addPrice: mvtk.ticket.addPrice,
                    salePrice: mvtk.ticket.addPrice,
                    ticketNote: req.__('common.mvtkCode') + mvtk.code,
                    addPriceGlasses: mvtk.ticket.addPriceGlasses,
                    mvtkNum: mvtk.code,
                    glasses: false // メガネ有無
                });
                if (mvtk.ticket.addPriceGlasses > 0) {
                    mvtkTickets.push({
                        ticketCode: mvtk.ticket.ticketCode,
                        ticketName: `${mvtk.ticket.ticketName}${req.__('common.glasses')}`,
                        ticketNameKana: mvtk.ticket.ticketNameKana,
                        ticketNameEng: mvtk.ticket.ticketNameEng,
                        stdPrice: 0,
                        addPrice: mvtk.ticket.addPrice,
                        salePrice: mvtk.ticket.addPrice + mvtk.ticket.addPriceGlasses,
                        ticketNote: req.__('common.mvtkCode') + mvtk.code,
                        addPriceGlasses: mvtk.ticket.addPriceGlasses,
                        mvtkNum: mvtk.code,
                        glasses: true // メガネ有無
                    });
                }
            }
        }
        log('券種', mvtkTickets.concat(result));
        return mvtkTickets.concat(result);
    });
}
/**
 * 券種検証
 * @memberof Purchase.TicketModule
 * @function ticketValidation
 * @param {Request} req
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @param {PurchaseSession.ReserveTicket[]} reserveTickets
 * @returns {Promise<void>}
 */
// tslint:disable-next-line:cyclomatic-complexity
// tslint:disable-next-line:max-func-body-length
function ticketValidation(req, res, purchaseModel, reserveTickets) {
    return __awaiter(this, void 0, void 0, function* () {
        if (purchaseModel.performance === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.performanceCOA === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.salesTicketsCOA === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        const result = [];
        //コアAPI券種取得
        const salesTickets = purchaseModel.salesTicketsCOA;
        for (const ticket of reserveTickets) {
            if (ticket.mvtkNum !== '') {
                // ムビチケ
                if (purchaseModel.mvtk === null)
                    throw ErrorUtilModule.ERROR_PROPERTY;
                const mvtkTicket = purchaseModel.mvtk.find((value) => {
                    return (value.code === ticket.mvtkNum && value.ticket.ticketCode === ticket.ticketCode);
                });
                if (mvtkTicket === undefined)
                    throw ErrorUtilModule.ERROR_ACCESS;
                result.push({
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
                });
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
                const sameTickets = reserveTickets.filter((value) => {
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
