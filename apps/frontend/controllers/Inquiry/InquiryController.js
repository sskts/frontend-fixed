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
            if (!this.req.session)
                return this.next(new Error('session is undefined'));
            if (!this.req.form)
                return this.next(new Error('form is undefined'));
            if (this.req.form.isValid) {
                this.stateReserve(() => {
                    if (!this.router)
                        return this.next(new Error('router is undefined'));
                    this.res.redirect(this.router.build('inquiry.confirm', {}));
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
            let performanceId = this.getPerformanceId(this.req.body.theater_code, result.date_jouei, result.title_code, result.title_branch_num, '0012', result.time_begin);
            this.getPerformance(performanceId, (performance) => {
                if (!this.req.session)
                    return this.next(new Error('session is undefined'));
                this.req.session['inquiry'] = result;
                this.req.session['performance'] = performance;
                cb();
            });
        });
    }
    index() {
        if (!this.req.session)
            return this.next(new Error('session is undefined'));
        if (this.req.session['inquiry']) {
            this.res.locals['inquiry'] = this.req.session['inquiry'];
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
