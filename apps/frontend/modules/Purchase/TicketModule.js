/**
 * 購入券種選択
 * @namespace Purchase.TicketModule
 */
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
const COA = require("@motionpicture/coa-service");
const GMO = require("@motionpicture/gmo-service");
const debug = require("debug");
const MP = require("../../../../libs/MP");
const TicketForm_1 = require("../../forms/Purchase/TicketForm");
const PurchaseSession = require("../../models/Purchase/PurchaseModel");
const debugLog = debug('SSKTS ');
/**
 * 券種選択
 * @memberOf Purchase.TicketModule
 * @function index
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
function index(req, res, next) {
    if (!req.session)
        return next(new Error(req.__('common.error.property')));
    if (!req.session.purchase)
        return next(new Error(req.__('common.error.expire')));
    const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
    if (!purchaseModel.accessAuth(PurchaseSession.PurchaseModel.TICKET_STATE))
        return next(new Error(req.__('common.error.access')));
    if (!purchaseModel.performance)
        return next(new Error(req.__('common.error.property')));
    //券種取得
    getSalesTickets(req, purchaseModel).then((result) => {
        if (!purchaseModel.transactionMP)
            return next(new Error(req.__('common.error.property')));
        const performance = purchaseModel.performance;
        res.locals.tickets = result;
        res.locals.performance = performance;
        res.locals.reserveSeats = purchaseModel.reserveSeats;
        res.locals.reserveTickets = purchaseModel.reserveTickets;
        res.locals.step = PurchaseSession.PurchaseModel.TICKET_STATE;
        res.locals.transactionId = purchaseModel.transactionMP.id;
        //セッション更新
        if (!req.session)
            return next(new Error(req.__('common.error.property')));
        req.session.purchase = purchaseModel.toSession();
        //券種選択表示
        return res.render('purchase/ticket');
    }).catch((err) => {
        return next(new Error(err.message));
    });
}
exports.index = index;
/**
 * 券種決定
 * @memberOf Purchase.TicketModule
 * @function select
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
function select(req, res, next) {
    if (!req.session)
        return next(new Error(req.__('common.error.property')));
    if (!req.session.purchase)
        return next(new Error(req.__('common.error.expire')));
    const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
    if (!purchaseModel.transactionMP)
        return next(new Error(req.__('common.error.property')));
    //取引id確認
    if (req.body.transaction_id !== purchaseModel.transactionMP.id)
        return next(new Error(req.__('common.error.access')));
    //バリデーション
    const form = TicketForm_1.default(req);
    form(req, res, () => {
        const reserveTickets = JSON.parse(req.body.reserve_tickets);
        ticketValidation(req, purchaseModel, reserveTickets).then((result) => {
            if (!req.session)
                return next(new Error(req.__('common.error.property')));
            purchaseModel.reserveTickets = result;
            upDateAuthorization(req, purchaseModel).then(() => {
                if (!req.session)
                    return next(new Error(req.__('common.error.property')));
                //セッション更新
                req.session.purchase = purchaseModel.toSession();
                //購入者情報入力へ
                return res.redirect('/purchase/input');
            }).catch((err) => {
                return next(new Error(err.message));
            });
        }).catch((err) => {
            return next(new Error(err.message));
        });
    });
}
exports.select = select;
/**
 * 券種リスト取得
 * @memberOf Purchase.TicketModule
 * @function getSalesTickets
 * @param {express.Request} req
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {Promise<SalesTicket[]>}
 */
function getSalesTickets(req, purchaseModel) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!purchaseModel.performance)
            throw new Error(req.__('common.error.property'));
        if (!purchaseModel.performanceCOA)
            throw new Error(req.__('common.error.property'));
        const result = [];
        //コアAPI券種取得
        const performance = purchaseModel.performance;
        const salesTickets = yield COA.ReserveService.salesTicket({
            theater_code: performance.attributes.theater.id,
            date_jouei: performance.attributes.day,
            title_code: purchaseModel.performanceCOA.titleCode,
            title_branch_num: purchaseModel.performanceCOA.titleBranchNum,
            time_begin: performance.attributes.time_start
            // screen_code: performance.screen.id,
        });
        for (const ticket of salesTickets) {
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
                mvtk_num: null,
                glasses: false // メガネ有無
            });
        }
        if (!purchaseModel.mvtk)
            return result;
        // ムビチケ情報からチケット情報へ変換
        const mvtkTickets = [];
        for (const mvtk of purchaseModel.mvtk) {
            // tslint:disable-next-line:no-increment-decrement
            for (let i = 0; i < Number(mvtk.ykknInfo.ykknKnshbtsmiNum); i++) {
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
                        ticket_name: mvtk.ticket.ticket_name + req.__('common.glasses'),
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
        return mvtkTickets.concat(result);
    });
}
/**
 * 券種検証
 * @memberOf Purchase.TicketModule
 * @function ticketValidation
 * @param {express.Request} req
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @param {PurchaseSession.ReserveTicket[]} reserveTickets
 * @returns {Promise<void>}
 */
