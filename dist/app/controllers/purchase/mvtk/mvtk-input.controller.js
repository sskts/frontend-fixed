"use strict";
/**
 * ムビチケ入力
 * @namespace Purchase.Mvtk.MvtkInputModule
 */
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
const cinerinoService = require("@cinerino/sdk");
const COA = require("@motionpicture/coa-service");
const debug = require("debug");
const HTTPStatus = require("http-status");
const functions_1 = require("../../../functions");
const forms_1 = require("../../../functions/forms");
const logger_1 = require("../../../middlewares/logger");
const models_1 = require("../../../models");
const log = debug('SSKTS:Purchase.Mvtk.MvtkInputModule');
/**
 * ムビチケ券入力ページ表示
 * @memberof Purchase.Mvtk.MvtkInputModule
 * @function render
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
function render(req, res, next) {
    try {
        if (req.session === undefined)
            throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
        const purchaseModel = new models_1.PurchaseModel(req.session.purchase);
        if (purchaseModel.isExpired())
            throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Expire);
        if (purchaseModel.transaction === undefined)
            throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
        // ムビチケセッション削除
        delete req.session.mvtk;
        // 購入者情報入力表示
        res.locals.mvtkInfo = [{ code: '', password: '' }];
        res.locals.error = undefined;
        res.locals.purchaseModel = purchaseModel;
        res.locals.step = models_1.PurchaseModel.TICKET_STATE;
        res.render('purchase/mvtk/input', { layout: 'layouts/purchase/layout' });
    }
    catch (err) {
        next(err);
    }
}
exports.render = render;
/**
 * ムビチケ認証
 * @memberof Purchase.Mvtk.MvtkInputModule
 * @function auth
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
// tslint:disable-next-line:max-func-body-length cyclomatic-complexity
function auth(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.session === undefined) {
            next(new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property));
            return;
        }
        try {
            const purchaseModel = new models_1.PurchaseModel(req.session.purchase);
            if (purchaseModel.isExpired())
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Expire);
            const transaction = purchaseModel.transaction;
            const screeningEvent = purchaseModel.screeningEvent;
            const seller = purchaseModel.seller;
            if (transaction === undefined
                || screeningEvent === undefined
                || screeningEvent.coaInfo === undefined
                || seller === undefined
                || seller.id === undefined) {
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
            }
            //取引id確認
            if (req.body.transactionId !== transaction.id) {
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Property);
            }
            forms_1.purchaseMvtkInputForm(req);
            const validationResult = yield req.getValidationResult();
            if (!validationResult.isEmpty())
                throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Access);
            const inputInfoList = JSON.parse(req.body.mvtk);
            mvtkValidation(inputInfoList);
            log('ムビチケ券検証');
            const movieTickets = inputInfoList.map((i) => {
                return {
                    typeOf: cinerinoService.factory.paymentMethodType.MovieTicket,
                    project: seller.project,
                    identifier: i.code,
                    accessCode: i.password // PINコード
                };
            });
            const options = functions_1.getApiOption(req);
            const paymentService = new cinerinoService.service.Payment(options);
            const checkMovieTicketAction = yield paymentService.checkMovieTicket({
                typeOf: cinerinoService.factory.paymentMethodType.MovieTicket,
                movieTickets: movieTickets.map((movieTicket) => {
                    return Object.assign(Object.assign({}, movieTicket), { serviceType: '', serviceOutput: {
                            reservationFor: {
                                typeOf: screeningEvent.typeOf,
                                id: screeningEvent.id
                            },
                            reservedTicket: {
                                ticketedSeat: {
                                    typeOf: cinerinoService.factory.chevre.placeType.Seat,
                                    seatingType: '',
                                    seatNumber: '',
                                    seatRow: '',
                                    seatSection: '' // 情報空でよし
                                }
                            }
                        } });
                }),
                seller: {
                    typeOf: seller.typeOf,
                    id: seller.id
                }
            });
            if (checkMovieTicketAction.result === undefined) {
                throw new Error('checkMovieTicketAction error');
            }
            const success = 'N000';
            const purchaseNumberAuthResult = checkMovieTicketAction.result.purchaseNumberAuthResult;
            if (purchaseNumberAuthResult.resultInfo.status !== success
                || purchaseNumberAuthResult.ykknmiNumSum === null
                || purchaseNumberAuthResult.ykknmiNumSum === 0
                || purchaseNumberAuthResult.knyknrNoInfoOut === null) {
                throw new Error('purchaseNumberAuth error');
            }
            log('ムビチケ認証', purchaseNumberAuthResult);
            const validationList = [];
            // ムビチケセッション作成
            const mvtkList = [];
            for (const purchaseNumberInfo of purchaseNumberAuthResult.knyknrNoInfoOut) {
                if (purchaseNumberInfo.ykknInfo === null)
                    continue;
                for (const info of purchaseNumberInfo.ykknInfo) {
                    const input = inputInfoList.find((value) => {
                        return (value.code === purchaseNumberInfo.knyknrNo);
                    });
                    if (input === undefined)
                        continue;
                    // ムビチケチケットコード取得
                    const ticket = yield COA.services.master.mvtkTicketcode({
                        theaterCode: screeningEvent.coaInfo.theaterCode,
                        kbnDenshiken: purchaseNumberInfo.dnshKmTyp,
                        kbnMaeuriken: purchaseNumberInfo.znkkkytsknGkjknTyp,
                        kbnKensyu: info.ykknshTyp,
                        salesPrice: Number(info.knshknhmbiUnip),
                        appPrice: Number(info.kijUnip),
                        kbnEisyahousiki: info.eishhshkTyp,
                        titleCode: screeningEvent.coaInfo.titleCode,
                        titleBranchNum: screeningEvent.coaInfo.titleBranchNum,
                        dateJouei: screeningEvent.coaInfo.dateJouei
                    });
                    log('ムビチケチケットコード取得', ticket);
                    const validTicket = {
                        ykknshTyp: info.ykknshTyp,
                        eishhshkTyp: info.eishhshkTyp,
                        ykknKnshbtsmiNum: info.ykknKnshbtsmiNum,
                        knshknhmbiUnip: info.knshknhmbiUnip,
                        kijUnip: info.kijUnip,
                        dnshKmTyp: purchaseNumberInfo.dnshKmTyp,
                        znkkkytsknGkjknTyp: purchaseNumberInfo.znkkkytsknGkjknTyp // 全国共通券・劇場券区分
                    };
                    mvtkList.push({
                        code: purchaseNumberInfo.knyknrNo,
                        password: functions_1.bace64Encode(input.password),
                        ykknInfo: validTicket,
                        ticket: ticket
                    });
                }
                if (purchaseNumberInfo.knyknrNoMkujyuCd !== undefined) {
                    validationList.push(purchaseNumberInfo.knyknrNo);
                }
            }
            // 認証エラーバリデーション
            if (validationList.length > 0) {
                logger_1.default.error('SSKTS-APP:MvtkInputModule.auth', purchaseNumberAuthResult);
                const err = new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Validation, JSON.stringify(validationList));
                res.locals.mvtkInfo = JSON.parse(req.body.mvtk);
                res.locals.purchaseModel = purchaseModel;
                res.locals.step = models_1.PurchaseModel.TICKET_STATE;
                res.locals.error = err.errors[0].message;
                res.render('purchase/mvtk/input', { layout: 'layouts/purchase/layout' });
                return;
            }
            req.session.mvtk = mvtkList;
            purchaseModel.checkMovieTicketAction = checkMovieTicketAction;
            purchaseModel.save(req.session);
            res.redirect('/purchase/mvtk/confirm');
        }
        catch (err) {
            next(err);
        }
    });
}
exports.auth = auth;
/**
 * ムビチケ券検証
 * @function mvtkValidation
 * @param {InputInfo[]} inputInfoList
 */
function mvtkValidation(inputInfoList) {
    const codeList = inputInfoList.map((inputInfo) => {
        return inputInfo.code;
    });
    const validationList = codeList.filter((code, index) => {
        return codeList.indexOf(code) === index && index !== codeList.lastIndexOf(code);
    });
    if (validationList.length > 0) {
        throw new models_1.AppError(HTTPStatus.BAD_REQUEST, models_1.ErrorType.Validation, JSON.stringify(validationList));
    }
}
