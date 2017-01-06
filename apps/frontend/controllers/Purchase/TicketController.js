"use strict";
const PurchaseController_1 = require('./PurchaseController');
const TicketForm_1 = require('../../forms/Purchase/TicketForm');
class TicketTypeSelectController extends PurchaseController_1.default {
    index() {
        if (!this.req.session)
            return this.next(new Error('session is undefined'));
        if (this.req.session['performance']
            && this.req.session['purchaseSeats']) {
            console.log(this.req.session['purchaseSeats']);
            this.res.locals['tickets'] = [
                {
                    ticket_code: 'チケットコード',
                    ticket_name: 'チケット名',
                    ticket_name_kana: 'チケット名（カナ）',
                    ticket_name_eng: 'チケット名（英）',
                    std_price: 1000,
                    add_price: 1000,
                    sale_price: 1000,
                    limit_count: 1000,
                    limit_unit: '1',
                    ticket_note: 'チケット備考(注意事項等)',
                },
                {
                    ticket_code: 'チケットコード',
                    ticket_name: 'チケット名',
                    ticket_name_kana: 'チケット名（カナ）',
                    ticket_name_eng: 'チケット名（英）',
                    std_price: 1000,
                    add_price: 1000,
                    sale_price: 1000,
                    limit_count: 1000,
                    limit_unit: '1',
                    ticket_note: 'チケット備考(注意事項等)',
                }
            ];
            this.res.locals['performance'] = this.req.session['performance'];
            this.res.locals['seats'] = this.req.session['purchaseSeats'];
            this.res.locals['step'] = 1;
            this.res.render('purchase/ticket');
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
            let seats = JSON.parse(this.req.body.seat_codes);
            this.req.session['purchaseSeats'] = seats;
            this.logger.debug('購入者情報入力完了', this.req.session['purchaseSeats']);
            if (this.req.body['mvtk']) {
                this.res.redirect(this.router.build('purchase.mvtk', {}));
            }
            else {
                this.res.redirect(this.router.build('purchase.input', {}));
            }
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TicketTypeSelectController;
