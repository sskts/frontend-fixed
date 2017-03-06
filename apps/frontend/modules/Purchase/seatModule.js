/**
 * 購入座席選択
 * @namespace Purchase.SeatModule
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
const GMO = require("@motionpicture/gmo-service");
const debug = require("debug");
const fs = require("fs-extra-promise");
const MP = require("../../../../libs/MP");
const SeatForm_1 = require("../../forms/Purchase/SeatForm");
const PurchaseSession = require("../../models/Purchase/PurchaseModel");
const debugLog = debug('SSKTS: ');
/**
 * 座席選択
 * @memberOf Purchase.SeatModule
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
    if (!req.params || !req.params.id)
        return next(new Error(req.__('common.error.access')));
    if (!purchaseModel.accessAuth(PurchaseSession.PurchaseModel.SEAT_STATE))
        return next(new Error(req.__('common.error.access')));
    //パフォーマンス取得
    MP.getPerformance({
        id: req.params.id
    }).then((result) => {
        if (!purchaseModel.transactionMP)
            return next(new Error(req.__('common.error.property')));
        res.locals.performance = result;
        res.locals.step = PurchaseSession.PurchaseModel.SEAT_STATE;
        res.locals.reserveSeats = null;
        res.locals.transactionId = purchaseModel.transactionMP.id;
        //仮予約中
        if (purchaseModel.reserveSeats) {
            debugLog('仮予約中');
            res.locals.reserveSeats = JSON.stringify(purchaseModel.reserveSeats);
        }
        purchaseModel.performance = result;
        //セッション更新
        if (!req.session)
            return next(new Error(req.__('common.error.property')));
        req.session.purchase = purchaseModel.toSession();
        res.locals.error = null;
        return res.render('purchase/seat');
    }).catch((err) => {
        return next(new Error(err.message));
    });
}
exports.index = index;
/**
 * 座席決定
 * @memberOf Purchase.SeatModule
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
    //バリデーション
    const form = SeatForm_1.default(req);
    form(req, res, () => {
        if (!req.form)
            return next(new Error(req.__('common.error.property')));
        if (req.form.isValid) {
            reserve(req, purchaseModel).then(() => {
                //セッション更新
                if (!req.session)
                    return next(new Error(req.__('common.error.property')));
                req.session.purchase = purchaseModel.toSession();
                //券種選択へ
                return res.redirect('/purchase/ticket');
            }).catch((err) => {
                return next(new Error(err.message));
            });
        }
        else {
            if (!req.params || !req.params.id)
                return next(new Error(req.__('common.error.access')));
            res.locals.transactionId = purchaseModel.transactionMP;
            res.locals.performance = purchaseModel.performance;
            res.locals.step = PurchaseSession.PurchaseModel.SEAT_STATE;
            res.locals.reserveSeats = req.body.seats;
            res.locals.error = req.form.getErrors();
            return res.render('purchase/seat');
        }
    });
}
exports.select = select;
/**
 * 座席仮予約
 * @memberOf Purchase.SeatModule
 * @function reserve
 * @param {express.Request} req
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {Promise<void>}
 */
