"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const PurchaseController_1 = require("./PurchaseController");
const SeatForm_1 = require("../../forms/Purchase/SeatForm");
const PurchaseSession = require("../../models/Purchase/PurchaseModel");
const config = require("config");
const COA = require("@motionpicture/coa-service");
const MP = require("../../../../libs/MP");
const GMO = require("@motionpicture/gmo-service");
class SeatSelectController extends PurchaseController_1.default {
    index() {
        if (!this.req.params || !this.req.params['id'])
            return this.next(new Error(PurchaseController_1.default.ERROR_MESSAGE_ACCESS));
        if (!this.purchaseModel.accessAuth(PurchaseSession.PurchaseModel.SEAT_STATE))
            return this.next(new Error(PurchaseController_1.default.ERROR_MESSAGE_ACCESS));
        MP.getPerformance.call({
            id: this.req.params['id']
        }).then((result) => {
            this.res.locals['performance'] = result.data;
            this.res.locals['step'] = PurchaseSession.PurchaseModel.SEAT_STATE;
            this.res.locals['reserveSeats'] = null;
            if (this.purchaseModel.reserveSeats) {
                this.logger.debug('仮予約中');
                this.res.locals['reserveSeats'] = JSON.stringify(this.purchaseModel.reserveSeats);
            }
            this.purchaseModel.performance = result.data;
            if (!this.req.session)
                return this.next(new Error('session is undefined'));
            this.req.session['purchase'] = this.purchaseModel.formatToSession();
            return this.res.render('purchase/seat');
        }, (err) => {
            return this.next(new Error(err.message));
        });
    }
    select() {
        if (!this.transactionAuth())
            return this.next(new Error(PurchaseController_1.default.ERROR_MESSAGE_ACCESS));
        SeatForm_1.default(this.req, this.res, () => {
            this.reserve().then(() => {
                if (!this.router)
                    return this.next(new Error('router is undefined'));
                if (!this.req.session)
                    return this.next(new Error('session is undefined'));
                this.req.session['purchase'] = this.purchaseModel.formatToSession();
                return this.res.redirect(this.router.build('purchase.ticket', {}));
            }, (err) => {
                return this.next(new Error(err.message));
            });
        });
    }
    reserve() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.purchaseModel.performance)
                throw new Error('performance is undefined');
            if (!this.purchaseModel.transactionMP)
                throw new Error('transactionMP is undefined');
            if (!this.purchaseModel.owner)
                throw new Error('owners is undefined');
            if (!this.purchaseModel.administrator)
                throw new Error('administrator is undefined');
            let performance = this.purchaseModel.performance;
            if (this.purchaseModel.reserveSeats) {
                if (!this.purchaseModel.authorizationCOA)
                    throw new Error('authorizationCOA is undefined');
                let reserveSeats = this.purchaseModel.reserveSeats;
                yield COA.deleteTmpReserveInterface.call({
                    theater_code: performance.attributes.theater._id,
                    date_jouei: performance.attributes.day,
                    title_code: performance.attributes.film.coa_title_code,
                    title_branch_num: performance.attributes.film.coa_title_branch_num,
                    time_begin: performance.attributes.time_start,
                    tmp_reserve_num: String(reserveSeats.tmp_reserve_num),
                });
                this.logger.debug('COA仮予約削除');
                yield MP.removeCOAAuthorization.call({
                    transaction: this.purchaseModel.transactionMP,
                    ownerId4administrator: this.purchaseModel.administrator._id,
                    reserveSeatsTemporarilyResult: this.purchaseModel.reserveSeats,
                    addCOAAuthorizationResult: this.purchaseModel.authorizationCOA
                });
                this.logger.debug('MPCOAオーソリ削除');
                if (this.purchaseModel.transactionGMO
                    && this.purchaseModel.authorizationGMO) {
                    yield GMO.CreditService.alterTranInterface.call({
                        shop_id: config.get('gmo_shop_id'),
                        shop_pass: config.get('gmo_shop_password'),
                        access_id: this.purchaseModel.transactionGMO.access_id,
                        access_pass: this.purchaseModel.transactionGMO.access_pass,
                        job_cd: GMO.Util.JOB_CD_VOID
                    });
                    this.logger.debug('GMOオーソリ取消');
                    yield MP.removeGMOAuthorization.call({
                        transaction: this.purchaseModel.transactionMP,
                        addGMOAuthorizationResult: this.purchaseModel.authorizationGMO,
                    });
                    this.logger.debug('GMOオーソリ削除');
                }
            }
            let seats = JSON.parse(this.req.body.seats);
            this.purchaseModel.reserveSeats = yield COA.reserveSeatsTemporarilyInterface.call({
                theater_code: performance.attributes.theater._id,
                date_jouei: performance.attributes.day,
                title_code: performance.attributes.film.coa_title_code,
                title_branch_num: performance.attributes.film.coa_title_branch_num,
                time_begin: performance.attributes.time_start,
                screen_code: performance.attributes.screen.coa_screen_code,
                list_seat: seats,
            });
            this.logger.debug('COA仮予約', this.purchaseModel.reserveSeats);
            let salesTicketResult = yield COA.salesTicketInterface.call({
                theater_code: "001",
                date_jouei: "20170120",
                title_code: "8513",
                title_branch_num: "0",
                time_begin: "1010",
            });
            this.purchaseModel.reserveTickets = this.purchaseModel.reserveSeats.list_tmp_reserve.map((tmpReserve) => {
                return {
                    section: tmpReserve.seat_section,
                    seat_code: tmpReserve.seat_num,
                    ticket_code: salesTicketResult.list_ticket[0].ticket_code,
                    ticket_name_ja: salesTicketResult.list_ticket[0].ticket_name,
                    ticket_name_en: salesTicketResult.list_ticket[0].ticket_name_eng,
                    ticket_name_kana: salesTicketResult.list_ticket[0].ticket_name_kana,
                    std_price: salesTicketResult.list_ticket[0].std_price,
                    add_price: salesTicketResult.list_ticket[0].add_price,
                    dis_price: 0,
                    sale_price: salesTicketResult.list_ticket[0].sale_price,
                };
            });
            let COAAuthorizationResult = yield MP.addCOAAuthorization.call({
                transaction: this.purchaseModel.transactionMP,
                administratorOwnerId: this.purchaseModel.administrator._id,
                anonymousOwnerId: this.purchaseModel.owner._id,
                reserveSeatsTemporarilyResult: this.purchaseModel.reserveSeats,
                salesTicketResults: this.purchaseModel.reserveTickets,
                performance: performance,
                totalPrice: this.purchaseModel.getReserveAmount()
            });
            this.logger.debug('MPCOAオーソリ追加', COAAuthorizationResult);
            this.purchaseModel.authorizationCOA = COAAuthorizationResult;
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SeatSelectController;
