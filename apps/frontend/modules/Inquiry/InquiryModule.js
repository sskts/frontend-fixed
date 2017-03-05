/**
 * 照会
 * @namespace InquiryModule
 */
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const COA = require("@motionpicture/coa-service");
const debug = require("debug");
const MP = require("../../../../libs/MP");
const LoginForm_1 = require("../../forms/Inquiry/LoginForm");
const InquirySession = require("../../models/Inquiry/InquiryModel");
const UtilModule = require("../Util/UtilModule");
const debugLog = debug('SSKTS: ');
/**
 * 照会認証ページ表示
 * @memberOf InquiryModule
 * @function login
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {void}
 */
// tslint:disable-next-line:variable-name
function login(_req, res) {
    res.locals.theater_code = '';
    res.locals.reserve_num = '';
    res.locals.tel_num = '';
    if (process.env.NODE_ENV === 'dev') {
        res.locals.theater_code = '118';
        res.locals.reserve_num = '59';
        res.locals.tel_num = '09040007648';
    }
    res.locals.error = null;
    return res.render('inquiry/login');
}
exports.login = login;
/**
 * 照会認証
 * @memberOf InquiryModule
 * @function auth
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
function auth(req, res, next) {
    if (!req.session)
        return next(new Error(req.__('common.error.property')));
    const inquiryModel = new InquirySession.InquiryModel(req.session.inquiry);
    const form = LoginForm_1.default(req);
    form(req, res, () => {
        if (!req.form)
            return next(new Error(req.__('common.error.property')));
        if (req.form.isValid) {
            getStateReserve(req, inquiryModel).then(() => {
                //購入者内容確認へ
                return res.redirect(`/inquiry/${inquiryModel.transactionId}/`);
            }).catch((err) => {
                return next(new Error(err.message));
            });
        }
        else {
            res.locals.error = req.form.getErrors();
            return res.render('inquiry/login');
        }
    });
}
exports.auth = auth;
/**
 * 照会情報取得
 * @memberOf InquiryModule
 * @function getStateReserve
 * @param {express.Request} req
 * @param {InquirySession.InquiryModel} inquiryModel
 * @returns {Promise<void>}
 */
function getStateReserve(req, inquiryModel) {
    return __awaiter(this, void 0, void 0, function* () {
        inquiryModel.transactionId = yield MP.makeInquiry({
            /**
             * 施設コード
             */
            inquiry_theater: req.body.theater_code,
            /**
             * 座席チケット購入番号
             */
            inquiry_id: Number(req.body.reserve_num),
            /**
             * 電話番号
             */
            inquiry_pass: req.body.tel_num
        });
        debugLog('MP取引Id取得', inquiryModel.transactionId);
        inquiryModel.login = req.body;
        inquiryModel.stateReserve = yield COA.ReserveService.stateReserve({
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
        debugLog('COA照会情報取得');
        const performanceId = UtilModule.getPerformanceId({
            theaterCode: req.body.theater_code,
            day: inquiryModel.stateReserve.date_jouei,
            titleCode: inquiryModel.stateReserve.title_code,
            titleBranchNum: inquiryModel.stateReserve.title_branch_num,
            screenCode: inquiryModel.stateReserve.screen_code,
            timeBegin: inquiryModel.stateReserve.time_begin
        });
        debugLog('パフォーマンスID取得', performanceId);
        inquiryModel.performance = yield MP.getPerformance({
            id: performanceId
        });
        debugLog('MPパフォーマンス取得');
        if (!req.session)
            throw req.__('common.error.property');
        req.session.inquiry = inquiryModel.toSession();
    });
}
/**
 * 照会確認ページ表示
 * @memberOf InquiryModule
 * @function index
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
function index(req, res, next) {
    if (!req.session)
        return next(new Error(req.__('common.error.property')));
    const inquiryModel = new InquirySession.InquiryModel(req.session.inquiry);
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
exports.index = index;
