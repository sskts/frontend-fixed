/**
 * ムビチケ入力
 * @namespace Purchase.Mvtk.MvtkInputModule
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MVTK = require("@motionpicture/mvtk-service");
const moment = require("moment");
const MvtkInputForm_1 = require("../../../forms/Purchase/Mvtk/MvtkInputForm");
const PurchaseSession = require("../../../models/Purchase/PurchaseModel");
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
    //購入者情報入力表示
    res.locals.error = null;
    res.locals.step = PurchaseSession.PurchaseModel.TICKET_STATE;
    res.locals.transactionId = purchaseModel.transactionMP.id;
    res.locals.reserveSeatLength = purchaseModel.reserveSeats.list_tmp_reserve.length;
    return res.render('purchase/mvtk/input');
}
exports.index = index;
/**
 * 認証
 * @memberOf Purchase.Mvtk.MvtkInputModule
 * @function auth
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
function auth(req, res, next) {
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
            if (!purchaseModel.performance)
                return next(new Error(req.__('common.error.property')));
            const mvtkService = MVTK.createPurchaseNumberAuthService();
            mvtkService.purchaseNumberAuth({
                kgygishCd: 'SSK000',
                jhshbtsCd: '1',
                knyknrNoInfoIn: req.body.mvtk.map((value) => {
                    return {
                        KNYKNR_NO: value.code,
                        PIN_CD: value.password // PINコード
                    };
                }),
                skhnCd: purchaseModel.performance.attributes.film.coa_title_code + '00',
                stCd: '18',
                jeiYmd: moment(purchaseModel.performance.attributes.day).format('YYYY/MM/DD') //上映年月日
            }).then((result) => {
                console.log(result);
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
exports.auth = auth;
