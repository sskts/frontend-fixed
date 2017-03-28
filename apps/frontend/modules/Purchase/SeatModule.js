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
Object.defineProperty(exports, "__esModule", { value: true });
const COA = require("@motionpicture/coa-service");
const GMO = require("@motionpicture/gmo-service");
const debug = require("debug");
const fs = require("fs-extra-promise");
const MP = require("../../../../libs/MP");
const SeatForm_1 = require("../../forms/Purchase/SeatForm");
const PurchaseSession = require("../../models/Purchase/PurchaseModel");
const ErrorUtilModule = require("../Util/ErrorUtilModule");
const UtilModule = require("../Util/UtilModule");
const debugLog = debug('SSKTS ');
/**
 * 座席選択
 * @memberOf Purchase.SeatModule
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
function index(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.session === undefined)
                throw ErrorUtilModule.ERROR_PROPERTY;
            const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
            if (!purchaseModel.accessAuth(PurchaseSession.PurchaseModel.SEAT_STATE)) {
                throw ErrorUtilModule.ERROR_ACCESS;
            }
            if (!Boolean(req.params.id))
                throw ErrorUtilModule.ERROR_ACCESS;
            if (purchaseModel.transactionMP === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            purchaseModel.performance = yield MP.getPerformance(req.params.id);
            debugLog('パフォーマンス取得');
            purchaseModel.theater = yield MP.getTheater(purchaseModel.performance.attributes.theater.id);
            debugLog('劇場詳細取得');
            purchaseModel.performanceCOA = yield MP.getPerformanceCOA(purchaseModel.performance.attributes.theater.id, purchaseModel.performance.attributes.screen.id, purchaseModel.performance.attributes.film.id);
            debugLog('COAパフォーマンス取得');
            res.locals.performance = purchaseModel.performance;
            res.locals.performanceCOA = purchaseModel.performanceCOA;
            res.locals.step = PurchaseSession.PurchaseModel.SEAT_STATE;
            res.locals.reserveSeats = (purchaseModel.reserveSeats !== null)
                ? JSON.stringify(purchaseModel.reserveSeats) //仮予約中
                : null;
            res.locals.transactionId = purchaseModel.transactionMP.id;
            res.locals.error = null;
            res.locals.prevLink = (purchaseModel.performance !== null)
                ? UtilModule.getTheaterUrl(purchaseModel.performance.attributes.theater.name.en)
                : UtilModule.getPortalUrl();
            //セッション更新
            req.session.purchase = purchaseModel.toSession();
            res.render('purchase/seat');
            return;
        }
        catch (err) {
            next(ErrorUtilModule.getError(req, err));
            return;
        }
    });
}
exports.index = index;
/**
 * 座席決定
 * @memberOf Purchase.SeatModule
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
            if (!Boolean(req.session.purchase))
                throw ErrorUtilModule.ERROR_EXPIRE;
            const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
            if (purchaseModel.transactionMP === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (!Boolean(req.params.id))
                throw ErrorUtilModule.ERROR_ACCESS;
            //取引id確認
            if (req.body.transaction_id !== purchaseModel.transactionMP.id)
                throw ErrorUtilModule.ERROR_ACCESS;
            //バリデーション
            SeatForm_1.default(req);
            const validationResult = yield req.getValidationResult();
            if (!validationResult.isEmpty()) {
                res.locals.transactionId = purchaseModel.transactionMP;
                res.locals.performance = purchaseModel.performance;
                res.locals.step = PurchaseSession.PurchaseModel.SEAT_STATE;
                res.locals.reserveSeats = req.body.seats;
                res.locals.error = validationResult.mapped();
                res.locals.prevLink = (purchaseModel.performance !== null)
                    ? UtilModule.getTheaterUrl(purchaseModel.performance.attributes.theater.name.en)
                    : UtilModule.getPortalUrl();
                res.render('purchase/seat');
                return;
            }
            const selectSeats = JSON.parse(req.body.seats).list_tmp_reserve;
            yield reserve(selectSeats, purchaseModel);
            //セッション更新
            req.session.purchase = purchaseModel.toSession();
            //券種選択へ
            res.redirect('/purchase/ticket');
            return;
        }
        catch (err) {
            next(ErrorUtilModule.getError(req, err));
            return;
        }
    });
}
exports.select = select;
/**
 * 座席仮予約
 * @memberOf Purchase.SeatModule
 * @function reserve
 * @param {ReserveSeats[]} reserveSeats
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {Promise<void>}
 */
