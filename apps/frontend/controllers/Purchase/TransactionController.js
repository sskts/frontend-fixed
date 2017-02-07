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
const MP = require("../../../../libs/MP");
const moment = require("moment");
class TransactionController extends PurchaseController_1.default {
    start() {
        if (!this.req.params || !this.req.params['id'])
            return this.next(new Error(this.req.__('common.error.access')));
        if (this.purchaseModel.transactionMP && this.purchaseModel.reserveSeats) {
            if (!this.router)
                return this.next(this.req.__('common.error.property'));
            return this.res.redirect(this.router.build('purchase.overlap', {
                id: this.req.params['id']
            }));
        }
        this.transactionStart().then(() => {
            if (!this.router)
                return this.next(this.req.__('common.error.property'));
            if (!this.req.session)
                return this.next(this.req.__('common.error.property'));
            delete this.req.session['purchase'];
            this.req.session['purchase'] = this.purchaseModel.formatToSession();
            return this.res.redirect(this.router.build('purchase.seat', {
                id: this.req.params['id']
            }));
        }, (err) => {
            return this.next(new Error(err.message));
        });
    }
    transactionStart() {
        return __awaiter(this, void 0, void 0, function* () {
            this.purchaseModel.expired = moment().add('minutes', 30).unix();
            this.purchaseModel.transactionMP = yield MP.transactionStart.call({
                expired_at: this.purchaseModel.expired,
            });
            this.logger.debug('MP取引開始', this.purchaseModel.transactionMP.attributes.owners);
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TransactionController;
