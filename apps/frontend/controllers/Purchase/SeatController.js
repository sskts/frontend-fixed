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
const SeatForm_1 = require("../../forms/Purchase/SeatForm");
const PurchaseSession = require("../../models/Purchase/PurchaseModel");
const COA = require("@motionpicture/coa-service");
const MP = require("../../../../libs/MP");
class SeatSelectController extends PurchaseController_1.default {
    index() {
        if (!this.req.query || !this.req.query['id'])
            return this.next(new Error('不適切なアクセスです'));
        MP.getPerformance.call({
            id: this.req.query['id']
        }).then((result) => {
            this.res.locals['performance'] = result.data;
            this.res.locals['step'] = PurchaseSession.PurchaseModel.SEAT_STATE;
            this.res.locals['reserveSeats'] = null;
            if (this.purchaseModel.reserveSeats
                && this.purchaseModel.performance
                && this.purchaseModel.performance._id === this.req.query['id']) {
                this.logger.debug('仮予約中');
                this.res.locals['reserveSeats'] = JSON.stringify(this.purchaseModel.reserveSeats);
            }
            this.purchaseModel.performance = result.data;
            if (!this.req.session)
                return this.next(new Error('session is undefined'));
            this.req.session['purchase'] = this.purchaseModel.formatToSession();
            this.res.render('purchase/seat');
        }, (err) => {
            return this.next(new Error(err.message));
        });
    }
    select() {
        SeatForm_1.default(this.req, this.res, () => {
            this.reserve().then((result) => {
                if (!result)
                    return this.next(new Error('result is null'));
                if (!this.router)
                    return this.next(new Error('router is undefined'));
                this.purchaseModel.reserveSeats = result;
                if (!this.req.session)
                    return this.next(new Error('session is undefined'));
                this.req.session['purchase'] = this.purchaseModel.formatToSession();
                this.res.redirect(this.router.build('purchase.ticket', {}));
            }, (err) => {
                return this.next(new Error(err.message));
            });
        });
    }
    reserve() {
        return __awaiter(this, void 0, void 0, function* () {
            let performance = this.purchaseModel.performance;
            if (!performance)
                return this.next(new Error('performance is undefined'));
            if (this.purchaseModel.reserveSeats
                && this.purchaseModel.performance
                && this.purchaseModel.performance._id === this.req.query['id']) {
                let reserveSeats = this.purchaseModel.reserveSeats;
                yield COA.deleteTmpReserveInterface.call({
                    theater_code: performance.attributes.theater._id,
                    date_jouei: performance.attributes.day,
                    title_code: performance.attributes.film.coa_title_code,
                    title_branch_num: performance.attributes.film.coa_title_branch_num,
                    time_begin: performance.attributes.time_start,
                    tmp_reserve_num: String(reserveSeats.tmp_reserve_num),
                });
                this.logger.debug('仮予約削除');
            }
            let seats = JSON.parse(this.req.body.seats);
            let reserveSeatsTemporarilyResult = yield COA.reserveSeatsTemporarilyInterface.call({
                theater_code: performance.attributes.theater._id,
                date_jouei: performance.attributes.day,
                title_code: performance.attributes.film.coa_title_code,
                title_branch_num: performance.attributes.film.coa_title_branch_num,
                time_begin: performance.attributes.time_start,
                screen_code: performance.attributes.screen.coa_screen_code,
                list_seat: seats,
            });
            this.logger.debug('仮予約', reserveSeatsTemporarilyResult);
            return reserveSeatsTemporarilyResult;
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SeatSelectController;
