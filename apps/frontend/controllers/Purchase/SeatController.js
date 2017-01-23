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
        if (!this.req.query || !this.req.query['id'])
            return this.next(new Error('不適切なアクセスです'));
        this.transactionStart().then(() => {
            MP.getPerformance.call({
                id: this.req.query['id']
            }).then((result) => {
                this.res.locals['performance'] = result.data;
                this.res.locals['step'] = PurchaseSession.PurchaseModel.SEAT_STATE;
                this.res.locals['reserveSeats'] = null;
                if (this.purchaseModel.reserveSeats
                    && this.purchaseModel.performance
                    && this.purchaseModel.performance._id === this.req.query['id']) {
                    this.logger.debug('仮予約中');
                    this.res.locals['reserveSeats'] = JSON.stringify(this.purchaseModel.reserveSeats);
                }
                this.purchaseModel.performance = result.data;
                if (!this.req.session)
                    return this.next(new Error('session is undefined'));
                this.req.session['purchase'] = this.purchaseModel.formatToSession();
                this.res.render('purchase/seat');
            }, (err) => {
                return this.next(new Error(err.message));
            });
        }, (err) => {
            return this.next(new Error(err.message));
        });
    }
    transactionStart() {
        return __awaiter(this, void 0, void 0, function* () {
            let owner = yield MP.ownerAnonymousCreate.call();
            this.purchaseModel.owners = owner;
            let transactionMP = yield MP.transactionStart.call({
                owners: [config.get('admin_id'), owner._id]
            });
            this.purchaseModel.transactionMP = transactionMP;
        });
    }
    select() {
        SeatForm_1.default(this.req, this.res, () => {
            this.reserve().then(() => {
                if (!this.router)
                    return this.next(new Error('router is undefined'));
                if (!this.req.session)
                    return this.next(new Error('session is undefined'));
                this.req.session['purchase'] = this.purchaseModel.formatToSession();
                this.res.redirect(this.router.build('purchase.ticket', {}));
            }, (err) => {
                return this.next(new Error(err.message));
            });
        });
    }
    reserve() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.purchaseModel.performance)
                return this.next(new Error('performance is undefined'));
            if (!this.purchaseModel.transactionMP)
                return this.next(new Error('transactionMP is undefined'));
            if (!this.purchaseModel.owners)
                return this.next(new Error('owners is undefined'));
            let performance = this.purchaseModel.performance;
            if (this.purchaseModel.reserveSeats
                && this.purchaseModel.performance._id === this.req.query['id']) {
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
                    ownerId4administrator: config.get('admin_id'),
                    reserveSeatsTemporarilyResult: this.purchaseModel.reserveSeats,
                    addCOAAuthorizationResult: this.purchaseModel.performance
                });
                this.logger.debug('COAオーソリ削除');
                if (this.purchaseModel.transactionGMO
                    && this.purchaseModel.authorizationGMO
                    && this.purchaseModel.orderId) {
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
                        orderId: this.purchaseModel.orderId
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
            this.logger.debug('仮予約', this.purchaseModel.reserveSeats);
            let COAAuthorizationResult = yield MP.addCOAAuthorization.call({
                transaction: this.purchaseModel.transactionMP,
                ownerId4administrator: config.get('admin_id'),
                reserveSeatsTemporarilyResult: this.purchaseModel.reserveSeats,
                performance: performance
            });
            this.logger.debug('COAオーソリ追加', COAAuthorizationResult);
            this.purchaseModel.authorizationCOA = COAAuthorizationResult;
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SeatSelectController;