function ticketValidation(req, purchaseModel, reserveTickets) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!purchaseModel.performance)
            throw new Error(req.__('common.error.property'));
        if (!purchaseModel.performanceCOA)
            throw new Error(req.__('common.error.property'));
        const result = [];
        //コアAPI券種取得
        const performance = purchaseModel.performance;
        const salesTickets = yield COA.ReserveService.salesTicket({
            theater_code: performance.attributes.theater.id,
            date_jouei: performance.attributes.day,
            title_code: purchaseModel.performanceCOA.titleCode,
            title_branch_num: purchaseModel.performanceCOA.titleBranchNum,
            time_begin: performance.attributes.time_start
            // screen_code: performance.screen.id,
        });
        for (const ticket of reserveTickets) {
            if (ticket.mvtk_num) {
                // ムビチケ
                if (!purchaseModel.mvtk)
                    throw new Error(req.__('common.error.property'));
                const mvtkTicket = purchaseModel.mvtk.find((value) => {
                    return (value.code === ticket.mvtk_num && value.ticket.ticket_code === ticket.ticket_code);
                });
                if (!mvtkTicket)
                    throw new Error(req.__('common.error.access'));
                result.push({
                    section: ticket.section,
                    seat_code: ticket.seat_code,
                    ticket_code: mvtkTicket.ticket.ticket_code,
                    ticket_name: (ticket.glasses)
                        ? mvtkTicket.ticket.ticket_name + req.__('common.glasses')
                        : mvtkTicket.ticket.ticket_name,
                    ticket_name_eng: mvtkTicket.ticket.ticket_name_eng,
                    ticket_name_kana: mvtkTicket.ticket.ticket_name_kana,
                    std_price: 0,
                    add_price: mvtkTicket.ticket.add_price,
                    dis_price: 0,
                    sale_price: (ticket.glasses)
                        ? (mvtkTicket.ticket.add_price + mvtkTicket.ticket.add_price_glasses)
                        : mvtkTicket.ticket.add_price,
                    add_price_glasses: mvtkTicket.ticket.add_price_glasses,
                    glasses: ticket.glasses,
                    mvtk_num: mvtkTicket.code // ムビチケ購入番号
                });
            }
            else {
                // 通常券種
                const salesTicket = salesTickets.find((value) => {
                    return (value.ticket_code === ticket.ticket_code);
                });
                if (!salesTicket)
                    throw new Error(req.__('common.error.access'));
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
                    mvtk_num: ticket.mvtk_num // ムビチケ購入番号
                });
            }
        }
        return result;
    });
}
/**
 * オーソリ追加
 * @memberOf Purchase.TicketModule
 * @function upDateAuthorization
 * @param {express.Request} req
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {Promise<void>}
 */
function upDateAuthorization(req, purchaseModel) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!purchaseModel.transactionMP)
            throw new Error(req.__('common.error.property'));
        if (!purchaseModel.performance)
            throw new Error(req.__('common.error.property'));
        if (!purchaseModel.reserveSeats)
            throw new Error(req.__('common.error.property'));
        if (!purchaseModel.reserveTickets)
            throw new Error(req.__('common.error.property'));
        if (!purchaseModel.authorizationCOA)
            throw new Error(req.__('common.error.property'));
        if (!purchaseModel.performanceCOA)
            throw new Error(req.__('common.error.property'));
        // COAオーソリ削除
        yield MP.removeCOAAuthorization({
            transactionId: purchaseModel.transactionMP.id,
            coaAuthorizationId: purchaseModel.authorizationCOA.id
        });
        debugLog('MPCOAオーソリ削除');
        if (purchaseModel.transactionGMO
            && purchaseModel.authorizationGMO
            && purchaseModel.orderId) {
            //GMOオーソリあり
            if (!purchaseModel.transactionGMO)
                throw new Error(req.__('common.error.property'));
            if (!purchaseModel.authorizationGMO)
                throw new Error(req.__('common.error.property'));
            if (!purchaseModel.orderId)
                throw new Error(req.__('common.error.property'));
            // todo GMO情報取得API作成中
            let gmoShopId = 'tshop00026096';
            let gmoShopPassword = 'xbxmkaa6';
            if (process.env.NODE_ENV === 'test') {
                gmoShopId = 'tshop00026715';
                gmoShopPassword = 'ybmbptww';
            }
            //GMOオーソリ取消
            yield GMO.CreditService.alterTran({
                shopId: gmoShopId,
                shopPass: gmoShopPassword,
                accessId: purchaseModel.transactionGMO.accessId,
                accessPass: purchaseModel.transactionGMO.accessPass,
                jobCd: GMO.Util.JOB_CD_VOID
            });
            debugLog('GMOオーソリ取消');
            // GMOオーソリ削除
            yield MP.removeGMOAuthorization({
                transactionId: purchaseModel.transactionMP.id,
                gmoAuthorizationId: purchaseModel.authorizationGMO.id
            });
            debugLog('GMOオーソリ削除');
        }
        //COAオーソリ追加
        const coaAuthorizationResult = yield MP.addCOAAuthorization({
            transaction: purchaseModel.transactionMP,
            reserveSeatsTemporarilyResult: purchaseModel.reserveSeats,
            salesTicketResults: purchaseModel.reserveTickets,
            performance: purchaseModel.performance,
            performanceCOA: purchaseModel.performanceCOA,
            price: purchaseModel.getReserveAmount()
        });
        debugLog('MPCOAオーソリ追加', coaAuthorizationResult);
        purchaseModel.authorizationCOA = coaAuthorizationResult;
    });
}
