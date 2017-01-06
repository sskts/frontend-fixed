"use strict";
const PurchaseController_1 = require('./PurchaseController');
const SeatForm_1 = require('../../forms/Purchase/SeatForm');
const request = require('request');
const config = require('config');
const COA = require("../../../../lib/coa/coa");
class SeatSelectController extends PurchaseController_1.default {
    index() {
        if (this.req.query && this.req.query['id']) {
            this.getPerformance(this.req.query['id'], (performance) => {
                if (!this.req.session)
                    return this.next(new Error('session is undefined'));
                console.log(performance);
                this.req.session['performance'] = performance;
                this.res.locals['performance'] = performance;
                this.res.locals['step'] = 0;
                this.res.locals['reserveSeats'] = null;
                if (this.req.session['reserveSeats']) {
                    this.res.locals['reserveSeats'] = JSON.stringify(this.req.session['reserveSeats']);
                    console.log(this.res.locals['reserveSeats']);
                }
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
            let seats = JSON.parse(this.req.body.seat_codes);
            if (this.req.session['reserveSeats']) {
            }
            else {
                this.reserveSeatsTemporarily(seats, (result) => {
                    if (!this.req.session)
                        return this.next(new Error('session is undefined'));
                    if (!this.router)
                        return this.next(new Error('router is undefined'));
                    this.req.session['reserveSeats'] = result;
                    this.logger.debug('購入者情報入力完了', this.req.session['reserveSeats']);
                    this.res.redirect(this.router.build('purchase.ticket', {}));
                });
            }
        });
    }
    getPerformance(performancesId, cb) {
        let endpoint = config.get('mp_api_endpoint');
        let method = 'performance';
        let options = {
            url: `${endpoint}/${method}/${performancesId}`,
            method: 'GET',
            json: true,
        };
        request.get(options, (error, response, body) => {
            if (error) {
                return this.next(new Error('サーバーエラー'));
            }
            if (!response || !body.success) {
                return this.next(new Error('サーバーエラー'));
            }
            cb(body.performance);
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
    reserveSeatsTemporarily(seats, cb) {
        if (!this.req.session)
            return this.next(new Error('session is undefined'));
        let performance = this.req.session['performance'];
        let args = {
            theater_code: performance.theater._id,
            date_jouei: performance.day,
            title_code: performance.film.coa_title_code,
            title_branch_num: performance.film.coa_title_branch_num,
            time_begin: performance.time_start,
            screen_code: performance.screen._id,
            list_seat: seats
        };
        COA.reserveSeatsTemporarilyInterface.call(args, (err, result) => {
            if (err)
                return this.next(new Error(err.message));
            cb(result);
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SeatSelectController;
