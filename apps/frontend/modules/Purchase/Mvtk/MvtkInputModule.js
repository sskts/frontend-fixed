/**
 * ムビチケ入力
 * @namespace Purchase.Mvtk.MvtkInputModule
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
const MVTK = require("@motionpicture/mvtk-service");
const debug = require("debug");
const moment = require("moment");
const MvtkInputForm_1 = require("../../../forms/Purchase/Mvtk/MvtkInputForm");
const PurchaseSession = require("../../../models/Purchase/PurchaseModel");
const MvtkUtilModule = require("../../Purchase/Mvtk/MvtkUtilModule");
const ErrorUtilModule = require("../../Util/ErrorUtilModule");
const UtilModule = require("../../Util/UtilModule");
const log = debug('SSKTS');
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
        if (purchaseModel.transactionMP === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.reserveSeats === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        // ムビチケセッション削除
        delete req.session.mvtk;
        // 購入者情報入力表示
        res.locals.mvtkInfo = (process.env.NODE_ENV === 'development')
            ? [{ code: '3400999842', password: '7648' }]
            : [{ code: '', password: '' }];
        res.locals.step = PurchaseSession.PurchaseModel.TICKET_STATE;
        res.locals.transactionId = purchaseModel.transactionMP.id;
        res.locals.reserveSeatLength = purchaseModel.reserveSeats.list_tmp_reserve.length;
        res.locals.error = null;
        res.render('purchase/mvtk/input');
        return;
    }
    catch (err) {
        next(ErrorUtilModule.getError(req, err));
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
function select(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.session === undefined)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (req.session.purchase === undefined)
                throw ErrorUtilModule.ERROR_EXPIRE;
            const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
            if (purchaseModel.transactionMP === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (purchaseModel.reserveSeats === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            //取引id確認
            if (req.body.transaction_id !== purchaseModel.transactionMP.id) {
                throw ErrorUtilModule.ERROR_ACCESS;
            }
            MvtkInputForm_1.default(req);
            const validationResult = yield req.getValidationResult();
            if (!validationResult.isEmpty()) {
                //購入者情報入力表示
                res.locals.error = validationResult.mapped();
                res.locals.mvtkInfo = JSON.parse(req.body.mvtk);
                res.locals.step = PurchaseSession.PurchaseModel.TICKET_STATE;
                res.locals.transactionId = purchaseModel.transactionMP.id;
                res.locals.reserveSeatLength = purchaseModel.reserveSeats.list_tmp_reserve.length;
                res.render('purchase/mvtk/input');
                return;
            }
            const authResult = yield auth(req, purchaseModel);
            if (authResult) {
                res.redirect('/purchase/mvtk/confirm');
                return;
            }
            else {
                //購入者情報入力表示
                res.locals.error = null;
                res.locals.mvtkInfo = mvtkValidation(req);
                res.locals.step = PurchaseSession.PurchaseModel.TICKET_STATE;
                res.locals.transactionId = purchaseModel.transactionMP.id;
                res.locals.reserveSeatLength = purchaseModel.reserveSeats.list_tmp_reserve.length;
                res.render('purchase/mvtk/input');
                return;
            }
        }
        catch (err) {
            next(ErrorUtilModule.getError(req, err));
            return;
        }
    });
}
exports.select = select;
/**
 * ムビチケ検証
 * @memberOf Purchase.Mvtk.MvtkInputModule
 * @function mvtkValidation
 * @param {Request} req
 * @returns {InputInfo[]}
 */
function mvtkValidation(req) {
    const inputInfo = JSON.parse(req.body.mvtk);
    return inputInfo.map((input) => {
        const mvtk = req.session.mvtk;
        const ticket = mvtk.find((value) => {
            return (input.code === value.code);
        });
        return {
            code: input.code,
            password: (ticket !== undefined) ? input.password : '',
            error: (ticket !== undefined) ? null : req.__('common.validation.mvtk')
        };
    });
}
/**
 * 認証
 * @memberOf Purchase.Mvtk.MvtkInputModule
 * @function auth
 * @param {Request} req
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {Promise<boolean>}
 */
function auth(req, purchaseModel) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.session === undefined)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.performance === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.performanceCOA === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        const mvtkService = MVTK.createPurchaseNumberAuthService();
        const inputInfo = JSON.parse(req.body.mvtk);
        const result = yield mvtkService.purchaseNumberAuth({
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
        });
        log('ムビチケ認証', result);
        let isSuccess = true;
        const mvtkList = [];
        for (const purchaseNumberAuthResult of result) {
            if (purchaseNumberAuthResult.ykknInfo.length === 0)
                isSuccess = false;
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
                mvtkList.push({
                    code: purchaseNumberAuthResult.knyknrNo,
                    password: UtilModule.bace64Encode(input.password),
                    ykknInfo: info,
                    ticket: ticket
                });
            }
        }
        req.session.mvtk = mvtkList;
        return isSuccess;
    });
}
exports.auth = auth;
