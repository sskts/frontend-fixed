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
const COA = require("@motionpicture/coa-service");
const GMO = require("@motionpicture/gmo-service");
const MP = require("../../../../libs/MP");
const TicketForm_1 = require("../../forms/Purchase/TicketForm");
const PurchaseSession = require("../../models/Purchase/PurchaseModel");
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
    const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
    if (!purchaseModel.accessAuth(PurchaseSession.PurchaseModel.TICKET_STATE))
        return next(new Error(req.__('common.error.access')));
    if (!purchaseModel.performance)
        return next(new Error(req.__('common.error.property')));
    //コアAPI券種取得
    const performance = purchaseModel.performance;
    COA.ReserveService.salesTicket({
        theater_code: performance.attributes.theater.id,
        date_jouei: performance.attributes.day,
        title_code: performance.attributes.film.coa_title_code,
        title_branch_num: performance.attributes.film.coa_title_branch_num,
        time_begin: performance.attributes.time_start
    }).then((result) => {
        if (!purchaseModel.transactionMP)
            return next(new Error(req.__('common.error.property')));
        res.locals.tickets = result;
        res.locals.performance = performance;
        res.locals.reserveSeats = purchaseModel.reserveSeats;
        res.locals.reserveTickets = purchaseModel.reserveTickets;
        res.locals.step = PurchaseSession.PurchaseModel.TICKET_STATE;
        res.locals.transactionId = purchaseModel.transactionMP.id;
        //セッション更新
        if (!req.session)
            return next(new Error(req.__('common.error.property')));
        req.session.purchase = purchaseModel.formatToSession();
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
    const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
    if (!purchaseModel.transactionMP)
        return next(new Error(req.__('common.error.property')));
    //取引id確認
    if (req.body.transaction_id !== purchaseModel.transactionMP.id)
        return next(new Error(req.__('common.error.access')));
    //バリデーション
    const form = TicketForm_1.default(req);
    form(req, res, () => {
        //座席情報をセッションへ
        purchaseModel.reserveTickets = JSON.parse(req.body.reserve_tickets);
        ticketValidation(req, purchaseModel).then(() => {
            upDateAuthorization(req, purchaseModel).then(() => {
                if (!req.session)
                    return next(new Error(req.__('common.error.property')));
                //セッション更新
                req.session.purchase = purchaseModel.formatToSession();
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
 * 券種検証
 * @memberOf Purchase.TicketModule
 * @function ticketValidation
 * @param {express.Request} req
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {Promise<void>}
 */
function ticketValidation(req, purchaseModel) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!purchaseModel.performance)
            throw new Error(req.__('common.error.property'));
        if (!purchaseModel.reserveTickets)
            throw new Error(req.__('common.error.property'));
        //コアAPI券種取得
        const performance = purchaseModel.performance;
        const salesTickets = yield COA.ReserveService.salesTicket({
            theater_code: performance.attributes.theater.id,
            date_jouei: performance.attributes.day,
            title_code: performance.attributes.film.coa_title_code,
            title_branch_num: performance.attributes.film.coa_title_branch_num,
            time_begin: performance.attributes.time_start
        });
        const reserveTickets = purchaseModel.reserveTickets;
        for (const reserveTicket of reserveTickets) {
            for (const salesTicket of salesTickets) {
                if (salesTicket.ticket_code === reserveTicket.ticket_code) {
                    if (salesTicket.sale_price !== reserveTicket.sale_price) {
                        console.log(`${reserveTicket.seat_code}: 券種検証NG`);
                        throw new Error(req.__('common.error.access'));
                    }
                    console.log(`${reserveTicket.seat_code}: 券種検証OK`);
                    break;
                }
            }
        }
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
        // COAオーソリ削除
        yield MP.removeCOAAuthorization({
            transactionId: purchaseModel.transactionMP.id,
            coaAuthorizationId: purchaseModel.authorizationCOA.id
        });
        console.log('MPCOAオーソリ削除');
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
            //GMOオーソリ取消
            yield GMO.CreditService.alterTran({
                shopId: process.env.GMO_SHOP_ID,
                shopPass: process.env.GMO_SHOP_PASSWORD,
                accessId: purchaseModel.transactionGMO.accessId,
                accessPass: purchaseModel.transactionGMO.accessPass,
                jobCd: GMO.Util.JOB_CD_VOID
            });
            console.log('GMOオーソリ取消');
            // GMOオーソリ削除
            yield MP.removeGMOAuthorization({
                transactionId: purchaseModel.transactionMP.id,
                gmoAuthorizationId: purchaseModel.authorizationGMO.id
            });
            console.log('GMOオーソリ削除');
        }
        //COAオーソリ追加
        const coaAuthorizationResult = yield MP.addCOAAuthorization({
            transaction: purchaseModel.transactionMP,
            reserveSeatsTemporarilyResult: purchaseModel.reserveSeats,
            salesTicketResults: purchaseModel.reserveTickets,
            performance: purchaseModel.performance,
            totalPrice: purchaseModel.getReserveAmount()
        });
        console.log('MPCOAオーソリ追加', coaAuthorizationResult);
        purchaseModel.authorizationCOA = coaAuthorizationResult;
    });
}
