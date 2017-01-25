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
const config = require("config");
const COA = require("@motionpicture/coa-service");
const MP = require("../../../../libs/MP");
const GMO = require("@motionpicture/gmo-service");
class OverlapController extends PurchaseController_1.default {
    index() {
        if (!this.req.params || !this.req.params['id'])
            return this.next(new Error(PurchaseController_1.default.ERROR_MESSAGE_ACCESS));
        MP.getPerformance.call({
            id: this.req.params['id']
        }).then((result) => {
            this.res.locals['performance'] = result.data;
            this.res.render('purchase/overlap');
        }, (err) => {
            return this.next(new Error(err.message));
        });
    }
    newReserve() {
        this.removeReserve().then(() => {
            if (!this.router)
                return this.next(new Error('router is undefined'));
            if (!this.req.session)
                return this.next(new Error('session is undefined'));
            delete this.req.session['purchase'];
            this.res.redirect(this.router.build('purchase', {}) + '?id=' + this.req.body.performance_id);
        }, (err) => {
            return this.next(new Error(err.message));
        });
    }
    prevReserve() {
        if (!this.router)
            return this.next(new Error('router is undefined'));
        if (!this.req.session)
            return this.next(new Error('session is undefined'));
        this.req.session['purchase'];
        this.res.redirect(this.router.build('purchase.seat', {
            id: this.req.body.performance_id
        }));
    }
    removeReserve() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.purchaseModel.performance)
                return this.next(new Error('performance is undefined'));
            if (!this.purchaseModel.transactionMP)
                return this.next(new Error('transactionMP is undefined'));
            if (!this.purchaseModel.owner)
                return this.next(new Error('owners is undefined'));
            if (!this.purchaseModel.reserveSeats)
                return this.next(new Error('reserveSeats is undefined'));
            if (!this.purchaseModel.administrator)
                return this.next(new Error('administrator is undefined'));
            let performance = this.purchaseModel.performance;
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
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OverlapController;
