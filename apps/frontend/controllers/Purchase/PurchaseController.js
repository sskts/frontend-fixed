"use strict";
const BaseController_1 = require('../BaseController');
const COA = require("@motionpicture/coa-service");
class PurchaseController extends BaseController_1.default {
    deleteSession() {
        if (!this.req.session)
            return;
        delete this.req.session['purchaseInfo'];
        delete this.req.session['reserveSeats'];
        delete this.req.session['reserveTickets'];
        delete this.req.session['updateReserve'];
        delete this.req.session['gmoTokenObject'];
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
    deleteTmpReserve(args, cb) {
        if (!this.req.session)
            return this.next(new Error('session is undefined'));
        let performance = args.performance;
        let reserveSeats = args.reserveSeats;
        COA.deleteTmpReserveInterface.call({
            theater_code: performance.theater._id,
            date_jouei: performance.day,
            title_code: performance.film.coa_title_code,
            title_branch_num: performance.film.coa_title_branch_num,
            time_begin: performance.time_start,
            tmp_reserve_num: reserveSeats.tmp_reserve_num,
        }, (err, result) => {
            if (err)
                return this.next(new Error(err.message));
            this.logger.debug('仮予約削除', result);
            cb(result);
        });
    }
    reserveSeatsTemporarily(args, cb) {
        if (!this.req.session)
            return this.next(new Error('session is undefined'));
        let performance = args.performance;
        let seats = args.seats;
        COA.reserveSeatsTemporarilyInterface.call({
            theater_code: performance.theater._id,
            date_jouei: performance.day,
            title_code: performance.film.coa_title_code,
            title_branch_num: performance.film.coa_title_branch_num,
            time_begin: performance.time_start,
            screen_code: performance.screen.coa_screen_code,
            list_seat: seats,
        }, (err, result) => {
            if (err)
                return this.next(new Error(err.message));
            this.logger.debug('仮予約完了', result);
            cb(result);
        });
    }
    getSalesTicket(args, cb) {
        if (!this.req.session)
            return this.next(new Error('session is undefined'));
        let performance = args.performance;
        COA.salesTicketInterface.call({
            theater_code: performance.theater._id,
            date_jouei: performance.day,
            title_code: performance.film.coa_title_code,
            title_branch_num: performance.film.coa_title_branch_num,
            time_begin: performance.time_start,
        }, (err, result) => {
            if (err)
                return this.next(new Error(err.message));
            cb(result);
        });
    }
    updateReserve(args, cb) {
        if (!this.req.session)
            return this.next(new Error('session is undefined'));
        let performance = args.performance;
        let reserveSeats = args.reserveSeats;
        let purchaseInfo = args.purchaseInfo;
        let reserveTickets = args.reserveTickets;
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
        COA.updateReserveInterface.call({
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
        }, (err, result) => {
            if (err)
                return this.next(new Error(err.message));
            if (!this.req.session)
                return this.next(new Error('session is undefined'));
            this.logger.debug('本予約完了', result);
            cb(result);
        });
    }
    getPrice(args) {
        let reserveSeats = args.reserveSeats;
        let reserveTickets = args.reserveTickets;
        let price = 0;
        for (let seat of reserveSeats.list_tmp_reserve) {
            let ticket = reserveTickets[seat['seat_num']];
            price += ticket.sale_price;
        }
        return price;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PurchaseController;
