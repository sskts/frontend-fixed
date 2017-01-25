"use strict";
const PurchaseController_1 = require("./PurchaseController");
const TicketForm_1 = require("../../forms/Purchase/TicketForm");
const PurchaseSession = require("../../models/Purchase/PurchaseModel");
const COA = require("@motionpicture/coa-service");
class TicketTypeSelectController extends PurchaseController_1.default {
    index() {
        console.log('券種選択', PurchaseSession.PurchaseModel.TICKET_STATE, this.purchaseModel);
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
            this.res.render('purchase/ticket');
        }, (err) => {
            return this.next(new Error(err.message));
        });
    }
    select() {
        if (!this.transactionAuth())
            return this.next(new Error(PurchaseController_1.default.ERROR_MESSAGE_ACCESS));
        TicketForm_1.default(this.req, this.res, () => {
            if (!this.router)
                return this.next(new Error('router is undefined'));
            this.purchaseModel.reserveTickets = JSON.parse(this.req.body.reserve_tickets);
            this.logger.debug('券種決定完了', this.purchaseModel.reserveTickets);
            if (!this.req.session)
                return this.next(new Error('session is undefined'));
            this.req.session['purchase'] = this.purchaseModel.formatToSession();
            if (this.req.body['mvtk']) {
                this.res.redirect(this.router.build('purchase.mvtk', {}));
            }
            else {
                this.res.redirect(this.router.build('purchase.input', {}));
            }
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TicketTypeSelectController;
