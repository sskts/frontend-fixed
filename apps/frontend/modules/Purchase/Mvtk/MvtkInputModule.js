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
const COA = require("@motionpicture/coa-service");
const MVTK = require("@motionpicture/mvtk-service");
const debug = require("debug");
const moment = require("moment");
const MvtkInputForm_1 = require("../../../forms/Purchase/Mvtk/MvtkInputForm");
const PurchaseSession = require("../../../models/Purchase/PurchaseModel");
const Util = require("../../Util/UtilModule");
const debugLog = debug('SSKTS: ');
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
    res.locals.error = null;
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
            auth(req, purchaseModel).then(() => {
                return res.redirect('/purchase/mvtk/confirm');
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
            res.locals.error = null;
            res.locals.step = PurchaseSession.PurchaseModel.TICKET_STATE;
            res.locals.transactionId = purchaseModel.transactionMP.id;
            res.locals.reserveSeatLength = purchaseModel.reserveSeats.list_tmp_reserve.length;
            return res.render('purchase/mvtk/input');
        }
    });
}
exports.select = select;
/**
 * 認証
 * @memberOf Purchase.Mvtk.MvtkInputModule
 * @function auth
 * @param {express.Request} req
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {Promise<void>}
 */
function auth(req, purchaseModel) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!purchaseModel.performance)
            throw new Error(req.__('common.error.property'));
        const mvtkService = MVTK.createPurchaseNumberAuthService();
        const inputInfo = JSON.parse(req.body.mvtk);
        const siteCode = (process.env.NODE_ENV === 'dev')
            ? '15'
            : String(Number(purchaseModel.performance.attributes.theater.id));
        const num = 10;
        const branchNo = (Number(purchaseModel.performance.attributes.film.coa_title_branch_num) < num)
            ? '0' + purchaseModel.performance.attributes.film.coa_title_branch_num
            : purchaseModel.performance.attributes.film.coa_title_branch_num;
        const result = yield mvtkService.purchaseNumberAuth({
            kgygishCd: 'SSK000',
            jhshbtsCd: '1',
            knyknrNoInfoIn: inputInfo.map((value) => {
                return {
                    KNYKNR_NO: value.code,
                    PIN_CD: value.password // PINコード
                };
            }),
            skhnCd: purchaseModel.performance.attributes.film.coa_title_code + branchNo,
            stCd: siteCode,
            jeiYmd: moment(purchaseModel.performance.attributes.day).format('YYYY/MM/DD') //上映年月日
        });
        debugLog('ムビチケ認証');
        const mvtkList = [];
        for (const purchaseNumberAuthResult of result) {
            for (const info of purchaseNumberAuthResult.ykknInfo) {
                const input = inputInfo.find((value) => {
                    return (value.code === purchaseNumberAuthResult.knyknrNo);
                });
                if (!input)
                    continue;
                const ticketType = MVTK.Constants.TICKET_TYPE.find((value) => {
                    return (value.code === info.ykknshTyp);
                });
                if (!ticketType)
                    continue;
                // ムビチケチケットコード取得
                const ticketCode = yield COA.MasterService.mvtkTicketcode({
                    theater_code: purchaseModel.performance.attributes.theater.id,
                    kbn_denshiken: MVTK.Constants.ELECTRONIC_TICKET_ELECTRONIC,
                    kbn_maeuriken: MVTK.Constants.ADVANCE_TICKET_COMMON,
                    kbn_kensyu: info.ykknshTyp,
                    sales_price: Number(info.knshknhmbiUnip),
                    app_price: Number(info.kijUnip)
                });
                mvtkList.push({
                    code: purchaseNumberAuthResult.knyknrNo,
                    password: Util.bace64Encode(input.password),
                    ykknInfo: info,
                    ticketCode: ticketCode,
                    ticketName: ticketType.name
                });
            }
        }
        req.session.mvtk = mvtkList;
    });
}
exports.auth = auth;
