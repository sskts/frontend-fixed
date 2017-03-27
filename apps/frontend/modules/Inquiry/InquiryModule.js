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
const ErrorUtilModule = require("../Util/ErrorUtilModule");
const UtilModule = require("../Util/UtilModule");
const debugLog = debug('SSKTS ');
/**
 * 照会認証ページ表示
 * @memberOf InquiryModule
 * @function login
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {void}
 */
// tslint:disable-next-line:variable-name
function login(req, res) {
    res.locals.theater_code = (req.query && req.query.theater) ? req.query.theater : '';
    res.locals.reserve_num = (req.query && req.query.reserve) ? req.query.reserve : '';
    res.locals.tel_num = '';
    // if (process.env.NODE_ENV === 'development') {
    //     res.locals.theater_code = '118';
    //     res.locals.reserve_num = '59';
    //     res.locals.tel_num = '09040007648';
    // }
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
 * @returns {Promise<void>}
 */
function auth(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.session)
            return next(ErrorUtilModule.getError(req, ErrorUtilModule.ERROR_PROPERTY));
        const inquiryModel = new InquirySession.InquiryModel(req.session.inquiry);
        LoginForm_1.default(req);
        try {
            const validationResult = yield req.getValidationResult();
            if (validationResult.isEmpty()) {
                try {
                    inquiryModel.transactionId = yield MP.makeInquiry({
                        inquiry_theater: req.body.theater_code,
                        inquiry_id: Number(req.body.reserve_num),
                        inquiry_pass: req.body.tel_num // 電話番号
                    });
                }
                catch (err) {
                    throw ErrorUtilModule.ERROR_VALIDATION;
                }
                debugLog('MP取引Id取得', inquiryModel.transactionId);
                inquiryModel.login = req.body;
                inquiryModel.stateReserve = yield COA.ReserveService.stateReserve({
                    theater_code: req.body.theater_code,
                    reserve_num: req.body.reserve_num,
                    tel_num: req.body.tel_num // 電話番号
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
                inquiryModel.performance = yield MP.getPerformance(performanceId);
                debugLog('MPパフォーマンス取得');
                req.session.inquiry = inquiryModel.toSession();
                //購入者内容確認へ
                return res.redirect(`/inquiry/${inquiryModel.transactionId}/`);
            }
            else {
                res.locals.theater_code = req.body.theater_code;
                res.locals.reserve_num = req.body.reserve_num;
                res.locals.tel_num = req.body.tel_num;
                res.locals.error = validationResult.mapped();
                return res.render('inquiry/login');
            }
        }
        catch (err) {
            if (err === ErrorUtilModule.ERROR_VALIDATION) {
                res.locals.theater_code = req.body.theater_code;
                res.locals.reserve_num = req.body.reserve_num;
                res.locals.tel_num = req.body.tel_num;
                res.locals.error = getInquiryError(req);
                return res.render('inquiry/login');
            }
            return next(ErrorUtilModule.getError(req, err));
        }
    });
}
exports.auth = auth;
/**
 * 照会エラー取得
 * @memberOf InquiryModule
 * @function getGMOError
 * @param {express.Request} req
 * @returns {any}
 */
function getInquiryError(req) {
    return {
        theater_code: {
            parm: 'theater_code', msg: `${req.__('common.theater_code')}${req.__('common.validation.inquiry')}`, value: ''
        },
        reserve_num: {
            parm: 'reserve_num', msg: `${req.__('common.purchase_number')}${req.__('common.validation.inquiry')}`, value: ''
        },
        tel_num: {
            parm: 'tel_num', msg: `${req.__('common.tel_num')}${req.__('common.validation.inquiry')}`, value: ''
        }
    };
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
        return next(ErrorUtilModule.getError(req, ErrorUtilModule.ERROR_PROPERTY));
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
