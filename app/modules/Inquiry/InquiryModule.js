"use strict";
/**
 * 照会
 * @namespace InquiryModule
 */
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
const MP = require("../../../libs/MP");
const LoginForm_1 = require("../../forms/Inquiry/LoginForm");
const InquirySession = require("../../models/Inquiry/InquiryModel");
const ErrorUtilModule = require("../Util/ErrorUtilModule");
const UtilModule = require("../Util/UtilModule");
const log = debug('SSKTS:InquiryModule');
/**
 * 照会認証ページ表示
 * @memberOf InquiryModule
 * @function login
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
// tslint:disable-next-line:variable-name
function login(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.query.theater === undefined) {
            const status = 404;
            res.status(status).render('error/notFound');
            return;
        }
        try {
            res.locals.portalTheaterSite = yield getPortalTheaterSite(req.query.theater);
            res.locals.theaterCode = (req.query.theater !== undefined) ? req.query.theater : '';
            res.locals.reserveNum = (req.query.reserve !== undefined) ? req.query.reserve : '';
            res.locals.telNum = '';
            res.locals.error = null;
            res.render('inquiry/login');
            return;
        }
        catch (err) {
            const error = (err instanceof Error)
                ? new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message)
                : new ErrorUtilModule.CustomError(err, undefined);
            next(error);
            return;
        }
    });
}
exports.login = login;
/**
 * 劇場URL取得
 * @memberOf InquiryModule
 * @function getPortalTheaterSite
 * @param {string} id
 * @returns {Promise<string>}
 */
function getPortalTheaterSite(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const theater = yield MP.getTheater(id);
        const website = theater.attributes.websites.find((value) => value.group === 'PORTAL');
        if (website === undefined)
            throw ErrorUtilModule.ERROR_PROPERTY;
        return website.url;
    });
}
/**
 * 照会認証
 * @memberOf InquiryModule
 * @function auth
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
function auth(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.session === undefined)
                throw ErrorUtilModule.ERROR_PROPERTY;
            const inquiryModel = new InquirySession.InquiryModel(req.session.inquiry);
            LoginForm_1.default(req);
            const validationResult = yield req.getValidationResult();
            if (validationResult.isEmpty()) {
                inquiryModel.transactionId = yield MP.makeInquiry({
                    inquiry_theater: req.body.theater_code,
                    inquiry_id: Number(req.body.reserve_num),
                    inquiry_pass: req.body.tel_num // 電話番号
                });
                if (inquiryModel.transactionId === null) {
                    res.locals.portalTheaterSite = yield getPortalTheaterSite(req.query.theater);
                    res.locals.theaterCode = req.body.theater_code;
                    res.locals.reserveNum = req.body.reserve_num;
                    res.locals.telNum = req.body.tel_num;
                    res.locals.error = getInquiryError(req);
                    res.render('inquiry/login');
                    return;
                }
                log('MP取引Id取得', inquiryModel.transactionId);
                inquiryModel.login = req.body;
                inquiryModel.stateReserve = yield COA.ReserveService.stateReserve({
                    theater_code: req.body.theater_code,
                    reserve_num: req.body.reserve_num,
                    tel_num: req.body.tel_num // 電話番号
                });
                log('COA照会情報取得', inquiryModel.stateReserve);
                if (inquiryModel.stateReserve === null)
                    throw ErrorUtilModule.ERROR_PROPERTY;
                const performanceId = UtilModule.getPerformanceId({
                    theaterCode: req.body.theater_code,
                    day: inquiryModel.stateReserve.date_jouei,
                    titleCode: inquiryModel.stateReserve.title_code,
                    titleBranchNum: inquiryModel.stateReserve.title_branch_num,
                    screenCode: inquiryModel.stateReserve.screen_code,
                    timeBegin: inquiryModel.stateReserve.time_begin
                });
                log('パフォーマンスID取得', performanceId);
                inquiryModel.performance = yield MP.getPerformance(performanceId);
                log('MPパフォーマンス取得');
                req.session.inquiry = inquiryModel.toSession();
                //購入者内容確認へ
                res.redirect(`/inquiry/${inquiryModel.transactionId}/?theater=${req.body.theater_code}`);
                return;
            }
            else {
                res.locals.portalTheaterSite = yield getPortalTheaterSite(req.query.theater);
                res.locals.theaterCode = req.body.theater_code;
                res.locals.reserveNum = req.body.reserve_num;
                res.locals.telNum = req.body.tel_num;
                res.locals.error = validationResult.mapped();
                res.render('inquiry/login');
                return;
            }
        }
        catch (err) {
            const error = (err instanceof Error)
                ? new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message)
                : new ErrorUtilModule.CustomError(err, undefined);
            next(error);
            return;
        }
    });
}
exports.auth = auth;
/**
 * 照会エラー取得
 * @memberOf InquiryModule
 * @function getGMOError
 * @param {Request} req
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
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
function index(req, res, next) {
    if (req.session === undefined) {
        next(new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_PROPERTY, undefined));
        return;
    }
    if (req.query.theater === undefined) {
        next(new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_PROPERTY, undefined));
        return;
    }
    const inquiryModel = new InquirySession.InquiryModel(req.session.inquiry);
    if (inquiryModel.stateReserve !== null
        && inquiryModel.performance !== null
        && inquiryModel.login !== null
        && inquiryModel.transactionId !== null) {
        res.locals.theaterCode = inquiryModel.performance.attributes.theater.id;
        res.locals.stateReserve = inquiryModel.stateReserve;
        res.locals.performance = inquiryModel.performance;
        res.locals.login = inquiryModel.login;
        res.locals.transactionId = inquiryModel.transactionId;
        delete req.session.inquiry;
        res.render('inquiry/index');
        return;
    }
    else {
        //照会認証ページへ
        res.redirect(`/inquiry/login?theater=${req.query.theater}&transactionId=${req.params.transactionId}`);
        return;
    }
}
exports.index = index;
