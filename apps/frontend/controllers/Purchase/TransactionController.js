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
const MP = require("../../../../libs/MP");
class TransactionController extends PurchaseController_1.default {
    start() {
        if (!this.req.query || !this.req.query['id'])
            return this.next(new Error('不適切なアクセスです'));
        if (this.purchaseModel.transactionMP && this.purchaseModel.owner) {
            console.log('取引中');
        }
        this.transactionStart().then(() => {
            if (!this.router)
                return this.next(new Error('router is undefined'));
            if (!this.req.session)
                return this.next(new Error('session is undefined'));
            this.req.session['purchase'] = this.purchaseModel.formatToSession();
            this.res.redirect(this.router.build('purchase.seat', {
                id: this.req.query['id']
            }));
        }, (err) => {
            return this.next(new Error(err.message));
        });
    }
    transactionStart() {
        return __awaiter(this, void 0, void 0, function* () {
            this.purchaseModel.owner = yield MP.ownerAnonymousCreate.call();
            this.logger.debug('MP一般所有者作成', this.purchaseModel.owner);
            this.purchaseModel.transactionMP = yield MP.transactionStart.call({
                owners: [config.get('admin_id'), this.purchaseModel.owner._id]
            });
            this.logger.debug('MP取引開始', this.purchaseModel.transactionMP);
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TransactionController;
