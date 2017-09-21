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
const PurchaseModel_1 = require("../../../models/Purchase/PurchaseModel");
const MvtkUtilModule = require("../../Purchase/Mvtk/MvtkUtilModule");
const ErrorUtilModule = require("../../Util/ErrorUtilModule");
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
            throw ErrorUtilModule.ErrorType.Property;
        const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
        if (purchaseModel.isExpired())
            throw ErrorUtilModule.ErrorType.Expire;
        if (purchaseModel.transaction === null)
            throw ErrorUtilModule.ErrorType.Property;
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
        const error = (err instanceof Error) ? err : new ErrorUtilModule.AppError(err, undefined);
        next(error);
    }
}
exports.render = render;
/**
 * 券種選択
 * @memberof Purchase.Mvtk.MvtkInputModule
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
            next(new ErrorUtilModule.AppError(ErrorUtilModule.ErrorType.Property, undefined));
            return;
        }
        try {
            const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
            if (purchaseModel.isExpired())
                throw ErrorUtilModule.ErrorType.Expire;
            if (purchaseModel.transaction === null
                || purchaseModel.individualScreeningEvent === null)
                throw ErrorUtilModule.ErrorType.Property;
            //取引id確認
            if (req.body.transactionId !== purchaseModel.transaction.id)
                throw ErrorUtilModule.ErrorType.Access;
            MvtkInputForm_1.default(req);
            const validationResult = yield req.getValidationResult();
            if (!validationResult.isEmpty())
                throw ErrorUtilModule.ErrorType.Access;
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
                skhnCd: purchaseModel.getMvtkfilmCode(),
                stCd: `00${purchaseModel.individualScreeningEvent.coaInfo.theaterCode}`.slice(UtilModule.DIGITS['02']),
                jeiYmd: moment(purchaseModel.individualScreeningEvent.coaInfo.dateJouei).format('YYYY/MM/DD') //上映年月日
            };
            let purchaseNumberAuthResults;
            try {
                purchaseNumberAuthResults = yield mvtkService.purchaseNumberAuth(purchaseNumberAuthIn);
                log('ムビチケ認証', purchaseNumberAuthResults);
            }
            catch (err) {
                logger_1.default.error('SSKTS-APP:MvtkInputModule.select', `in: ${purchaseNumberAuthIn}`, `err: ${err}`);
                throw err;
            }
            if (purchaseNumberAuthResults === undefined)
                throw ErrorUtilModule.ErrorType.Property;
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
                    const ticket = yield COA.services.master.mvtkTicketcode({
                        theaterCode: purchaseModel.individualScreeningEvent.coaInfo.theaterCode,
                        kbnDenshiken: purchaseNumberAuthResult.dnshKmTyp,
                        kbnMaeuriken: purchaseNumberAuthResult.znkkkytsknGkjknTyp,
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
                throw ErrorUtilModule.ErrorType.Validation;
            }
            req.session.mvtk = mvtkList;
            res.redirect('/purchase/mvtk/confirm');
        }
        catch (err) {
            if (err === ErrorUtilModule.ErrorType.Validation) {
                const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
                res.locals.mvtkInfo = JSON.parse(req.body.mvtk);
                res.locals.purchaseModel = purchaseModel;
                res.locals.step = PurchaseModel_1.PurchaseModel.TICKET_STATE;
                res.render('purchase/mvtk/input', { layout: 'layouts/purchase/layout' });
                return;
            }
            const error = (err instanceof Error) ? err : new ErrorUtilModule.AppError(err, undefined);
            next(error);
        }
    });
}
exports.select = select;
