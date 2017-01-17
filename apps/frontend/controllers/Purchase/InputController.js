"use strict";
const config = require('config');
const PurchaseController_1 = require('./PurchaseController');
const InputForm_1 = require('../../forms/Purchase/InputForm');
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
            this.res.locals['price'] = this.getPrice(this.req.session);
            if (process.env.NODE_ENV === 'dev') {
                this.res.locals['info'] = {
                    last_name_hira: 'はたぐち',
                    first_name_hira: 'あきと',
                    mail_addr: 'hataguchi@motionpicture.jp',
                    mail_confirm: 'hataguchi@motionpicture.jp',
                    tel_num: '09040007648'
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
                    last_name_hira: this.req.body.last_name_hira,
                    first_name_hira: this.req.body.first_name_hira,
                    mail_addr: this.req.body.mail_addr,
                    tel_num: this.req.body.tel_num,
                };
                this.req.session['gmoTokenObject'] = JSON.parse(this.req.body.gmo_token_object);
                this.updateReserve({
                    performance: this.req.session['performance'],
                    reserveSeats: this.req.session['reserveSeats'],
                    purchaseInfo: this.req.session['purchaseInfo'],
                    reserveTickets: this.req.session['reserveTickets']
                }, (result) => {
                    if (!this.router)
                        return this.next(new Error('router is undefined'));
                    if (!this.req.session)
                        return this.next(new Error('session is undefined'));
                    this.req.session['updateReserve'] = result;
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
                this.res.locals['price'] = this.getPrice(this.req.session);
                this.res.render('purchase/enterPurchase');
            }
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EnterPurchaseController;
