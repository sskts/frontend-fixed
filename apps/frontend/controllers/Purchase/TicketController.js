"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const PurchaseController_1 = require("./PurchaseController");
const TicketForm_1 = require("../../forms/Purchase/TicketForm");
const PurchaseSession = require("../../models/Purchase/PurchaseModel");
const config = require("config");
const COA = require("@motionpicture/coa-service");
const GMO = require("@motionpicture/gmo-service");
const MP = require("../../../../libs/MP");
class TicketTypeSelectController extends PurchaseController_1.default {
    index() {
        if (!this.purchaseModel.accessAuth(PurchaseSession.PurchaseModel.TICKET_STATE))
            return this.next(new Error(PurchaseController_1.default.ERROR_MESSAGE_ACCESS));
        if (!this.purchaseModel.performance)
            return this.next(new Error('purchaseModel.performance is undefined'));
        let performance = this.purchaseModel.performance;
        COA.salesTicketInterface.call({
            theater_code: performance.attributes.theater._id,
            date_jouei: performance.attributes.day,
            title_code: performance.attributes.film.coa_title_code,
            title_branch_num: performance.attributes.film.coa_title_branch_num,
            time_begin: performance.attributes.time_start,
        }).then((result) => {
            this.logger.debug('券種取得', result);
            this.res.locals['tickets'] = result.list_ticket;
            this.res.locals['performance'] = performance;
            this.res.locals['reserveSeats'] = this.purchaseModel.reserveSeats;
            this.res.locals['reserveTickets'] = this.purchaseModel.reserveTickets;
            this.res.locals['step'] = PurchaseSession.PurchaseModel.TICKET_STATE;
            if (!this.req.session)
                return this.next(new Error('session is undefined'));
            this.req.session['purchase'] = this.purchaseModel.formatToSession();
            return this.res.render('purchase/ticket');
        }, (err) => {
            return this.next(new Error(err.message));
        });
    }
    select() {
        if (!this.transactionAuth())
            return this.next(new Error(PurchaseController_1.default.ERROR_MESSAGE_ACCESS));
        TicketForm_1.default(this.req, this.res, () => {
            this.purchaseModel.reserveTickets = JSON.parse(this.req.body.reserve_tickets);
            this.logger.debug('券種決定完了');
            if (this.req.body['mvtk']) {
                if (!this.router)
                    return this.next(new Error('router is undefined'));
                if (!this.req.session)
                    return this.next(new Error('session is undefined'));
                this.req.session['purchase'] = this.purchaseModel.formatToSession();
                return this.res.redirect(this.router.build('purchase.mvtk', {}));
            }
            else {
                this.upDateAuthorization().then(() => {
                    if (!this.router)
                        return this.next(new Error('router is undefined'));
                    if (!this.req.session)
                        return this.next(new Error('session is undefined'));
                    this.req.session['purchase'] = this.purchaseModel.formatToSession();
                    return this.res.redirect(this.router.build('purchase.input', {}));
                }, (err) => {
                    return this.next(new Error(err.message));
                });
            }
        });
    }
    upDateAuthorization() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.purchaseModel.transactionMP)
                throw new Error('transactionMP is undefined');
            if (!this.purchaseModel.performance)
                throw new Error('performance is undefined');
            if (!this.purchaseModel.reserveSeats)
                throw new Error('reserveSeats is undefined');
            if (!this.purchaseModel.reserveTickets)
                throw new Error('reserveTickets is undefined');
            if (!this.purchaseModel.owner)
                throw new Error('owners is undefined');
            if (!this.purchaseModel.administrator)
                throw new Error('administrator is undefined');
            if (!this.purchaseModel.authorizationCOA)
                throw new Error('authorizationCOA is undefined');
            yield MP.removeCOAAuthorization.call({
                transaction: this.purchaseModel.transactionMP,
                ownerId4administrator: this.purchaseModel.administrator._id,
                reserveSeatsTemporarilyResult: this.purchaseModel.reserveSeats,
                addCOAAuthorizationResult: this.purchaseModel.authorizationCOA
            });
            this.logger.debug('MPCOAオーソリ削除');
            if (this.purchaseModel.transactionGMO
                && this.purchaseModel.authorizationGMO
                && this.purchaseModel.orderId) {
                if (!this.purchaseModel.transactionGMO)
                    throw new Error('transactionGMO is undefined');
                if (!this.purchaseModel.authorizationGMO)
                    throw new Error('authorizationGMO is undefined');
                if (!this.purchaseModel.orderId)
                    throw new Error('orderId is undefined');
                yield GMO.CreditService.alterTranInterface.call({
                    shop_id: config.get('gmo_shop_id'),
                    shop_pass: config.get('gmo_shop_password'),
                    access_id: this.purchaseModel.transactionGMO.access_id,
                    access_pass: this.purchaseModel.transactionGMO.access_pass,
                    job_cd: GMO.Util.JOB_CD_VOID
                });
                this.logger.debug('GMOオーソリ取消');
                yield MP.removeGMOAuthorization.call({
                    transaction: this.purchaseModel.transactionMP,
                    addGMOAuthorizationResult: this.purchaseModel.authorizationGMO,
                });
                this.logger.debug('GMOオーソリ削除');
            }
            let COAAuthorizationResult = yield MP.addCOAAuthorization.call({
                transaction: this.purchaseModel.transactionMP,
                administratorOwnerId: this.purchaseModel.administrator._id,
                anonymousOwnerId: this.purchaseModel.owner._id,
                reserveSeatsTemporarilyResult: this.purchaseModel.reserveSeats,
                salesTicketResults: this.purchaseModel.reserveTickets,
                performance: this.purchaseModel.performance,
                totalPrice: this.purchaseModel.getReserveAmount()
            });
            this.logger.debug('MPCOAオーソリ追加', COAAuthorizationResult);
            this.purchaseModel.authorizationCOA = COAAuthorizationResult;
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TicketTypeSelectController;
