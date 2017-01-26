"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const BaseController_1 = require("../BaseController");
const LoginForm_1 = require("../../forms/Inquiry/LoginForm");
const COA = require("@motionpicture/coa-service");
const MP = require("../../../../libs/MP");
class InquiryController extends BaseController_1.default {
    login() {
        this.res.locals['theater_code'] = '';
        this.res.locals['reserve_num'] = '';
        this.res.locals['tel_num'] = '';
        if (process.env.NODE_ENV === 'dev') {
            this.res.locals['theater_code'] = '001';
            this.res.locals['reserve_num'] = '5836';
            this.res.locals['tel_num'] = '0849273550';
        }
        this.res.locals['error'] = null;
        return this.res.render('inquiry/login');
    }
    auth() {
        LoginForm_1.default(this.req, this.res, () => {
            if (!this.req.form)
                return this.next(new Error('form is undefined'));
            if (this.req.form.isValid) {
                this.getStateReserve().then(() => {
                    if (!this.router)
                        return this.next(new Error('router is undefined'));
                    return this.res.redirect(this.router.build('inquiry', {}));
                }, (err) => {
                    return this.next(new Error(err.message));
                });
            }
            else {
                this.res.locals['error'] = this.req.form.getErrors();
                return this.res.render('inquiry/login');
            }
        });
    }
    getStateReserve() {
        return __awaiter(this, void 0, void 0, function* () {
            let stateReserve = yield COA.stateReserveInterface.call({
                theater_code: this.req.body.theater_code,
                reserve_num: this.req.body.reserve_num,
                tel_num: this.req.body.tel_num,
            });
            let performanceId = '001201701018513021010';
            let performance = yield MP.getPerformance.call({
                id: performanceId
            });
            if (!this.req.session)
                throw new Error('session is undefined');
            this.req.session['inquiry'] = {
                stateReserve: stateReserve,
                performance: performance,
                reserve_num: this.req.body.reserve_num
            };
        });
    }
    index() {
        if (!this.req.session)
            return this.next(new Error('session is undefined'));
        if (this.req.session['inquiry']
            && this.req.session['inquiry'].stateReserve
            && this.req.session['inquiry'].performance) {
            this.res.locals['stateReserve'] = this.req.session['inquiry'].stateReserve;
            this.res.locals['performance'] = this.req.session['inquiry'].performance.data;
            this.res.locals['reserve_num'] = this.req.session['inquiry'].reserve_num;
            return this.res.render('inquiry/confirm');
        }
        else {
            if (!this.router)
                return this.next(new Error('router is undefined'));
            return this.res.redirect(this.router.build('inquiry.login', {}));
        }
    }
    print() {
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InquiryController;
