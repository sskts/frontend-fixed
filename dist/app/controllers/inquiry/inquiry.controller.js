"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 照会
 * @namespace InquiryModule
 */
const cinerinoService = require("@cinerino/sdk");
const debug = require("debug");
const HTTPStatus = require("http-status");
const functions_1 = require("../../functions");
const forms_1 = require("../../functions/forms");
const models_1 = require("../../models");
const log = debug('SSKTS:InquiryModule');
/**
 * 照会認証ページ表示
 * @memberof InquiryModule
 * @function loginRender
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
function loginRender(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const theaterCode = req.query.theater;
        if (theaterCode === undefined) {
            const status = 404;
            res.status(status).render('error/notFound');
            return;
        }
        try {
            if (req.session === undefined)
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
            const options = functions_1.getApiOption(req);
            const inquiryModel = new models_1.InquiryModel();
            // 劇場のショップを検索
            const searchResult = yield new cinerinoService.service.Seller(options).search({
                branchCode: { $eq: theaterCode }
            });
            inquiryModel.seller = searchResult.data[0];
            log('劇場のショップを検索', inquiryModel.seller);
            inquiryModel.login = {
                reserveNum: (req.query.reserve !== undefined) ? req.query.reserve : '',
                telephone: ''
            };
            res.locals.inquiryModel = inquiryModel;
            res.locals.error = undefined;
            res.render('inquiry/login');
            return;
        }
        catch (err) {
            next(err);
        }
    });
}
exports.loginRender = loginRender;
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
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
            const options = functions_1.getApiOption(req);
            forms_1.inquiryLoginForm(req);
            const validationResult = yield req.getValidationResult();
            if (validationResult.isEmpty()) {
                const inquiryModel = new models_1.InquiryModel();
                const searchResult = yield new cinerinoService.service.Seller(options).search({
                    branchCode: { $eq: req.body.theaterCode }
                });
                inquiryModel.seller = searchResult.data[0];
                log('劇場のショップを検索');
                if (inquiryModel.seller === undefined
                    || inquiryModel.seller.location === undefined
                    || inquiryModel.seller.location.branchCode === undefined) {
                    throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
                }
                inquiryModel.login = {
                    reserveNum: req.body.reserveNum,
                    telephone: req.body.telephone
                };
                const findResult = yield new cinerinoService.service.Order(options).findByOrderInquiryKey4sskts({
                    telephone: inquiryModel.login.telephone,
                    confirmationNumber: inquiryModel.login.reserveNum,
                    theaterCode: inquiryModel.seller.location.branchCode
                });
                inquiryModel.order = (Array.isArray(findResult)) ? findResult[0] : findResult;
                log('照会情報');
                if (inquiryModel.order === undefined) {
                    res.locals.inquiryModel = inquiryModel;
                    res.locals.error = getInquiryError(req);
                    res.render('inquiry/login');
                    return;
                }
                inquiryModel.save(req.session);
                //購入者内容確認へ
                res.redirect(`/inquiry/${inquiryModel.order.orderNumber}/?theater=${inquiryModel.seller.location.branchCode}`);
                return;
            }
            else {
                const inquiryModel = new models_1.InquiryModel();
                const searchResult = yield new cinerinoService.service.Seller(options).search({
                    branchCode: { $eq: req.body.theaterCode }
                });
                inquiryModel.seller = searchResult.data[0];
                log('劇場のショップを検索');
                if (inquiryModel.seller === undefined)
                    throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
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
            next(err);
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
 * @function confirmRender
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
function confirmRender(req, res, next) {
    try {
        if (req.session === undefined
            || req.query.theater === undefined)
            throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
        if (req.session.inquiry === undefined) {
            res.redirect(`/inquiry/login?orderNumber=${req.params.orderNumber}&theater=${req.query.theater}`);
            return;
        }
        const inquiryModel = new models_1.InquiryModel(req.session.inquiry);
        res.locals.inquiryModel = inquiryModel;
        delete req.session.inquiry;
        res.render('inquiry/index');
        return;
    }
    catch (err) {
        next(err);
    }
}
exports.confirmRender = confirmRender;
