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
/**
 * 照会
 * @namespace InquiryModule
 */
const ssktsApi = require("@motionpicture/sasaki-api-nodejs");
const debug = require("debug");
const LoginForm_1 = require("../../forms/Inquiry/LoginForm");
const AuthModel_1 = require("../../models/Auth/AuthModel");
const InquiryModel_1 = require("../../models/Inquiry/InquiryModel");
const ErrorUtilModule = require("../Util/ErrorUtilModule");
const log = debug('SSKTS:InquiryModule');
/**
 * 照会認証ページ表示
 * @memberof InquiryModule
 * @function login
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
function login(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const theaterCode = (req.query.orderNumber !== undefined) ? req.query.orderNumber.split('-')[0] : req.query.theater;
        if (theaterCode === undefined) {
            const status = 404;
            res.status(status).render('error/notFound');
            return;
        }
        try {
            if (req.session === undefined)
                throw ErrorUtilModule.ERROR_PROPERTY;
            const authModel = new AuthModel_1.AuthModel(req.session.auth);
            const auth = authModel.create();
            const inquiryModel = new InquiryModel_1.InquiryModel();
            // 劇場のショップを検索
            inquiryModel.movieTheaterOrganization = yield ssktsApi.service.organization.findMovieTheaterByBranchCode({
                auth: auth,
                branchCode: theaterCode
            });
            log('劇場のショップを検索', inquiryModel.movieTheaterOrganization);
            inquiryModel.login = {
                reserveNum: (req.query.reserve !== undefined) ? req.query.reserve : '',
                telephone: ''
            };
            res.locals.inquiryModel = inquiryModel;
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
 * 照会認証
 * @memberof InquiryModule
 * @function auth
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
function inquiryAuth(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.session === undefined)
                throw ErrorUtilModule.ERROR_PROPERTY;
            const authModel = new AuthModel_1.AuthModel(req.session.auth);
            const auth = authModel.create();
            LoginForm_1.default(req);
            const validationResult = yield req.getValidationResult();
            if (validationResult.isEmpty()) {
                const inquiryModel = new InquiryModel_1.InquiryModel();
                inquiryModel.movieTheaterOrganization = yield ssktsApi.service.organization.findMovieTheaterByBranchCode({
                    auth: auth,
                    branchCode: req.body.theaterCode
                });
                log('劇場のショップを検索', inquiryModel.movieTheaterOrganization);
                if (inquiryModel.movieTheaterOrganization === null)
                    throw ErrorUtilModule.ERROR_PROPERTY;
                inquiryModel.login = {
                    reserveNum: req.body.reserveNum,
                    telephone: req.body.telephone
                };
                inquiryModel.order = yield ssktsApi.service.order.findByOrderInquiryKey({
                    auth: auth,
                    orderInquiryKey: {
                        telephone: inquiryModel.login.telephone,
                        orderNumber: Number(inquiryModel.login.reserveNum),
                        theaterCode: inquiryModel.movieTheaterOrganization.location.branchCode
                    }
                });
                log('照会情報', inquiryModel.order);
                if (inquiryModel.order === null) {
                    res.locals.inquiryModel = inquiryModel;
                    res.locals.error = getInquiryError(req);
                    res.render('inquiry/login');
                    return;
                }
                inquiryModel.save(req.session);
                //購入者内容確認へ
                res.redirect(`/inquiry/${inquiryModel.order.orderNumber}/?theater=${inquiryModel.movieTheaterOrganization.location.branchCode}`);
                return;
            }
            else {
                const inquiryModel = new InquiryModel_1.InquiryModel();
                inquiryModel.movieTheaterOrganization = yield ssktsApi.service.organization.findMovieTheaterByBranchCode({
                    auth: auth,
                    branchCode: req.body.theaterCode
                });
                log('劇場のショップを検索', inquiryModel.movieTheaterOrganization);
                if (inquiryModel.movieTheaterOrganization === null)
                    throw ErrorUtilModule.ERROR_PROPERTY;
                inquiryModel.login = {
                    reserveNum: req.body.reserveNum,
                    telephone: req.body.telephone
                };
                res.locals.inquiryModel = inquiryModel;
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
exports.inquiryAuth = inquiryAuth;
/**
 * 照会エラー取得
 * @memberof InquiryModule
 * @function getGMOError
 * @param {Request} req
 * @returns {any}
 */
function getInquiryError(req) {
    return {
        reserveNum: {
            parm: 'reserveNum', msg: `${req.__('common.purchase_number')}${req.__('common.validation.inquiry')}`, value: ''
        },
        telephone: {
            parm: 'telephone', msg: `${req.__('common.tel_num')}${req.__('common.validation.inquiry')}`, value: ''
        }
    };
}
/**
 * 照会確認ページ表示
 * @memberof InquiryModule
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
function index(req, res, next) {
    try {
        if (req.session === undefined)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (req.query.theater === undefined)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (req.session.inquiry === undefined) {
            res.redirect(`/inquiry/login?orderNumber=${req.params.orderNumber}`);
            return;
        }
        const inquiryModel = new InquiryModel_1.InquiryModel(req.session.inquiry);
        res.locals.inquiryModel = inquiryModel;
        delete req.session.inquiry;
        res.render('inquiry/index');
        return;
    }
    catch (err) {
        const error = (err instanceof Error)
            ? new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message)
            : new ErrorUtilModule.CustomError(err, undefined);
        next(error);
    }
}
exports.index = index;
