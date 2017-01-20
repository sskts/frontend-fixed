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
const PurchaseSession = require("../../models/Purchase/PurchaseModel");
const COA = require("@motionpicture/coa-service");
class ConfirmController extends PurchaseController_1.default {
    index() {
        this.purchaseModel.checkAccess(PurchaseSession.PurchaseModel.CONFIRM_STATE, this.next);
        this.res.locals['gmoTokenObject'] = (this.purchaseModel.gmo) ? this.purchaseModel.gmo : null;
        this.res.locals['info'] = this.purchaseModel.input;
        this.res.locals['performance'] = this.purchaseModel.performance;
        this.res.locals['reserveSeats'] = this.purchaseModel.reserveSeats;
        this.res.locals['reserveTickets'] = this.purchaseModel.reserveTickets;
        this.res.locals['step'] = PurchaseSession.PurchaseModel.CONFIRM_STATE;
        this.res.locals['price'] = this.purchaseModel.getReserveAmount();
        if (!this.req.session)
            return this.next(new Error('session is undefined'));
        this.purchaseModel.upDate(this.req.session['purchase']);
        this.res.render('purchase/confirm');
    }
    updateReserve() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.purchaseModel.performance)
                throw new Error('purchaseModel.performance is undefined');
            if (!this.purchaseModel.reserveSeats)
                throw new Error('purchaseModel.reserveSeats is undefined');
            if (!this.purchaseModel.input)
                throw new Error('purchaseModel.input is undefined');
            let performance = this.purchaseModel.performance;
            let reserveSeats = this.purchaseModel.reserveSeats;
            let input = this.purchaseModel.input;
            let amount = this.purchaseModel.getReserveAmount();
            let updateReserve = COA.updateReserveInterface.call({
                theater_code: performance.attributes.theater._id,
                date_jouei: performance.attributes.day,
                title_code: performance.attributes.film.coa_title_code,
                title_branch_num: performance.attributes.film.coa_title_branch_num,
                time_begin: performance.attributes.time_start,
                tmp_reserve_num: String(reserveSeats.tmp_reserve_num),
                reserve_name: input.last_name_hira + input.first_name_hira,
                reserve_name_jkana: input.last_name_hira + input.first_name_hira,
                tel_num: input.tel_num,
                mail_addr: input.mail_addr,
                reserve_amount: amount,
                list_ticket: this.purchaseModel.getTicketList(),
            });
            this.logger.debug('本予約完了', updateReserve);
            return updateReserve;
        });
    }
    purchase() {
        return __awaiter(this, void 0, void 0, function* () {
            this.updateReserve().then((result) => {
                this.purchaseModel.updateReserve = result;
                if (!this.req.session)
                    return this.next(new Error('session is undefined'));
                this.purchaseModel.upDate(this.req.session['purchase']);
                this.deleteSession();
                this.logger.debug('照会情報取得');
                if (!this.req.session)
                    return this.next(new Error('session is undefined'));
                this.req.session['inquiry'] = {
                    status: 0,
                    message: '',
                    list_reserve_seat: [{ seat_num: 'Ｊ－７' },
                        { seat_num: 'Ｊ－８' },
                        { seat_num: 'Ｊ－９' },
                        { seat_num: 'Ｊ－１０' }],
                    title_branch_num: '0',
                    title_code: '8570',
                    list_ticket: [{
                            ticket_count: 2,
                            ticket_name: '一般',
                            ticket_price: 1800,
                            ticket_code: '10'
                        },
                        {
                            ticket_count: 1,
                            ticket_name: '大･高生',
                            ticket_price: 1500,
                            ticket_code: '30'
                        },
                        {
                            ticket_code: '80',
                            ticket_price: 1000,
                            ticket_count: 1,
                            ticket_name: 'シニア'
                        }],
                    time_begin: '2130',
                    date_jouei: '20161215'
                };
                this.logger.debug('購入確定', result);
                this.res.json({
                    err: null,
                    result: result
                });
            }, (err) => {
                this.res.json({
                    err: err,
                    result: null
                });
            });
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ConfirmController;
