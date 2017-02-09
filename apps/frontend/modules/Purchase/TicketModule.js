"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const TicketForm_1 = require("../../forms/Purchase/TicketForm");
const PurchaseSession = require("../../models/Purchase/PurchaseModel");
const config = require("config");
const COA = require("@motionpicture/coa-service");
const GMO = require("@motionpicture/gmo-service");
const MP = require("../../../../libs/MP");
var TicketModule;
(function (TicketModule) {
    function index(req, res, next) {
        if (!req.session)
            return next(req.__('common.error.property'));
        let purchaseModel = new PurchaseSession.PurchaseModel(req.session['purchase']);
        if (!purchaseModel.accessAuth(PurchaseSession.PurchaseModel.TICKET_STATE))
            return next(new Error(req.__('common.error.access')));
        if (!purchaseModel.performance)
            return next(new Error(req.__('common.error.property')));
        let performance = purchaseModel.performance;
        COA.salesTicketInterface.call({
            theater_code: performance.attributes.theater._id,
            date_jouei: performance.attributes.day,
            title_code: performance.attributes.film.coa_title_code,
            title_branch_num: performance.attributes.film.coa_title_branch_num,
            time_begin: performance.attributes.time_start,
        }).then((result) => {
            if (!purchaseModel.transactionMP)
                return next(new Error(req.__('common.error.property')));
            res.locals['tickets'] = result.list_ticket;
            res.locals['performance'] = performance;
            res.locals['reserveSeats'] = purchaseModel.reserveSeats;
            res.locals['reserveTickets'] = purchaseModel.reserveTickets;
            res.locals['step'] = PurchaseSession.PurchaseModel.TICKET_STATE;
            res.locals['transactionId'] = purchaseModel.transactionMP._id;
            if (!req.session)
                return next(req.__('common.error.property'));
            req.session['purchase'] = purchaseModel.formatToSession();
            return res.render('purchase/ticket');
        }, (err) => {
            return next(new Error(err.message));
        });
    }
    TicketModule.index = index;
    function select(req, res, next) {
        if (!req.session)
            return next(req.__('common.error.property'));
        let purchaseModel = new PurchaseSession.PurchaseModel(req.session['purchase']);
        if (!purchaseModel.transactionMP)
            return next(new Error(req.__('common.error.property')));
        if (req.body.transaction_id !== purchaseModel.transactionMP._id)
            return next(new Error(req.__('common.error.access')));
        let form = TicketForm_1.default(req);
        form(req, res, () => {
            purchaseModel.reserveTickets = JSON.parse(req.body.reserve_tickets);
            ticketValidation(req, purchaseModel).then(() => {
                console.log('券種決定完了');
                if (req.body['mvtk']) {
                    if (!req.session)
                        return next(req.__('common.error.property'));
                    req.session['purchase'] = purchaseModel.formatToSession();
                    return res.redirect('/purchase/mvtk');
                }
                else {
                    upDateAuthorization(req, purchaseModel).then(() => {
                        if (!req.session)
                            return next(req.__('common.error.property'));
                        req.session['purchase'] = purchaseModel.formatToSession();
                        return res.redirect('/purchase/input');
                    }, (err) => {
                        return next(new Error(err.message));
                    });
                }
            }, (err) => {
                return next(new Error(err.message));
            });
        });
    }
    TicketModule.select = select;
    function ticketValidation(req, purchaseModel) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!purchaseModel.performance)
                throw new Error(req.__('common.error.property'));
            if (!purchaseModel.reserveTickets)
                throw new Error(req.__('common.error.property'));
            let performance = purchaseModel.performance;
            let salesTickets = yield COA.salesTicketInterface.call({
                theater_code: performance.attributes.theater._id,
                date_jouei: performance.attributes.day,
                title_code: performance.attributes.film.coa_title_code,
                title_branch_num: performance.attributes.film.coa_title_branch_num,
                time_begin: performance.attributes.time_start,
            });
            let reserveTickets = purchaseModel.reserveTickets;
            for (let reserveTicket of reserveTickets) {
                for (let salesTicket of salesTickets.list_ticket) {
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
            yield MP.removeCOAAuthorization.call({
                transactionId: purchaseModel.transactionMP._id,
                coaAuthorizationId: purchaseModel.authorizationCOA._id
            });
            console.log('MPCOAオーソリ削除');
            if (purchaseModel.transactionGMO
                && purchaseModel.authorizationGMO
                && purchaseModel.orderId) {
                if (!purchaseModel.transactionGMO)
                    throw new Error(req.__('common.error.property'));
                if (!purchaseModel.authorizationGMO)
                    throw new Error(req.__('common.error.property'));
                if (!purchaseModel.orderId)
                    throw new Error(req.__('common.error.property'));
                yield GMO.CreditService.alterTranInterface.call({
                    shop_id: config.get('gmo_shop_id'),
                    shop_pass: config.get('gmo_shop_password'),
                    access_id: purchaseModel.transactionGMO.access_id,
                    access_pass: purchaseModel.transactionGMO.access_pass,
                    job_cd: GMO.Util.JOB_CD_VOID
                });
                console.log('GMOオーソリ取消');
                yield MP.removeGMOAuthorization.call({
                    transactionId: purchaseModel.transactionMP._id,
                    gmoAuthorizationId: purchaseModel.authorizationGMO._id,
                });
                console.log('GMOオーソリ削除');
            }
            let COAAuthorizationResult = yield MP.addCOAAuthorization.call({
                transaction: purchaseModel.transactionMP,
                reserveSeatsTemporarilyResult: purchaseModel.reserveSeats,
                salesTicketResults: purchaseModel.reserveTickets,
                performance: purchaseModel.performance,
                totalPrice: purchaseModel.getReserveAmount()
            });
            console.log('MPCOAオーソリ追加', COAAuthorizationResult);
            purchaseModel.authorizationCOA = COAAuthorizationResult;
        });
    }
})(TicketModule || (TicketModule = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TicketModule;
