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
            return this.next(new Error(PurchaseController_1.default.ERROR_MESSAGE_ACCESS));
        if (this.purchaseModel.transactionMP && this.purchaseModel.owner && this.purchaseModel.reserveSeats) {
            if (!this.router)
                return this.next(new Error('router is undefined'));
            console.log('重複確認=====================');
            return this.res.redirect(this.router.build('purchase.overlap', {
                id: this.req.params['id']
            }));
        }
        this.transactionStart().then(() => {
            if (!this.router)
                return this.next(new Error('router is undefined'));
            if (!this.req.session)
                return this.next(new Error('session is undefined'));
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
            this.purchaseModel.administrator = yield MP.getAdministrator.call();
            this.logger.debug('MP運営者', this.purchaseModel.administrator);
            this.purchaseModel.owner = yield MP.ownerAnonymousCreate.call();
            this.logger.debug('MP一般所有者作成', this.purchaseModel.owner);
            this.purchaseModel.expired = moment().add('minutes', 30).unix();
            this.purchaseModel.transactionMP = yield MP.transactionStart.call({
                expired_at: this.purchaseModel.expired,
                owners: [this.purchaseModel.administrator._id, this.purchaseModel.owner._id]
            });
            this.logger.debug('MP取引開始', this.purchaseModel.transactionMP);
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TransactionController;
