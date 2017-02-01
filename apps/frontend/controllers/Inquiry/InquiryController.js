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
const InquirySession = require("../../models/Inquiry/InquiryModel");
const LoginForm_1 = require("../../forms/Inquiry/LoginForm");
const COA = require("@motionpicture/coa-service");
const MP = require("../../../../libs/MP");
class InquiryController extends BaseController_1.default {
    constructor(req, res, next) {
        super(req, res, next);
        this.init();
    }
    init() {
        if (!this.req.session)
            return this.next(new Error('session is undefined'));
        this.inquiryModel = new InquirySession.InquiryModel(this.req.session['inquiry']);
    }
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
                    return this.res.redirect(this.router.build('inquiry', {
                        theaterId: this.req.body.theater_code,
                        updateReserveId: this.req.body.reserve_num
                    }));
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
            this.inquiryModel.login = this.req.body;
            this.inquiryModel.stateReserve = yield COA.stateReserveInterface.call({
                theater_code: this.req.body.theater_code,
                reserve_num: this.req.body.reserve_num,
                tel_num: this.req.body.tel_num,
            });
            this.logger.debug('COA照会情報取得');
            let performanceId = '001201701018513021010';
            this.inquiryModel.performance = yield MP.getPerformance.call({
                id: performanceId
            });
            this.logger.debug('MPパフォーマンス取得');
            if (!this.req.session)
                throw new Error('session is undefined');
            this.req.session['inquiry'] = this.inquiryModel.formatToSession();
        });
    }
    index() {
        if (this.inquiryModel.stateReserve
            && this.inquiryModel.performance
            && this.inquiryModel.login) {
            this.res.locals['stateReserve'] = this.inquiryModel.stateReserve;
            this.res.locals['performance'] = this.inquiryModel.performance;
            this.res.locals['login'] = this.inquiryModel.login;
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
