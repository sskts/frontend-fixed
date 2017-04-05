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
const MP = require("../../../../libs/MP");
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
            next(ErrorUtilModule.getError(req, err));
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
        const mvtkSeats = [];
        const mvtkTickets = [];
        for (const reserveTicket of purchaseModel.reserveTickets) {
            const mvtk = purchaseModel.mvtk.find((value) => {
                return (value.code === reserveTicket.mvtk_num && value.ticket.ticket_code === reserveTicket.ticket_code);
            });
            if (mvtk === undefined)
                continue;
            const mvtkTicket = mvtkTickets.find((value) => {
                return (value.KNYKNR_NO === mvtk.code);
            });
            if (mvtkTicket !== undefined) {
                // 券種追加
                const tcket = mvtkTicket.KNSH_INFO.find((value) => {
                    return (value.KNSH_TYP === mvtk.ykknInfo.ykknshTyp);
                });
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
                mvtkTickets.push({
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
            mvtkSeats.push({ ZSK_CD: reserveTicket.seat_code });
        }
        log('購入管理番号情報', mvtkTickets);
        if (mvtkTickets.length === 0 || mvtkSeats.length === 0)
            return;
        const mvtkFilmCode = MvtkUtilModule.getfilmCode(purchaseModel.performanceCOA.titleCode, purchaseModel.performanceCOA.titleBranchNum);
        // 興行会社ユーザー座席予約番号(予約番号)
        const startDate = {
            day: `${moment(purchaseModel.performance.attributes.day).format('YYYY/MM/DD')}`,
            time: `${UtilModule.timeFormat(purchaseModel.performance.attributes.time_start)}:00`
        };
        const seatInfoSyncService = MVTK.createSeatInfoSyncService();
        const result = yield seatInfoSyncService.seatInfoSync({
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
        if (result.zskyykResult !== MVTK.SeatInfoSyncUtilities.RESERVATION_SUCCESS)
            throw ErrorUtilModule.ERROR_PROPERTY;
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
        // todo
        log('MPムビチケオーソリ追加');
    });
}
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
                throw ErrorUtilModule.ERROR_ACCESS;
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
            //購入セッション削除
            delete req.session.purchase;
            const msg = ErrorUtilModule.getError(req, err).message;
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
        const msg = ErrorUtilModule.getError(req, err).message;
        return res.json({ err: msg, result: null });
    }
}
exports.getCompleteData = getCompleteData;
