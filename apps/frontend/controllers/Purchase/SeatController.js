"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const PurchaseController_1 = require('./PurchaseController');
const SeatForm_1 = require('../../forms/Purchase/SeatForm');
const COA = require("@motionpicture/coa-service");
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
            this.reserve().then((result) => {
                if (!this.router)
                    return this.next(new Error('router is undefined'));
                if (!this.req.session)
                    return this.next(new Error('session is undefined'));
                this.req.session['reserveSeats'] = result;
                this.res.redirect(this.router.build('purchase.ticket', {}));
            }, (err) => {
                return this.next(new Error(err.message));
            });
        });
    }
    reserve() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.req.session)
                return this.next(new Error('session is undefined'));
            if (this.req.session['reserveSeats']
                && this.req.session['performance']._id === this.req.query['id']) {
                let performance = this.req.session['performance'];
                let reserveSeats = this.req.session['reserveSeats'];
                yield COA.deleteTmpReserveInterface.call({
                    theater_code: performance.theater._id,
                    date_jouei: performance.day,
                    title_code: performance.film.coa_title_code,
                    title_branch_num: performance.film.coa_title_branch_num,
                    time_begin: performance.time_start,
                    tmp_reserve_num: reserveSeats.tmp_reserve_num,
                });
                this.logger.debug('仮予約削除');
            }
            let performance = this.req.session['performance'];
            let seats = JSON.parse(this.req.body.seats);
            let reserveSeatsTemporarilyResult = yield COA.reserveSeatsTemporarilyInterface.call({
                theater_code: performance.theater._id,
                date_jouei: performance.day,
                title_code: performance.film.coa_title_code,
                title_branch_num: performance.film.coa_title_branch_num,
                time_begin: performance.time_start,
                screen_code: performance.screen.coa_screen_code,
                list_seat: seats,
            });
            this.logger.debug('仮予約', reserveSeatsTemporarilyResult);
            return reserveSeatsTemporarilyResult;
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SeatSelectController;
