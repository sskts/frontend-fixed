"use strict";
const PurchaseController_1 = require('./PurchaseController');
const SeatForm_1 = require('../../forms/Purchase/SeatForm');
class SeatSelectController extends PurchaseController_1.default {
    index() {
        if (this.req.query && this.req.query['id']) {
            this.getPerformance(this.req.query['id'], (performance) => {
                if (!this.req.session)
                    return this.next(new Error('session is undefined'));
                this.res.locals['performance'] = performance;
                this.res.locals['step'] = 0;
                this.res.locals['reserveSeats'] = null;
                if (this.req.session['reserveSeats']
                    && this.req.session['performance']
                    && this.req.session['performance']._id === this.req.query['id']) {
                    this.res.locals['reserveSeats'] = JSON.stringify(this.req.session['reserveSeats']);
                }
                this.req.session['performance'] = performance;
                this.res.render('purchase/seat');
            });
        }
        else {
            return this.next(new Error('不適切なアクセスです'));
        }
    }
    select() {
        SeatForm_1.default(this.req, this.res, () => {
            if (!this.req.session)
                return this.next(new Error('session is undefined'));
            if (this.req.session['reserveSeats']
                && this.req.session['performance']._id === this.req.query['id']) {
                this.deleteTmpReserve({
                    performance: this.req.session['performance'],
                    reserveSeats: this.req.session['reserveSeats']
                }, (result) => {
                    if (!result)
                        return this.next(new Error('仮予約失敗'));
                    if (!this.req.session)
                        return this.next(new Error('session is undefined'));
                    this.reserveSeatsTemporarily({
                        performance: this.req.session['performance'],
                        seats: JSON.parse(this.req.body.seats)
                    }, (result) => {
                        if (!this.router)
                            return this.next(new Error('router is undefined'));
                        if (!this.req.session)
                            return this.next(new Error('session is undefined'));
                        this.req.session['reserveSeats'] = result;
                        this.res.redirect(this.router.build('purchase.ticket', {}));
                    });
                });
            }
            else {
                this.reserveSeatsTemporarily({
                    performance: this.req.session['performance'],
                    seats: JSON.parse(this.req.body.seats)
                }, (result) => {
                    if (!this.router)
                        return this.next(new Error('router is undefined'));
                    if (!this.req.session)
                        return this.next(new Error('session is undefined'));
                    this.req.session['reserveSeats'] = result;
                    this.res.redirect(this.router.build('purchase.ticket', {}));
                });
            }
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SeatSelectController;
