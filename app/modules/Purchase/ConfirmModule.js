/**
 * 購入確認
 * @namespace Purchase.ConfirmModule
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
const MVTK = require("@motionpicture/mvtk-service");
const debug = require("debug");
const moment = require("moment");
const MP = require("../../../libs/MP");
const logger_1 = require("../../middlewares/logger");
const PurchaseSession = require("../../models/Purchase/PurchaseModel");
const ErrorUtilModule = require("../Util/ErrorUtilModule");
const UtilModule = require("../Util/UtilModule");
const MvtkUtilModule = require("./Mvtk/MvtkUtilModule");
const log = debug('SSKTS');
/**
 * 購入者内容確認
 * @memberOf Purchase.ConfirmModule
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
            if (req.session.purchase === undefined)
                throw ErrorUtilModule.ERROR_EXPIRE;
            const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
            if (purchaseModel.isExpired())
                throw ErrorUtilModule.ERROR_EXPIRE;
            if (!purchaseModel.accessAuth(PurchaseSession.PurchaseModel.CONFIRM_STATE)) {
                throw ErrorUtilModule.ERROR_EXPIRE;
            }
            if (purchaseModel.transactionMP === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (purchaseModel.theater === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            const website = purchaseModel.theater.attributes.websites.find((value) => {
                return (value.group === 'PORTAL');
            });
            //購入者内容確認表示
            res.locals.gmoTokenObject = (purchaseModel.gmo !== null) ? purchaseModel.gmo : null;
            res.locals.input = purchaseModel.input;
            res.locals.performance = purchaseModel.performance;
            res.locals.reserveSeats = purchaseModel.reserveSeats;
            res.locals.reserveTickets = purchaseModel.reserveTickets;
            res.locals.step = PurchaseSession.PurchaseModel.CONFIRM_STATE;
            res.locals.price = purchaseModel.getReserveAmount();
            res.locals.updateReserve = null;
            res.locals.error = null;
            res.locals.transactionId = purchaseModel.transactionMP.id;
            res.locals.portalTheaterSite = (website !== undefined) ? website.url : UtilModule.getPortalUrl();
            //セッション更新
            req.session.purchase = purchaseModel.toSession();
            res.render('purchase/confirm', { layout: 'layouts/purchase/layout' });
            return;
        }
        catch (err) {
            const error = (err instanceof Error)
                ? new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message)
                : new ErrorUtilModule.CustomError(err, undefined);
            next(error);
            return;
        }
    });
}
exports.index = index;
/**
 * ムビチケ決済
 * @memberOf Purchase.ConfirmModule
 * @function reserveMvtk
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {Promise<void>}
 */
