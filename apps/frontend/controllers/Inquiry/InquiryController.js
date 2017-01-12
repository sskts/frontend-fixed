"use strict";
const BaseController_1 = require('../BaseController');
const LoginForm_1 = require('../../forms/Inquiry/LoginForm');
const COA = require("@motionpicture/coa-service");
class InquiryController extends BaseController_1.default {
    login() {
        this.res.locals['error'] = null;
        this.res.render('inquiry/login');
    }
    auth() {
        LoginForm_1.default(this.req, this.res, () => {
            if (!this.req.form)
                return this.next(new Error('form is undefined'));
            if (this.req.form.isValid) {
                this.stateReserve(() => {
                    if (!this.router)
                        return this.next(new Error('router is undefined'));
                    this.res.redirect(this.router.build('inquiry', {}));
                });
            }
            else {
                this.res.locals['error'] = this.req.form.getErrors();
                this.res.render('inquiry/login');
                this.res.render('purchase/enterPurchase');
            }
        });
    }
    stateReserve(cb) {
        let args = {
            theater_code: this.req.body.theater_code,
            reserve_num: this.req.body.reserve_num,
            tel_num: this.req.body.tel_num,
        };
        COA.stateReserveInterface.call(args, (err, result) => {
            if (err)
                return this.next(new Error(err.message));
            if (!result)
                return this.next(new Error('result is null'));
            if (!this.req.session)
                return this.next(new Error('session is undefined'));
            this.req.session['inquiry'] = result;
            this.req.session['performance'] = {
                _id: '001201701128513021010',
                screen: {
                    _id: '0012',
                    name: { ja: 'シネマ２', en: 'Cinema2' },
                    coa_screen_code: '2'
                },
                theater: {
                    _id: '001',
                    name: { ja: 'コア・シネマ', en: 'CoaCimema' }
                },
                film: {
                    _id: '00185130',
                    name: { ja: '君の名は。', en: '' },
                    minutes: 107,
                    coa_title_code: '8513',
                    coa_title_branch_num: '0'
                },
                day: '20170112',
                time_start: '1010',
                time_end: '1205'
            };
            cb();
        });
    }
    index() {
        if (!this.req.session)
            return this.next(new Error('session is undefined'));
        if (this.req.session['inquiry']) {
            this.res.locals['inquiry'] = this.req.session['inquiry'];
            this.res.locals['performance'] = this.req.session['performance'];
            this.res.render('inquiry/confirm');
        }
        else {
            if (!this.router)
                return this.next(new Error('router is undefined'));
            this.res.redirect(this.router.build('inquiry.login', {}));
        }
    }
    print() {
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InquiryController;
