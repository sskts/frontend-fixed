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
const MVTK = require("@motionpicture/mvtk-service");
const debug = require("debug");
const moment = require("moment");
const MvtkInputForm_1 = require("../../../forms/Purchase/Mvtk/MvtkInputForm");
const logger_1 = require("../../../middlewares/logger");
const PurchaseSession = require("../../../models/Purchase/PurchaseModel");
const MvtkUtilModule = require("../../Purchase/Mvtk/MvtkUtilModule");
const ErrorUtilModule = require("../../Util/ErrorUtilModule");
const UtilModule = require("../../Util/UtilModule");
const log = debug('SSKTS:Purchase.Mvtk.MvtkInputModule');
/**
 * ムビチケ券入力ページ表示
 * @memberOf Purchase.Mvtk.MvtkInputModule
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
        if (req.session.purchase === undefined)
            throw ErrorUtilModule.ERROR_EXPIRE;
        const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
        if (purchaseModel.isExpired())
            throw ErrorUtilModule.ERROR_EXPIRE;
        if (purchaseModel.transactionMP === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.reserveSeats === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        // ムビチケセッション削除
        delete req.session.mvtk;
        // 購入者情報入力表示
        res.locals.mvtkInfo = [{ code: '', password: '' }];
        res.locals.transactionId = purchaseModel.transactionMP.id;
        res.locals.reserveSeatLength = purchaseModel.reserveSeats.list_tmp_reserve.length;
        res.locals.error = null;
        res.render('purchase/mvtk/input', { layout: 'layouts/purchase/layout' });
        return;
    }
    catch (err) {
        const error = (err instanceof Error)
            ? new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message)
            : new ErrorUtilModule.CustomError(err, undefined);
        next(error);
        return;
    }
}
exports.index = index;
/**
 * 券種選択
 * @memberOf Purchase.Mvtk.MvtkInputModule
 * @function select
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
// tslint:disable-next-line:max-func-body-length
// tslint:disable-next-line:cyclomatic-complexity
function select(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.session === undefined) {
            next(new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_PROPERTY, undefined));
            return;
        }
        try {
            if (req.session.purchase === undefined)
                throw ErrorUtilModule.ERROR_EXPIRE;
            const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
            if (purchaseModel.isExpired())
                throw ErrorUtilModule.ERROR_EXPIRE;
            if (purchaseModel.transactionMP === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (purchaseModel.reserveSeats === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (purchaseModel.performance === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (purchaseModel.performanceCOA === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            //取引id確認
            if (req.body.transaction_id !== purchaseModel.transactionMP.id) {
                throw ErrorUtilModule.ERROR_ACCESS;
            }
            MvtkInputForm_1.default(req);
            const validationResult = yield req.getValidationResult();
            if (!validationResult.isEmpty())
                throw ErrorUtilModule.ERROR_ACCESS;
            const mvtkService = MVTK.createPurchaseNumberAuthService();
            const inputInfo = JSON.parse(req.body.mvtk);
            const purchaseNumberAuthIn = {
                kgygishCd: MvtkUtilModule.COMPANY_CODE,
                jhshbtsCd: MVTK.PurchaseNumberAuthUtilities.INFORMATION_TYPE_CODE_VALID,
                knyknrNoInfoIn: inputInfo.map((value) => {
                    return {
                        KNYKNR_NO: value.code,
                        PIN_CD: value.password // PINコード
                    };
                }),
                skhnCd: MvtkUtilModule.getfilmCode(purchaseModel.performanceCOA.titleCode, purchaseModel.performanceCOA.titleBranchNum),
                stCd: MvtkUtilModule.getSiteCode(purchaseModel.performance.attributes.theater.id),
                jeiYmd: moment(purchaseModel.performance.attributes.day).format('YYYY/MM/DD') //上映年月日
            };
            let purchaseNumberAuthResults;
            try {
                purchaseNumberAuthResults = yield mvtkService.purchaseNumberAuth(purchaseNumberAuthIn);
                log('ムビチケ認証', purchaseNumberAuthResults);
            }
            catch (err) {
                logger_1.default.error('SSKTS-APP:MvtkInputModule.select purchaseNumberAuthIn', purchaseNumberAuthIn);
                logger_1.default.error('SSKTS-APP:MvtkInputModule.select purchaseNumberError', err);
                throw err;
            }
            if (purchaseNumberAuthResults === undefined)
                throw ErrorUtilModule.ERROR_PROPERTY;
            const validationList = [];
            // ムビチケセッション作成
            const mvtkList = [];
            for (const purchaseNumberAuthResult of purchaseNumberAuthResults) {
                for (const info of purchaseNumberAuthResult.ykknInfo) {
                    const input = inputInfo.find((value) => {
                        return (value.code === purchaseNumberAuthResult.knyknrNo);
                    });
                    if (input === undefined)
                        continue;
                    // ムビチケチケットコード取得
                    const ticket = yield COA.MasterService.mvtkTicketcode({
                        theater_code: purchaseModel.performance.attributes.theater.id,
                        kbn_denshiken: purchaseNumberAuthResult.dnshKmTyp,
                        kbn_maeuriken: purchaseNumberAuthResult.znkkkytsknGkjknTyp,
                        kbn_kensyu: info.ykknshTyp,
                        sales_price: Number(info.knshknhmbiUnip),
                        app_price: Number(info.kijUnip),
                        kbn_eisyahousiki: info.eishhshkTyp,
                        title_code: purchaseModel.performanceCOA.titleCode,
                        title_branch_num: purchaseModel.performanceCOA.titleBranchNum
                    });
                    log('ムビチケチケットコード取得', ticket);
                    const validTicket = {
                        ykknshTyp: info.ykknshTyp,
                        eishhshkTyp: info.eishhshkTyp,
                        ykknKnshbtsmiNum: info.ykknKnshbtsmiNum,
                        knshknhmbiUnip: info.knshknhmbiUnip,
                        kijUnip: info.kijUnip,
                        dnshKmTyp: purchaseNumberAuthResult.dnshKmTyp,
                        znkkkytsknGkjknTyp: purchaseNumberAuthResult.znkkkytsknGkjknTyp // 全国共通券・劇場券区分
                    };
                    mvtkList.push({
                        code: purchaseNumberAuthResult.knyknrNo,
                        password: UtilModule.bace64Encode(input.password),
                        ykknInfo: validTicket,
                        ticket: ticket
                    });
                }
                if (purchaseNumberAuthResult.knyknrNoMkujyuCd !== undefined) {
                    validationList.push(purchaseNumberAuthResult.knyknrNo);
                }
            }
            // 認証エラーバリデーション
            if (validationList.length > 0) {
                res.locals.error = JSON.stringify(validationList);
                log('認証エラー');
                logger_1.default.error('SSKTS-APP:MvtkInputModule.select purchaseNumberAuthIn', purchaseNumberAuthIn);
                logger_1.default.error('SSKTS-APP:MvtkInputModule.select purchaseNumberAuthOut', purchaseNumberAuthResults);
                throw ErrorUtilModule.ERROR_VALIDATION;
            }
            req.session.mvtk = mvtkList;
            res.redirect('/purchase/mvtk/confirm');
        }
        catch (err) {
            if (err === ErrorUtilModule.ERROR_VALIDATION) {
                const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
                if (purchaseModel.reserveSeats === null || purchaseModel.transactionMP === null) {
                    next(new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_PROPERTY, undefined));
                    return;
                }
                res.locals.mvtkInfo = JSON.parse(req.body.mvtk);
                res.locals.transactionId = purchaseModel.transactionMP.id;
                res.locals.reserveSeatLength = purchaseModel.reserveSeats.list_tmp_reserve.length;
                res.render('purchase/mvtk/input', { layout: 'layouts/purchase/layout' });
                return;
            }
            const error = (err instanceof Error)
                ? new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message)
                : new ErrorUtilModule.CustomError(err, undefined);
            next(error);
            return;
        }
    });
}
exports.select = select;
