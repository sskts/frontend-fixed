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
const COA = require("@motionpicture/coa-service");
class ConfirmController extends PurchaseController_1.default {
    index() {
        if (!this.req.session)
            return this.next(new Error('session is undefined'));
        if (this.req.session['purchaseInfo']
            && this.req.session['performance']
            && this.req.session['reserveSeats']
            && this.req.session['reserveTickets']) {
            this.res.locals['gmoTokenObject'] = (this.req.session['gmoTokenObject']) ? this.req.session['gmoTokenObject'] : null;
            this.res.locals['info'] = this.req.session['purchaseInfo'];
            this.res.locals['performance'] = this.req.session['performance'];
            this.res.locals['reserveSeats'] = this.req.session['reserveSeats'];
            this.res.locals['reserveTickets'] = this.req.session['reserveTickets'];
            this.res.locals['step'] = 3;
            this.res.locals['price'] = this.getPrice({
                reserveTickets: this.req.session['reserveTickets'],
                reserveSeats: this.req.session['reserveSeats']
            });
            this.res.render('purchase/confirm');
        }
        else {
            return this.next(new Error('無効なアクセスです'));
        }
    }
    updateReserve() {
        if (!this.req.session)
            throw new Error('session is undefined');
        let performance = this.req.session['performance'];
        let reserveSeats = this.req.session['reserveSeats'];
        let purchaseInfo = this.req.session['purchaseInfo'];
        let reserveTickets = this.req.session['reserveTickets'];
        let tickets = [];
        for (let seat of reserveSeats.list_tmp_reserve) {
            let ticket = reserveTickets[seat['seat_num']];
            tickets.push({
                ticket_code: ticket.ticket_code,
                std_price: ticket.std_price,
                add_price: ticket.add_price,
                dis_price: ticket.dis_price || 0,
                sale_price: ticket.sale_price,
                ticket_count: ticket.limit_count,
                seat_num: seat['seat_num'],
            });
        }
        let amount = this.getPrice({
            reserveSeats: reserveSeats,
            reserveTickets: reserveTickets
        });
        let updateReserve = COA.updateReserveInterface.call({
            theater_code: performance.theater._id,
            date_jouei: performance.day,
            title_code: performance.film.coa_title_code,
            title_branch_num: performance.film.coa_title_branch_num,
            time_begin: performance.time_start,
            tmp_reserve_num: reserveSeats.tmp_reserve_num,
            reserve_name: purchaseInfo.last_name_kanji + purchaseInfo.first_name_kanji,
            reserve_name_jkana: purchaseInfo.last_name_hira + purchaseInfo.first_name_hira,
            tel_num: purchaseInfo.tel_num,
            mail_addr: purchaseInfo.mail_addr,
            reserve_amount: amount,
            list_ticket: tickets,
        });
        this.logger.debug('本予約完了', updateReserve);
        return updateReserve;
    }
    purchase() {
        return __awaiter(this, void 0, void 0, function* () {
            this.updateReserve().then((result) => {
                if (!this.req.session)
                    return this.next(new Error('session is undefined'));
                this.req.session['updateReserve'] = result;
                this.deleteSession();
                this.logger.debug('照会情報取得');
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