function reserveMvtk(purchaseModel) {
    return __awaiter(this, void 0, void 0, function* () {
        if (purchaseModel.reserveTickets === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.reserveSeats === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.performance === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.mvtk === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.performanceCOA === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.transactionMP === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        // 購入管理番号情報
        const mvtk = yield createMvtkInfo(purchaseModel.reserveTickets, purchaseModel.mvtk);
        const mvtkTickets = mvtk.tickets;
        const mvtkSeats = mvtk.seats;
        log('購入管理番号情報', mvtkTickets);
        if (mvtkTickets.length === 0 || mvtkSeats.length === 0)
            throw ErrorUtilModule.ERROR_ACCESS;
        const mvtkFilmCode = MvtkUtilModule.getfilmCode(purchaseModel.performanceCOA.titleCode, purchaseModel.performanceCOA.titleBranchNum);
        // 興行会社ユーザー座席予約番号(予約番号)
        const startDate = {
            day: `${moment(purchaseModel.performance.attributes.day).format('YYYY/MM/DD')}`,
            time: `${UtilModule.timeFormat(purchaseModel.performance.attributes.time_start)}:00`
        };
        const seatInfoSyncService = MVTK.createSeatInfoSyncService();
        const seatInfoSyncIn = {
            kgygishCd: MvtkUtilModule.COMPANY_CODE,
            yykDvcTyp: MVTK.SeatInfoSyncUtilities.RESERVED_DEVICE_TYPE_ENTERTAINER_SITE_PC,
            trkshFlg: MVTK.SeatInfoSyncUtilities.DELETE_FLAG_FALSE,
            kgygishSstmZskyykNo: `${purchaseModel.performance.attributes.day}${purchaseModel.reserveSeats.tmp_reserve_num}`,
            kgygishUsrZskyykNo: String(purchaseModel.reserveSeats.tmp_reserve_num),
            jeiDt: `${startDate.day} ${startDate.time}`,
            kijYmd: startDate.day,
            stCd: MvtkUtilModule.getSiteCode(purchaseModel.performance.attributes.theater.id),
            screnCd: purchaseModel.performanceCOA.screenCode,
            knyknrNoInfo: mvtkTickets,
            zskInfo: mvtkSeats,
            skhnCd: mvtkFilmCode // 作品コード
        };
        try {
            const seatInfoSyncInResult = yield seatInfoSyncService.seatInfoSync(seatInfoSyncIn);
            if (seatInfoSyncInResult.zskyykResult !== MVTK.SeatInfoSyncUtilities.RESERVATION_SUCCESS)
                throw ErrorUtilModule.ERROR_ACCESS;
        }
        catch (err) {
            logger_1.default.error('SSKTS-APP:ConfirmModule.reserveMvtk In', seatInfoSyncIn);
            logger_1.default.error('SSKTS-APP:ConfirmModule.reserveMvtk Out', err);
            throw err;
        }
        log('MVTKムビチケ着券');
        log('GMO', purchaseModel.getReserveAmount());
        log('MVTK', purchaseModel.getMvtkPrice());
        log('FULL', purchaseModel.getPrice());
        yield MP.authorizationsMvtk({
            transaction: purchaseModel.transactionMP,
            amount: purchaseModel.getMvtkPrice(),
            kgygishCd: MvtkUtilModule.COMPANY_CODE,
            yykDvcTyp: MVTK.SeatInfoSyncUtilities.RESERVED_DEVICE_TYPE_ENTERTAINER_SITE_PC,
            trkshFlg: MVTK.SeatInfoSyncUtilities.DELETE_FLAG_FALSE,
            kgygishSstmZskyykNo: `${purchaseModel.performance.attributes.day}${purchaseModel.reserveSeats.tmp_reserve_num}`,
            kgygishUsrZskyykNo: String(purchaseModel.reserveSeats.tmp_reserve_num),
            jeiDt: `${startDate.day} ${startDate.time}`,
            kijYmd: startDate.day,
            stCd: MvtkUtilModule.getSiteCode(purchaseModel.performance.attributes.theater.id),
            screnCd: purchaseModel.performanceCOA.screenCode,
            knyknrNoInfo: mvtkTickets,
            zskInfo: mvtkSeats,
            skhnCd: mvtkFilmCode // 作品コード
        });
        log('MPムビチケオーソリ追加');
    });
}
/**
 * ムビチケ情報生成
 * @memberOf Purchase.ConfirmModule
 * @function cancelMvtk
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {{ tickets: MP.IMvtkPurchaseNoInfo[], seats: MP.IMvtkSeat[] }}
 */
function createMvtkInfo(reserveTickets, mvtkInfo) {
    const seats = [];
    const tickets = [];
    for (const reserveTicket of reserveTickets) {
        const mvtk = mvtkInfo.find((value) => {
            return (value.code === reserveTicket.mvtk_num && value.ticket.ticket_code === reserveTicket.ticket_code);
        });
        if (mvtk === undefined)
            continue;
        const mvtkTicket = tickets.find((value) => (value.KNYKNR_NO === mvtk.code));
        if (mvtkTicket !== undefined) {
            // 券種追加
            const tcket = mvtkTicket.KNSH_INFO.find((value) => (value.KNSH_TYP === mvtk.ykknInfo.ykknshTyp));
            if (tcket !== undefined) {
                // 枚数追加
                tcket.MI_NUM = String(Number(tcket.MI_NUM) + 1);
            }
            else {
                // 新規券種作成
                mvtkTicket.KNSH_INFO.push({
                    KNSH_TYP: mvtk.ykknInfo.ykknshTyp,
                    MI_NUM: '1' //枚数
                });
            }
        }
        else {
            // 新規購入番号作成
            tickets.push({
                KNYKNR_NO: mvtk.code,
                PIN_CD: UtilModule.base64Decode(mvtk.password),
                KNSH_INFO: [
                    {
                        KNSH_TYP: mvtk.ykknInfo.ykknshTyp,
                        MI_NUM: '1' //枚数
                    }
                ]
            });
        }
        seats.push({ ZSK_CD: reserveTicket.seat_code });
    }
    return {
        tickets: tickets,
        seats: seats
    };
}
/**
 * ムビチケ決済取り消し
 * @memberOf Purchase.ConfirmModule
 * @function cancelMvtk
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
function cancelMvtk(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.session === undefined)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (req.session.purchase === undefined)
            throw ErrorUtilModule.ERROR_EXPIRE;
        const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
        if (purchaseModel.performance === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.mvtk === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.performanceCOA === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.reserveTickets === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.reserveSeats === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        // 購入管理番号情報
        const mvtk = yield createMvtkInfo(purchaseModel.reserveTickets, purchaseModel.mvtk);
        const mvtkTickets = mvtk.tickets;
        const mvtkSeats = mvtk.seats;
        log('購入管理番号情報', mvtkTickets);
        if (mvtkTickets.length === 0 || mvtkSeats.length === 0)
            throw ErrorUtilModule.ERROR_ACCESS;
        const mvtkFilmCode = MvtkUtilModule.getfilmCode(purchaseModel.performanceCOA.titleCode, purchaseModel.performanceCOA.titleBranchNum);
        // 興行会社ユーザー座席予約番号(予約番号)
        const startDate = {
            day: `${moment(purchaseModel.performance.attributes.day).format('YYYY/MM/DD')}`,
            time: `${UtilModule.timeFormat(purchaseModel.performance.attributes.time_start)}:00`
        };
        const seatInfoSyncService = MVTK.createSeatInfoSyncService();
        const seatInfoSyncIn = {
            kgygishCd: MvtkUtilModule.COMPANY_CODE,
            yykDvcTyp: MVTK.SeatInfoSyncUtilities.RESERVED_DEVICE_TYPE_ENTERTAINER_SITE_PC,
            trkshFlg: MVTK.SeatInfoSyncUtilities.DELETE_FLAG_TRUE,
            kgygishSstmZskyykNo: `${purchaseModel.performance.attributes.day}${purchaseModel.reserveSeats.tmp_reserve_num}`,
            kgygishUsrZskyykNo: String(purchaseModel.reserveSeats.tmp_reserve_num),
            jeiDt: `${startDate.day} ${startDate.time}`,
            kijYmd: startDate.day,
            stCd: MvtkUtilModule.getSiteCode(purchaseModel.performance.attributes.theater.id),
            screnCd: purchaseModel.performanceCOA.screenCode,
            knyknrNoInfo: mvtkTickets,
            zskInfo: mvtkSeats,
            skhnCd: mvtkFilmCode // 作品コード
        };
        let result = true;
        try {
            const seatInfoSyncInResult = yield seatInfoSyncService.seatInfoSync(seatInfoSyncIn);
            if (seatInfoSyncInResult.zskyykResult !== MVTK.SeatInfoSyncUtilities.RESERVATION_CANCEL_SUCCESS)
                throw ErrorUtilModule.ERROR_ACCESS;
        }
        catch (err) {
            result = false;
            logger_1.default.error('SSKTS-APP:ConfirmModule.reserveMvtk In', seatInfoSyncIn);
            logger_1.default.error('SSKTS-APP:ConfirmModule.reserveMvtk Out', err);
        }
        //購入セッション削除
        delete req.session.purchase;
        //ムビチケセッション削除
        delete req.session.mvtk;
        log('MVTKムビチケ着券削除');
        res.json({ isSuccess: result });
    });
}
exports.cancelMvtk = cancelMvtk;
/**
 * 購入確定
 * @memberOf Purchase.ConfirmModule
 * @function purchase
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<Response>}
 * @description フロー(本予約成功、本予約失敗、購入期限切れ)
 */
// tslint:disable-next-line:variable-name
function purchase(req, res, _next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.session === undefined)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (req.session.purchase === undefined)
                throw ErrorUtilModule.ERROR_EXPIRE;
            const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
            if (purchaseModel.transactionMP === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (purchaseModel.performance === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (purchaseModel.performanceCOA === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (purchaseModel.reserveSeats === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (purchaseModel.reserveTickets === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (purchaseModel.input === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            //取引id確認
            if (req.body.transaction_id !== purchaseModel.transactionMP.id)
                throw ErrorUtilModule.ERROR_ACCESS;
            //購入期限切れ
            const minutes = 5;
            if (purchaseModel.expired < moment().add(minutes, 'minutes').unix()) {
                log('購入期限切れ');
                //購入セッション削除
                delete req.session.purchase;
                throw ErrorUtilModule.ERROR_EXPIRE;
            }
            // COA本予約
            // purchaseModel.updateReserve = await COA.ReserveService.updReserve({
            //     theater_code: purchaseModel.performance.attributes.theater.id,
            //     date_jouei: purchaseModel.performance.attributes.day,
            //     title_code: purchaseModel.performanceCOA.titleCode,
            //     title_branch_num: purchaseModel.performanceCOA.titleBranchNum,
            //     time_begin: purchaseModel.performance.attributes.time_start,
            //     tmp_reserve_num: purchaseModel.reserveSeats.tmp_reserve_num,
            //     reserve_name: `${purchaseModel.input.last_name_hira}　${purchaseModel.input.first_name_hira}`,
            //     reserve_name_jkana: `${purchaseModel.input.last_name_hira}　${purchaseModel.input.first_name_hira}`,
            //     tel_num: purchaseModel.input.tel_num,
            //     mail_addr: purchaseModel.input.mail_addr,
            //     reserve_amount: purchaseModel.getReserveAmount(),
            //     list_ticket: purchaseModel.reserveTickets.map((ticket) => {
            //         let mvtkTicket: PurchaseSession.IMvtk | undefined;
            //         if (purchaseModel.mvtk !== null) {
            //             mvtkTicket = purchaseModel.mvtk.find((value) => {
            //                 return (value.code === ticket.mvtk_num && value.ticket.ticket_code === ticket.ticket_code);
            //             });
            //         }
            //         return {
            //             ticket_code: ticket.ticket_code,
            //             std_price: ticket.std_price,
            //             add_price: ticket.add_price,
            //             dis_price: 0,
            //             sale_price: (ticket.std_price + ticket.add_price),
            //             ticket_count: 1,
            //             mvtk_app_price: ticket.mvtk_app_price,
            //             seat_num: ticket.seat_code,
            //             add_glasses: (ticket.glasses) ? ticket.add_price_glasses : 0,
            //             kbn_eisyahousiki: (mvtkTicket !== undefined) ? mvtkTicket.ykknInfo.eishhshkTyp : '00'
            //         };
            //     })
            // });
            // log('COA本予約', purchaseModel.updateReserve);
            // ムビチケ使用
            if (purchaseModel.mvtk !== null) {
                yield reserveMvtk(purchaseModel);
                log('ムビチケ決済');
            }
            // MP取引成立
            yield MP.transactionClose({
                transactionId: purchaseModel.transactionMP.id
            });
            log('MP取引成立');
            //購入情報をセッションへ
            req.session.complete = {
                performance: purchaseModel.performance,
                input: purchaseModel.input,
                reserveSeats: purchaseModel.reserveSeats,
                reserveTickets: purchaseModel.reserveTickets,
                price: purchaseModel.getReserveAmount()
            };
            //購入セッション削除
            delete req.session.purchase;
            //購入完了情報を返す
            return res.json({ err: null, result: req.session.complete });
        }
        catch (err) {
            log('ERROR', err);
            let msg;
            if (err === ErrorUtilModule.ERROR_PROPERTY) {
                msg = req.__('common.error.property');
            }
            else if (err === ErrorUtilModule.ERROR_ACCESS) {
                msg = req.__('common.error.access');
            }
            else if (err === ErrorUtilModule.ERROR_EXPIRE) {
                msg = req.__('common.error.expire');
            }
            else {
                msg = err.message;
            }
            return res.json({ err: msg, result: null });
        }
    });
}
exports.purchase = purchase;
/**
 * 完了情報取得
 * @function getCompleteData
 * @returns {Response}
 */
// tslint:disable-next-line:variable-name
function getCompleteData(req, res, _next) {
    try {
        if (req.session === undefined)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (req.session.complete === undefined)
            throw ErrorUtilModule.ERROR_EXPIRE;
        return res.json({ err: null, result: req.session.complete });
    }
    catch (err) {
        let msg;
        if (err === ErrorUtilModule.ERROR_PROPERTY) {
            msg = req.__('common.error.property');
        }
        else if (err === ErrorUtilModule.ERROR_ACCESS) {
            msg = req.__('common.error.access');
        }
        else if (err === ErrorUtilModule.ERROR_EXPIRE) {
            msg = req.__('common.error.expire');
        }
        else {
            msg = err.message;
        }
        return res.json({ err: msg, result: null });
    }
}
exports.getCompleteData = getCompleteData;