function reserve(req, purchaseModel) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!purchaseModel.performance)
            throw new Error(req.__('common.error.property'));
        if (!purchaseModel.transactionMP)
            throw new Error(req.__('common.error.property'));
        const performance = purchaseModel.performance;
        //予約中
        if (purchaseModel.reserveSeats) {
            if (!purchaseModel.authorizationCOA)
                throw new Error(req.__('common.error.property'));
            const reserveSeats = purchaseModel.reserveSeats;
            //COA仮予約削除
            yield COA.ReserveService.delTmpReserve({
                theater_code: performance.attributes.theater.id,
                date_jouei: performance.attributes.day,
                title_code: performance.attributes.film.coa_title_code,
                title_branch_num: performance.attributes.film.coa_title_branch_num,
                time_begin: performance.attributes.time_start,
                tmp_reserve_num: reserveSeats.tmp_reserve_num
            });
            debugLog('COA仮予約削除');
            // COAオーソリ削除
            yield MP.removeCOAAuthorization({
                transactionId: purchaseModel.transactionMP.id,
                coaAuthorizationId: purchaseModel.authorizationCOA.id
            });
            debugLog('MPCOAオーソリ削除');
            if (purchaseModel.transactionGMO
                && purchaseModel.authorizationGMO) {
                //GMOオーソリ取消
                yield GMO.CreditService.alterTran({
                    shopId: process.env.GMO_SHOP_ID,
                    shopPass: process.env.GMO_SHOP_PASSWORD,
                    accessId: purchaseModel.transactionGMO.accessId,
                    accessPass: purchaseModel.transactionGMO.accessPass,
                    jobCd: GMO.Util.JOB_CD_VOID
                });
                debugLog('GMOオーソリ取消');
                // GMOオーソリ削除
                yield MP.removeGMOAuthorization({
                    transactionId: purchaseModel.transactionMP.id,
                    gmoAuthorizationId: purchaseModel.authorizationGMO.id
                });
                debugLog('GMOオーソリ削除');
            }
        }
        //COA仮予約
        const seats = JSON.parse(req.body.seats);
        purchaseModel.reserveSeats = yield COA.ReserveService.updTmpReserveSeat({
            theater_code: performance.attributes.theater.id,
            date_jouei: performance.attributes.day,
            title_code: performance.attributes.film.coa_title_code,
            title_branch_num: performance.attributes.film.coa_title_branch_num,
            time_begin: performance.attributes.time_start,
            // cnt_reserve_seat: number,
            screen_code: performance.attributes.screen.coa_screen_code,
            list_seat: seats.list_tmp_reserve
        });
        debugLog('COA仮予約', purchaseModel.reserveSeats);
        //予約チケット作成
        purchaseModel.reserveTickets = purchaseModel.reserveSeats.list_tmp_reserve.map((tmpReserve) => {
            return {
                section: tmpReserve.seat_section,
                seat_code: tmpReserve.seat_num,
                ticket_code: '',
                ticket_name_ja: '',
                ticket_name_en: '',
                ticket_name_kana: '',
                std_price: 0,
                add_price: 0,
                dis_price: 0,
                sale_price: 0
            };
        });
        //COAオーソリ追加
        const coaAuthorizationResult = yield MP.addCOAAuthorization({
            transaction: purchaseModel.transactionMP,
            reserveSeatsTemporarilyResult: purchaseModel.reserveSeats,
            salesTicketResults: purchaseModel.reserveTickets,
            performance: performance,
            totalPrice: purchaseModel.getReserveAmount()
        });
        debugLog('MPCOAオーソリ追加', coaAuthorizationResult);
        purchaseModel.authorizationCOA = coaAuthorizationResult;
    });
}
/**
 * スクリーン状態取得
 * @memberOf Purchase.SeatModule
 * @function getScreenStateReserve
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
// tslint:disable-next-line:variable-name
function getScreenStateReserve(req, res, _next) {
    getScreenData(req).then((result) => {
        res.json({
            err: null,
            result: result
        });
    }).catch((err) => {
        console.log(err);
        res.json({
            err: err,
            result: null
        });
    });
}
exports.getScreenStateReserve = getScreenStateReserve;
/**
 * スクリーン情報取得
 * @memberOf Purchase.SeatModule
 * @function getScreenStateReserve
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {Promise<ScreenData>}
 */
function getScreenData(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const num = 10;
        const screenCode = (Number(req.body.screen_code) < num)
            ? `0${req.body.screen_code}`
            : req.body.screen_code;
        const map = yield fs.readJSONAsync(`./apps/frontend/screens/${req.body.theater_code}/${screenCode}.json`);
        const setting = yield fs.readJSONAsync('./apps/frontend/screens/setting.json');
        const state = yield COA.ReserveService.stateReserveSeat(req.body);
        return {
            map: map,
            setting: setting,
            state: state
        };
    });
}
