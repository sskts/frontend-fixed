"use strict";
const config = require('config');
const PurchaseController_1 = require('./PurchaseController');
const InputForm_1 = require('../../forms/Purchase/InputForm');
class EnterPurchaseController extends PurchaseController_1.default {
    index() {
        if (!this.req.session)
            return this.next(new Error('session is undefined'));
        if (this.req.session['performance']
            && this.req.session['purchaseSeats']) {
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
            if (this.req.form.isValid) {
                if (!this.router)
                    return this.next(new Error('router is undefined'));
                this.req.session['purchaseInfo'] = {
                    last_name_kanji: this.req.body.last_name_kanji,
                    first_name_kanji: this.req.body.first_name_kanji,
                    last_name_hira: this.req.body.last_name_hira,
                    first_name_hira: this.req.body.first_name_hira,
                    mail: this.req.body.mail,
                    tel: this.req.body.tel,
                };
                this.req.session['gmo_token_object'] = JSON.parse(this.req.body.gmo_token_object);
                this.logger.debug('購入者情報入力完了', {
                    info: this.req.session['purchaseInfo'],
                    gmo: this.req.session['gmo_token_object']
                });
                this.res.redirect(this.router.build('purchase.confirm', {}));
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
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EnterPurchaseController;
