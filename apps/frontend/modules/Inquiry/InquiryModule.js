"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const InquirySession = require("../../models/Inquiry/InquiryModel");
const LoginForm_1 = require("../../forms/Inquiry/LoginForm");
const COA = require("@motionpicture/coa-service");
const MP = require("../../../../libs/MP");
const UtilModule_1 = require("../Util/UtilModule");
/**
 * 照会
 * @namespace
 */
var InquiryModule;
(function (InquiryModule) {
    /**
     * 照会認証ページ表示
     * @function
     */
    function login(_req, res) {
        res.locals.theater_code = '';
        res.locals.reserve_num = '';
        res.locals.tel_num = '';
        if (process.env.NODE_ENV === 'dev') {
            res.locals.theater_code = '001';
            res.locals.reserve_num = '11625';
            res.locals.tel_num = '09040007648';
        }
        res.locals.error = null;
        return res.render('inquiry/login');
    }
    InquiryModule.login = login;
    /**
     * 照会認証
     * @function
     */
    function auth(req, res, next) {
        if (!req.session)
            return next(req.__('common.error.property'));
        const inquiryModel = new InquirySession.InquiryModel(req.session['inquiry']);
        const form = LoginForm_1.default(req);
        form(req, res, () => {
            if (!req.form)
                return next(req.__('common.error.property'));
            if (req.form.isValid) {
                getStateReserve(req, inquiryModel).then(() => {
                    //購入者内容確認へ
                    return res.redirect(`/inquiry/${inquiryModel.transactionId}/`);
                }, (err) => {
                    return next(new Error(err.message));
                });
            }
            else {
                res.locals.error = req.form.getErrors();
                return res.render('inquiry/login');
            }
        });
    }
    InquiryModule.auth = auth;
    /**
     * 照会情報取得
     * @function
     */
    function getStateReserve(req, inquiryModel) {
        return __awaiter(this, void 0, void 0, function* () {
            inquiryModel.transactionId = yield MP.makeInquiry.call({
                /**
                 * 施設コード
                 */
                inquiry_theater: req.body.theater_code,
                /**
                 * 座席チケット購入番号
                 */
                inquiry_id: req.body.reserve_num,
                /**
                 * 電話番号
                 */
                inquiry_pass: req.body.tel_num
            });
            console.log('MP取引Id取得', inquiryModel.transactionId);
            inquiryModel.login = req.body;
            inquiryModel.stateReserve = yield COA.stateReserveInterface.call({
                /**
                 * 施設コード
                 */
                theater_code: req.body.theater_code,
                /**
                 * 座席チケット購入番号
                 */
                reserve_num: req.body.reserve_num,
                /**
                 * 電話番号
                 */
                tel_num: req.body.tel_num
            });
            console.log('COA照会情報取得');
            const performanceId = UtilModule_1.default.getPerformanceId({
                theaterCode: req.body.theater_code,
                day: inquiryModel.stateReserve.date_jouei,
                titleCode: inquiryModel.stateReserve.title_code,
                titleBranchNum: inquiryModel.stateReserve.title_branch_num,
                screenCode: inquiryModel.stateReserve.screen_code,
                timeBegin: inquiryModel.stateReserve.time_begin
            });
            console.log('パフォーマンスID取得', performanceId);
            inquiryModel.performance = yield MP.getPerformance.call({
                id: performanceId
            });
            console.log('MPパフォーマンス取得');
            if (!req.session)
                throw req.__('common.error.property');
            req.session['inquiry'] = inquiryModel.formatToSession();
        });
    }
    /**
     * 照会確認ページ表示
     * @function
     */
    function index(req, res, next) {
        if (!req.session)
            return next(req.__('common.error.property'));
        const inquiryModel = new InquirySession.InquiryModel(req.session['inquiry']);
        if (inquiryModel.stateReserve
            && inquiryModel.performance
            && inquiryModel.login
            && inquiryModel.transactionId) {
            res.locals.stateReserve = inquiryModel.stateReserve;
            res.locals.performance = inquiryModel.performance;
            res.locals.login = inquiryModel.login;
            res.locals.transactionId = inquiryModel.transactionId;
            return res.render('inquiry/index');
        }
        else {
            //照会認証ページへ
            return res.redirect('/inquiry/login?transaction_id=' + req.params.transactionId);
        }
    }
    InquiryModule.index = index;
})(InquiryModule || (InquiryModule = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InquiryModule;
