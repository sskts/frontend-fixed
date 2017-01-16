"use strict";
const PurchaseController_1 = require('./PurchaseController');
const TicketForm_1 = require('../../forms/Purchase/TicketForm');
const COA = require("@motionpicture/coa-service");
class TicketTypeSelectController extends PurchaseController_1.default {
    index() {
        if (!this.req.session)
            return this.next(new Error('session is undefined'));
        if (this.req.session['performance']
            && this.req.session['reserveSeats']) {
            this.getSalesTicket((result) => {
                if (!this.req.session)
                    return this.next(new Error('session is undefined'));
                this.res.locals['tickets'] = result.list_ticket;
                this.res.locals['performance'] = this.req.session['performance'];
                this.res.locals['reserveSeats'] = this.req.session['reserveSeats'];
                this.res.locals['reserveTickets'] = (this.req.session['reserveTickets']) ? this.req.session['reserveTickets'] : null;
                this.res.locals['step'] = 1;
                this.res.render('purchase/ticket');
            });
        }
        else {
            return this.next(new Error('無効なアクセスです'));
        }
    }
    select() {
        TicketForm_1.default(this.req, this.res, () => {
            if (!this.req.session)
                return this.next(new Error('session is undefined'));
            if (!this.router)
                return this.next(new Error('router is undefined'));
            this.req.session['reserveTickets'] = JSON.parse(this.req.body.reserve_tickets);
            this.logger.debug('券種決定完了', this.req.session['reserveTickets']);
            if (this.req.body['mvtk']) {
                this.res.redirect(this.router.build('purchase.mvtk', {}));
            }
            else {
                this.res.redirect(this.router.build('purchase.input', {}));
            }
        });
    }
    getSalesTicket(cb) {
        if (!this.req.session)
            return this.next(new Error('session is undefined'));
        let performance = this.req.session['performance'];
        let args = {
            theater_code: performance.theater._id,
            date_jouei: performance.day,
            title_code: performance.film.coa_title_code,
            title_branch_num: performance.film.coa_title_branch_num,
            time_begin: performance.time_start,
        };
        COA.salesTicketInterface.call(args, (err, result) => {
            if (err)
                return this.next(new Error(err.message));
            cb(result);
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TicketTypeSelectController;
