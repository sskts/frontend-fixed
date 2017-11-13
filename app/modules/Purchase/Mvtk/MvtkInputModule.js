"use strict";
/**
 * ムビチケ入力
 * @namespace Purchase.Mvtk.MvtkInputModule
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
const MVTK = require("@motionpicture/mvtk-reserve-service");
const debug = require("debug");
const HTTPStatus = require("http-status");
const moment = require("moment");
const MvtkInputForm_1 = require("../../../forms/Purchase/Mvtk/MvtkInputForm");
const logger_1 = require("../../../middlewares/logger");
const PurchaseModel_1 = require("../../../models/Purchase/PurchaseModel");
const MvtkUtilModule = require("../../Purchase/Mvtk/MvtkUtilModule");
const ErrorUtilModule_1 = require("../../Util/ErrorUtilModule");
const UtilModule = require("../../Util/UtilModule");
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
            throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
        const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
        if (purchaseModel.isExpired())
            throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Expire);
        if (purchaseModel.transaction === null)
            throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
        // ムビチケセッション削除
        delete req.session.mvtk;
        // 購入者情報入力表示
        res.locals.mvtkInfo = [{ code: '', password: '' }];
        res.locals.error = null;
        res.locals.purchaseModel = purchaseModel;
        res.locals.step = PurchaseModel_1.PurchaseModel.TICKET_STATE;
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
            next(new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property));
            return;
        }
        try {
            const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
            if (purchaseModel.isExpired())
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Expire);
            if (purchaseModel.transaction === null
                || purchaseModel.individualScreeningEvent === null)
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            //取引id確認
            if (req.body.transactionId !== purchaseModel.transaction.id)
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            MvtkInputForm_1.default(req);
            const validationResult = yield req.getValidationResult();
            if (!validationResult.isEmpty())
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Access);
            const inputInfoList = JSON.parse(req.body.mvtk);
            mvtkValidation(inputInfoList);
            log('ムビチケ券検証');
            const purchaseNumberAuthIn = {
                kgygishCd: MvtkUtilModule.COMPANY_CODE,
                jhshbtsCd: MVTK.services.auth.purchaseNumberAuth.InformationTypeCode.Valid,
                knyknrNoInfoIn: inputInfoList.map((value) => {
                    return {
                        knyknrNo: value.code,
                        pinCd: value.password // PINコード
                    };
                }),
                skhnCd: purchaseModel.getMvtkfilmCode(),
                stCd: `00${purchaseModel.individualScreeningEvent.coaInfo.theaterCode}`.slice(UtilModule.DIGITS['02']),
                jeiYmd: moment(purchaseModel.individualScreeningEvent.coaInfo.dateJouei).format('YYYY/MM/DD') //上映年月日
            };
            let purchaseNumberAuthResult;
            try {
                purchaseNumberAuthResult = yield MVTK.services.auth.purchaseNumberAuth.purchaseNumberAuth(purchaseNumberAuthIn);
                if (purchaseNumberAuthResult.knyknrNoInfoOut === null) {
                    throw new Error('purchaseNumberAuthResult.knyknrNoInfoOut === null');
                }
                log('ムビチケ認証', purchaseNumberAuthResult);
            }
            catch (err) {
                logger_1.default.error('SSKTS-APP:MvtkInputModule.auth', purchaseNumberAuthIn, err);
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.ExternalModule, err.message);
            }
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
                        theaterCode: purchaseModel.individualScreeningEvent.coaInfo.theaterCode,
                        kbnDenshiken: purchaseNumberInfo.dnshKmTyp,
                        kbnMaeuriken: purchaseNumberInfo.znkkkytsknGkjknTyp,
                        kbnKensyu: info.ykknshTyp,
                        salesPrice: Number(info.knshknhmbiUnip),
                        appPrice: Number(info.kijUnip),
                        kbnEisyahousiki: info.eishhshkTyp,
                        titleCode: purchaseModel.individualScreeningEvent.coaInfo.titleCode,
                        titleBranchNum: purchaseModel.individualScreeningEvent.coaInfo.titleBranchNum
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
                        password: UtilModule.bace64Encode(input.password),
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
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Validation, JSON.stringify(validationList));
            }
            req.session.mvtk = mvtkList;
            res.redirect('/purchase/mvtk/confirm');
        }
        catch (err) {
            if (err.errorType === ErrorUtilModule_1.ErrorType.Validation) {
                const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
                res.locals.mvtkInfo = JSON.parse(req.body.mvtk);
                res.locals.purchaseModel = purchaseModel;
                res.locals.step = PurchaseModel_1.PurchaseModel.TICKET_STATE;
                res.locals.error = err.errors[0].message;
                res.render('purchase/mvtk/input', { layout: 'layouts/purchase/layout' });
                return;
            }
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
        throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Validation, JSON.stringify(validationList));
    }
}
