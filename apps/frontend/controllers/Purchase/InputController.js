"use strict";
const config = require('config');
const PurchaseController_1 = require('./PurchaseController');
const InputForm_1 = require('../../forms/Purchase/InputForm');
const COA = require("@motionpicture/coa-service");
class EnterPurchaseController extends PurchaseController_1.default {
    index() {
        if (!this.req.session)
            return this.next(new Error('session is undefined'));
        if (this.req.session['performance']
            && this.req.session['reserveSeats']
            && this.req.session['reserveTickets']) {
            this.res.locals['error'] = null;
            this.res.locals['info'] = null;
            this.res.locals['moment'] = require('moment');
            this.res.locals['step'] = 2;
            this.res.locals['gmoModuleUrl'] = config.get('gmo_module_url');
            this.res.locals['gmoShopId'] = config.get('gmo_shop_id');
            if (process.env.NODE_ENV === 'dev') {
                this.res.locals['info'] = {
                    last_name_kanji: '畑口',
                    first_name_kanji: '晃人',
                    last_name_hira: 'はたぐち',
                    first_name_hira: 'あきと',
                    mail: 'hataguchi@motionpicture.jp',
                    mail_confirm: 'hataguchi@motionpicture.jp',
                    tel: '09040007648'
                };
            }
            this.res.render('purchase/input');
        }
        else {
            return this.next(new Error('無効なアクセスです'));
        }
    }
    submit() {
        InputForm_1.default(this.req, this.res, () => {
            if (!this.req.session)
                return this.next(new Error('session is undefined'));
            if (!this.req.form)
                return this.next(new Error('form is undefined'));
            if (this.req.form.isValid) {
                this.req.session['purchaseInfo'] = {
                    last_name_kanji: this.req.body.last_name_kanji,
                    first_name_kanji: this.req.body.first_name_kanji,
                    last_name_hira: this.req.body.last_name_hira,
                    first_name_hira: this.req.body.first_name_hira,
                    mail: this.req.body.mail,
                    tel: this.req.body.tel,
                };
                this.req.session['gmoTokenObject'] = JSON.parse(this.req.body.gmo_token_object);
                this.updateReserve(() => {
                    if (!this.router)
                        return this.next(new Error('router is undefined'));
                    this.res.redirect(this.router.build('purchase.confirm', {}));
                });
            }
            else {
                this.res.locals['error'] = this.req.form.getErrors();
                this.res.locals['info'] = this.req.body;
                this.res.locals['moment'] = require('moment');
                this.res.locals['step'] = 2;
                this.res.locals['gmoModuleUrl'] = config.get('gmo_module_url');
                this.res.locals['gmoShopId'] = config.get('gmo_shop_id');
                this.res.render('purchase/enterPurchase');
            }
        });
    }
    updateReserve(cb) {
        if (!this.req.session)
            return this.next(new Error('session is undefined'));
        let performance = this.req.session['performance'];
        let reserveSeats = this.req.session['reserveSeats'];
        let purchaseInfo = this.req.session['purchaseInfo'];
        let reserveTickets = this.req.session['reserveTickets'];
        let tickets = [];
        let price = 0;
        for (let seat of reserveSeats.list_tmp_reserve) {
            let ticket = reserveTickets[seat['seat_num']];
            tickets.push({
                ticket_code: ticket.ticket_code,
                std_price: ticket.std_price,
                add_price: ticket.add_price,
                dis_price: ticket.dis_price,
                sale_price: ticket.sale_price,
                ticket_count: ticket.ticket_count,
                seat_num: seat['seat_num'],
            });
            price += ticket.sale_price;
        }
        let args = {
            theater_code: performance.theater._id,
            date_jouei: performance.day,
            title_code: performance.film.coa_title_code,
            title_branch_num: performance.film.coa_title_branch_num,
            time_begin: performance.time_start,
            tmp_reserve_num: reserveSeats.tmp_reserve_num,
            reserve_name: purchaseInfo.last_name_kanji + purchaseInfo.first_name_kanji,
            reserve_name_kana: purchaseInfo.last_name_hira + purchaseInfo.first_name_hira,
            tel_num: purchaseInfo.tel,
            mail_addr: purchaseInfo.mail,
            reserve_amount: price,
            list_ticket: tickets,
        };
        COA.updateReserveInterface.call(args, (err, result) => {
            err = null;
            result = {
                reserve_num: '12345678',
                list_qr: [
                    {
                        seat_section: '0',
                        seat_num: 'A-1',
                        seat_qrcode: '',
                    },
                    {
                        seat_section: '0',
                        seat_num: 'A-2',
                        seat_qrcode: '',
                    }
                ]
            };
            if (!this.req.session)
                return this.next(new Error('session is undefined'));
            this.req.session['updateReserve'] = result;
            this.logger.debug('本予約完了', this.req.session['updateReserve']);
            cb();
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EnterPurchaseController;
