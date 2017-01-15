"use strict";
const PurchaseController_1 = require("./PurchaseController");
const SeatForm_1 = require("../../forms/Purchase/SeatForm");
const COA = require("@motionpicture/coa-service");
class SeatSelectController extends PurchaseController_1.default {
    index() {
        this.deleteSession();
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
                this.deleteTmpReserve(() => {
                    this.reserveSeatsTemporarily(() => {
                        if (!this.router)
                            return this.next(new Error('router is undefined'));
                        this.res.redirect(this.router.build('purchase.ticket', {}));
                    });
                });
            }
            else {
                this.reserveSeatsTemporarily(() => {
                    if (!this.router)
                        return this.next(new Error('router is undefined'));
                    this.res.redirect(this.router.build('purchase.ticket', {}));
                });
            }
        });
    }
    getScreenStateReserve() {
        let args = this.req.body;
        COA.getStateReserveSeatInterface.call(args, (err, result) => {
            this.res.json({
                err: err,
                result: result
            });
        });
    }
    deleteTmpReserve(cb) {
        if (!this.req.session)
            return this.next(new Error('session is undefined'));
        let performance = this.req.session['performance'];
        let reserveSeats = this.req.session['reserveSeats'];
        let args = {
            theater_code: performance.theater._id,
            date_jouei: performance.day,
            title_code: performance.film.coa_title_code,
            title_branch_num: performance.film.coa_title_branch_num,
            time_begin: performance.time_start,
            tmp_reserve_num: reserveSeats.tmp_reserve_num,
        };
        COA.deleteTmpReserveInterface.call(args, (err, result) => {
            if (err)
                return this.next(new Error(err.message));
            if (!result)
                return this.next(new Error('サーバーエラー'));
            this.logger.debug('仮予約削除');
            cb();
        });
    }
    reserveSeatsTemporarily(cb) {
        if (!this.req.session)
            return this.next(new Error('session is undefined'));
        let performance = this.req.session['performance'];
        let args = {
            theater_code: performance.theater._id,
            date_jouei: performance.day,
            title_code: performance.film.coa_title_code,
            title_branch_num: performance.film.coa_title_branch_num,
            time_begin: performance.time_start,
            screen_code: performance.screen.coa_screen_code,
            list_seat: JSON.parse(this.req.body.seats),
        };
        COA.reserveSeatsTemporarilyInterface.call(args, (err, result) => {
            if (err)
                return this.next(new Error(err.message));
            if (!this.req.session)
                return this.next(new Error('session is undefined'));
            this.req.session['reserveSeats'] = result;
            this.logger.debug('仮予約完了', this.req.session['reserveSeats']);
            cb();
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SeatSelectController;
