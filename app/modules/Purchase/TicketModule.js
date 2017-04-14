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
const log = debug('SSKTS');
/**
 * 券種選択
 * @memberOf Purchase.TicketModule
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
            res.locals.error = '';
            res.locals.mvtkFlg = (flgMvtkUse === '1' && dateMvtkBegin < moment().format('YYYYMMDD')) ? true : false;
            res.locals.tickets = salesTicketsResult;
            res.locals.mvtkLength = (purchaseModel.mvtk === null) ? 0 : purchaseModel.mvtk.length;
            res.locals.performance = performance;
            res.locals.reserveSeats = purchaseModel.reserveSeats;
            res.locals.reserveTickets = purchaseModel.reserveTickets;
            res.locals.step = PurchaseSession.PurchaseModel.TICKET_STATE;
            res.locals.transactionId = purchaseModel.transactionMP.id;
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
 * @memberOf Purchase.TicketModule
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
            if (req.body.transaction_id !== purchaseModel.transactionMP.id)
                throw ErrorUtilModule.ERROR_ACCESS;
            //バリデーション
            TicketForm_1.default(req);
            const validationResult = yield req.getValidationResult();
            if (validationResult.isEmpty()) {
                const reserveTickets = JSON.parse(req.body.reserve_tickets);
                purchaseModel.reserveTickets = yield ticketValidation(req, res, purchaseModel, reserveTickets);
                log('券種検証');
                // COAオーソリ削除
                yield MP.removeCOAAuthorization({
                    transactionId: purchaseModel.transactionMP.id,
                    coaAuthorizationId: purchaseModel.authorizationCOA.id
                });
                log('MPCOAオーソリ削除');
                //COAオーソリ追加
                purchaseModel.authorizationCOA = yield MP.addCOAAuthorization({
                    transaction: purchaseModel.transactionMP,
                    reserveSeatsTemporarilyResult: purchaseModel.reserveSeats,
                    salesTicketResults: purchaseModel.reserveTickets,
                    performance: purchaseModel.performance,
                    performanceCOA: purchaseModel.performanceCOA,
                    price: purchaseModel.getPrice()
                });
                log('MPCOAオーソリ追加', purchaseModel.authorizationCOA);
                if (purchaseModel.authorizationMvtk !== null) {
                    // ムビチケオーソリ削除
                    yield MP.removeMvtkAuthorization({
                        transactionId: purchaseModel.transactionMP.id,
                        mvtkAuthorizationId: purchaseModel.authorizationMvtk.id
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
                        time: `${UtilModule.timeFormat(purchaseModel.performance.attributes.time_start)}:00`
                    };
                    purchaseModel.authorizationMvtk = yield MP.addMvtkauthorization({
                        transaction: purchaseModel.transactionMP,
                        amount: purchaseModel.getMvtkPrice(),
                        kgygishCd: MvtkUtilModule.COMPANY_CODE,
                        yykDvcTyp: MVTK.SeatInfoSyncUtilities.RESERVED_DEVICE_TYPE_ENTERTAINER_SITE_PC,
                        trkshFlg: MVTK.SeatInfoSyncUtilities.DELETE_FLAG_FALSE,
                        // tslint:disable-next-line:max-line-length
                        kgygishSstmZskyykNo: `${purchaseModel.performance.attributes.day}${purchaseModel.reserveSeats.tmp_reserve_num}`,
                        kgygishUsrZskyykNo: String(purchaseModel.reserveSeats.tmp_reserve_num),
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
                res.locals.reserveTickets = JSON.parse(req.body.reserve_tickets);
                res.locals.step = PurchaseSession.PurchaseModel.TICKET_STATE;
                res.locals.transactionId = purchaseModel.transactionMP.id;
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
 * @memberOf Purchase.TicketModule
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
                ticket_code: ticket.ticket_code,
                ticket_name: ticket.ticket_name,
                ticket_name_kana: ticket.ticket_name_kana,
                ticket_name_eng: ticket.ticket_name_eng,
                std_price: ticket.std_price,
                add_price: ticket.add_price,
                sale_price: ticket.sale_price,
                ticket_note: ticket.ticket_note,
                add_price_glasses: 0,
                mvtk_num: '',
                glasses: false // メガネ有無
            });
            // if (ticket.add_price_glasses > 0) {
            //     result.push({
            //         ticket_code: ticket.ticket_code, // チケットコード
            //         ticket_name: ticket.ticket_name, // チケット名
            //         ticket_name_kana: ticket.ticket_name_kana, // チケット名(カナ)
            //         ticket_name_eng: ticket.ticket_name_eng, // チケット名(英)
            //         std_price: ticket.std_price, // 標準単価
            //         add_price: ticket.add_price, // 加算単価
            //         sale_price: ticket.sale_price, // 販売単価
            //         ticket_note: ticket.ticket_note, // チケット備考
            //         add_price_glasses: ticket.add_price_glasses, // メガネ単価
            //         mvtk_num: '', // ムビチケ購入番号
            //         glasses: true // メガネ有無
            //     });
            // }
        }
        if (purchaseModel.mvtk === null)
            return result;
        // ムビチケ情報からチケット情報へ変換
        const mvtkTickets = [];
        for (const mvtk of purchaseModel.mvtk) {
            for (let i = 0; i < Number(mvtk.ykknInfo.ykknKnshbtsmiNum); i += 1) {
                mvtkTickets.push({
                    ticket_code: mvtk.ticket.ticket_code,
                    ticket_name: mvtk.ticket.ticket_name,
                    ticket_name_kana: mvtk.ticket.ticket_name_kana,
                    ticket_name_eng: mvtk.ticket.ticket_name_eng,
                    std_price: 0,
                    add_price: mvtk.ticket.add_price,
                    sale_price: mvtk.ticket.add_price,
                    ticket_note: req.__('common.mvtk_code') + mvtk.code,
                    add_price_glasses: mvtk.ticket.add_price_glasses,
                    mvtk_num: mvtk.code,
                    glasses: false // メガネ有無
                });
                if (mvtk.ticket.add_price_glasses > 0) {
                    mvtkTickets.push({
                        ticket_code: mvtk.ticket.ticket_code,
                        ticket_name: `${mvtk.ticket.ticket_name}${req.__('common.glasses')}`,
                        ticket_name_kana: mvtk.ticket.ticket_name_kana,
                        ticket_name_eng: mvtk.ticket.ticket_name_eng,
                        std_price: 0,
                        add_price: mvtk.ticket.add_price,
                        sale_price: mvtk.ticket.add_price + mvtk.ticket.add_price_glasses,
                        ticket_note: req.__('common.mvtk_code') + mvtk.code,
                        add_price_glasses: mvtk.ticket.add_price_glasses,
                        mvtk_num: mvtk.code,
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
 * @memberOf Purchase.TicketModule
 * @function ticketValidation
 * @param {Request} req
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @param {PurchaseSession.ReserveTicket[]} reserveTickets
 * @returns {Promise<void>}
 */
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
            if (ticket.mvtk_num !== '') {
                // ムビチケ
                if (purchaseModel.mvtk === null)
                    throw ErrorUtilModule.ERROR_PROPERTY;
                const mvtkTicket = purchaseModel.mvtk.find((value) => {
                    return (value.code === ticket.mvtk_num && value.ticket.ticket_code === ticket.ticket_code);
                });
                if (mvtkTicket === undefined)
                    throw ErrorUtilModule.ERROR_ACCESS;
                result.push({
                    section: ticket.section,
                    seat_code: ticket.seat_code,
                    ticket_code: mvtkTicket.ticket.ticket_code,
                    ticket_name: (ticket.glasses)
                        ? `${mvtkTicket.ticket.ticket_name}${req.__('common.glasses')}`
                        : mvtkTicket.ticket.ticket_name,
                    ticket_name_eng: mvtkTicket.ticket.ticket_name_eng,
                    ticket_name_kana: mvtkTicket.ticket.ticket_name_kana,
                    std_price: 0,
                    add_price: mvtkTicket.ticket.add_price,
                    dis_price: 0,
                    sale_price: (ticket.glasses)
                        ? mvtkTicket.ticket.add_price + mvtkTicket.ticket.add_price_glasses
                        : mvtkTicket.ticket.add_price,
                    add_price_glasses: (ticket.glasses)
                        ? mvtkTicket.ticket.add_price_glasses
                        : 0,
                    glasses: ticket.glasses,
                    mvtk_num: mvtkTicket.code,
                    mvtk_app_price: Number(mvtkTicket.ykknInfo.kijUnip) // ムビチケ計上単価
                });
            }
            else {
                // 通常券種
                const salesTicket = salesTickets.find((value) => {
                    return (value.ticket_code === ticket.ticket_code);
                });
                if (salesTicket === undefined)
                    throw ErrorUtilModule.ERROR_ACCESS;
                // 制限単位、人数制限判定
                const mismatchTickets = [];
                const sameTickets = reserveTickets.filter((value) => {
                    return (value.ticket_code === salesTicket.ticket_code);
                });
                if (sameTickets.length === 0)
                    throw ErrorUtilModule.ERROR_ACCESS;
                if (salesTicket.limit_unit === '001') {
                    if (sameTickets.length % salesTicket.limit_count !== 0) {
                        if (mismatchTickets.indexOf(ticket.ticket_code) === -1) {
                            mismatchTickets.push(ticket.ticket_code);
                        }
                    }
                }
                else if (salesTicket.limit_unit === '002') {
                    if (sameTickets.length < salesTicket.limit_count) {
                        if (mismatchTickets.indexOf(ticket.ticket_code) === -1) {
                            mismatchTickets.push(ticket.ticket_code);
                        }
                    }
                }
                if (mismatchTickets.length > 0) {
                    res.locals.error = JSON.stringify(mismatchTickets);
                    throw ErrorUtilModule.ERROR_VALIDATION;
                }
                result.push({
                    section: ticket.section,
                    seat_code: ticket.seat_code,
                    ticket_code: salesTicket.ticket_code,
                    ticket_name: salesTicket.ticket_name,
                    ticket_name_eng: salesTicket.ticket_name_eng,
                    ticket_name_kana: salesTicket.ticket_name_kana,
                    std_price: salesTicket.std_price,
                    add_price: salesTicket.add_price,
                    dis_price: 0,
                    sale_price: salesTicket.sale_price,
                    add_price_glasses: ticket.add_price_glasses,
                    glasses: ticket.glasses,
                    mvtk_num: ticket.mvtk_num,
                    mvtk_app_price: 0 // ムビチケ計上単価
                });
            }
        }
        return result;
    });
}
