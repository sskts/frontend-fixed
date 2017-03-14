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
const UtilModule = require("../../Util/UtilModule");
const debugLog = debug('SSKTS ');
/**
 * ムビチケ券入力ページ表示
 * @memberOf Purchase.Mvtk.MvtkInputModule
 * @function index
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
function index(req, res, next) {
    if (!req.session)
        return next(new Error(req.__('common.error.property')));
    const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
    if (!purchaseModel.transactionMP)
        return next(new Error(req.__('common.error.property')));
    if (!purchaseModel.reserveSeats)
        return next(new Error(req.__('common.error.property')));
    // ムビチケセッション削除
    delete req.session.mvtk;
    // 購入者情報入力表示
    res.locals.mvtkInfo = (process.env.NODE_ENV === 'development')
        ? [{ code: '3400999842', password: '7648' }]
        : [{ code: '', password: '' }];
    res.locals.step = PurchaseSession.PurchaseModel.TICKET_STATE;
    res.locals.transactionId = purchaseModel.transactionMP.id;
    res.locals.reserveSeatLength = purchaseModel.reserveSeats.list_tmp_reserve.length;
    return res.render('purchase/mvtk/input');
}
exports.index = index;
/**
 * 券種選択
 * @memberOf Purchase.Mvtk.MvtkInputModule
 * @function select
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
function select(req, res, next) {
    if (!req.session)
        return next(new Error(req.__('common.error.property')));
    const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
    if (!purchaseModel.transactionMP)
        return next(new Error(req.__('common.error.property')));
    //取引id確認
    if (req.body.transaction_id !== purchaseModel.transactionMP.id)
        return next(new Error(req.__('common.error.access')));
    const form = MvtkInputForm_1.default(req);
    form(req, res, () => {
        if (!req.form)
            return next(new Error(req.__('common.error.property')));
        if (req.form.isValid) {
            auth(req, purchaseModel).then((result) => {
                if (result) {
                    return res.redirect('/purchase/mvtk/confirm');
                }
                else {
                    // 認証エラー有効券無し
                    if (!purchaseModel.transactionMP)
                        return next(new Error(req.__('common.error.property')));
                    if (!purchaseModel.reserveSeats)
                        return next(new Error(req.__('common.error.property')));
                    //購入者情報入力表示
                    res.locals.mvtkInfo = mvtkValidation(req);
                    res.locals.step = PurchaseSession.PurchaseModel.TICKET_STATE;
                    res.locals.transactionId = purchaseModel.transactionMP.id;
                    res.locals.reserveSeatLength = purchaseModel.reserveSeats.list_tmp_reserve.length;
                    return res.render('purchase/mvtk/input');
                }
            }).catch((err) => {
                return next(new Error(err.message));
            });
        }
        else {
            if (!purchaseModel.transactionMP)
                return next(new Error(req.__('common.error.property')));
            if (!purchaseModel.reserveSeats)
                return next(new Error(req.__('common.error.property')));
            //購入者情報入力表示
            res.locals.mvtkInfo = JSON.parse(req.body.mvtk);
            res.locals.step = PurchaseSession.PurchaseModel.TICKET_STATE;
            res.locals.transactionId = purchaseModel.transactionMP.id;
            res.locals.reserveSeatLength = purchaseModel.reserveSeats.list_tmp_reserve.length;
            return res.render('purchase/mvtk/input');
        }
    });
}
exports.select = select;
/**
 * ムビチケ検証
 * @memberOf Purchase.Mvtk.MvtkInputModule
 * @function mvtkValidation
 * @param {express.Request} req
 * @returns {}
 */
function mvtkValidation(req) {
    const inputInfo = JSON.parse(req.body.mvtk);
    return inputInfo.map((input) => {
        const ticket = req.session.mvtk.find((value) => {
            return (input.code === value.code);
        });
        return {
            code: input.code,
            password: (ticket) ? input.password : '',
            error: (ticket) ? null : req.__('common.validation.mvtk')
        };
    });
}
/**
 * 認証
 * @memberOf Purchase.Mvtk.MvtkInputModule
 * @function auth
 * @param {express.Request} req
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {Promise<boolean>}
 */
function auth(req, purchaseModel) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!purchaseModel.performance)
            throw new Error(req.__('common.error.property'));
        if (!purchaseModel.performanceCOA)
            throw new Error(req.__('common.error.property'));
        const mvtkService = MVTK.createPurchaseNumberAuthService();
        const inputInfo = JSON.parse(req.body.mvtk);
        // サイトコード
        const siteCode = (process.env.NODE_ENV === 'development')
            ? '15'
            : String(Number(purchaseModel.performance.attributes.theater.id));
        // 作品コード
        const num = 10;
        const filmNo = (Number(purchaseModel.performanceCOA.titleBranchNum) < num)
            ? `${purchaseModel.performanceCOA.titleCode}0${purchaseModel.performanceCOA.titleBranchNum}`
            : `${purchaseModel.performanceCOA.titleCode}${purchaseModel.performanceCOA.titleBranchNum}`;
        const result = yield mvtkService.purchaseNumberAuth({
            kgygishCd: UtilModule.COMPANY_CODE,
            jhshbtsCd: MVTK.PurchaseNumberAuthUtilities.INFORMATION_TYPE_CODE_VALID,
            knyknrNoInfoIn: inputInfo.map((value) => {
                return {
                    KNYKNR_NO: value.code,
                    PIN_CD: value.password // PINコード
                };
            }),
            skhnCd: filmNo,
            stCd: siteCode,
            jeiYmd: moment(purchaseModel.performance.attributes.day).format('YYYY/MM/DD') //上映年月日
        });
        debugLog('ムビチケ認証');
        let isSuccess = true;
        const mvtkList = [];
        for (const purchaseNumberAuthResult of result) {
            if (purchaseNumberAuthResult.ykknInfo.length === 0)
                isSuccess = false;
            for (const info of purchaseNumberAuthResult.ykknInfo) {
                const input = inputInfo.find((value) => {
                    return (value.code === purchaseNumberAuthResult.knyknrNo);
                });
                if (!input)
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