function reserve(selectSeats, purchaseModel) {
    return __awaiter(this, void 0, void 0, function* () {
        if (purchaseModel.performance === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.transactionMP === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.performanceCOA === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        const performance = purchaseModel.performance;
        //予約中
        if (purchaseModel.reserveSeats !== null) {
            if (purchaseModel.authorizationCOA === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            const reserveSeats = purchaseModel.reserveSeats;
            //COA仮予約削除
            yield COA.ReserveService.delTmpReserve({
                theater_code: performance.attributes.theater.id,
                date_jouei: performance.attributes.day,
                title_code: purchaseModel.performanceCOA.titleCode,
                title_branch_num: purchaseModel.performanceCOA.titleBranchNum,
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
            if (purchaseModel.transactionGMO !== null
                && purchaseModel.authorizationGMO !== null) {
                if (purchaseModel.theater === null)
                    throw ErrorUtilModule.ERROR_PROPERTY;
                const gmoShopId = purchaseModel.theater.attributes.gmo_shop_id;
                const gmoShopPassword = purchaseModel.theater.attributes.gmo_shop_pass;
                //GMOオーソリ取消
                yield GMO.CreditService.alterTran({
                    shopId: gmoShopId,
                    shopPass: gmoShopPassword,
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
        purchaseModel.reserveSeats = yield COA.ReserveService.updTmpReserveSeat({
            theater_code: performance.attributes.theater.id,
            date_jouei: performance.attributes.day,
            title_code: purchaseModel.performanceCOA.titleCode,
            title_branch_num: purchaseModel.performanceCOA.titleBranchNum,
            time_begin: performance.attributes.time_start,
            // cnt_reserve_seat: number,
            screen_code: purchaseModel.performanceCOA.screenCode,
            list_seat: selectSeats
        });
        debugLog('COA仮予約', purchaseModel.reserveSeats);
        //予約チケット作成
        purchaseModel.reserveTickets = purchaseModel.reserveSeats.list_tmp_reserve.map((tmpReserve) => {
            return {
                section: tmpReserve.seat_section,
                seat_code: tmpReserve.seat_num,
                ticket_code: '',
                ticket_name: '',
                ticket_name_eng: '',
                ticket_name_kana: '',
                std_price: 0,
                add_price: 0,
                dis_price: 0,
                sale_price: 0,
                add_price_glasses: 0,
                glasses: false,
                mvtk_num: null
            };
        });
        //COAオーソリ追加
        const coaAuthorizationResult = yield MP.addCOAAuthorization({
            transaction: purchaseModel.transactionMP,
            reserveSeatsTemporarilyResult: purchaseModel.reserveSeats,
            salesTicketResults: purchaseModel.reserveTickets,
            performance: performance,
            performanceCOA: purchaseModel.performanceCOA,
            price: purchaseModel.getReserveAmount()
        });
        debugLog('MPCOAオーソリ追加', coaAuthorizationResult);
        purchaseModel.authorizationCOA = coaAuthorizationResult;
    });
}
/**
 * スクリーン状態取得
 * @memberOf Purchase.SeatModule
 * @function getScreenStateReserve
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<Response>}
 */
function getScreenStateReserve(req, res, 
    // tslint:disable-next-line:variable-name
    _next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const num = 10;
            const screenCode = (Number(req.body.screen_code) < num)
                ? `0${req.body.screen_code}`
                : req.body.screen_code;
            const screen = yield fs.readJSONAsync(`./apps/frontend/theaters/${req.body.theater_code}/${screenCode}.json`);
            const setting = yield fs.readJSONAsync('./apps/frontend/theaters/setting.json');
            const state = yield COA.ReserveService.stateReserveSeat(req.body);
            return res.json({
                err: null,
                result: {
                    screen: screen,
                    setting: setting,
                    state: state
                }
            });
        }
        catch (err) {
            return res.json({ err: err, result: null });
        }
    });
}
exports.getScreenStateReserve = getScreenStateReserve;
