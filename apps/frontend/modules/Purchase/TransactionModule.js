"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const PurchaseSession = require("../../models/Purchase/PurchaseModel");
const MP = require("../../../../libs/MP");
const moment = require("moment");
var TransactionModule;
(function (TransactionModule) {
    function start(req, res, next) {
        if (!req.params || !req.params['id'])
            return next(new Error(req.__('common.error.access')));
        if (!req.session)
            return next(req.__('common.error.property'));
        let purchaseModel = new PurchaseSession.PurchaseModel(req.session['purchase']);
        if (purchaseModel.transactionMP && purchaseModel.reserveSeats) {
            return res.redirect('/purchase/' + req.params['id'] + '/overlap');
        }
        transactionStart(purchaseModel).then(() => {
            if (!req.session)
                return next(req.__('common.error.property'));
            delete req.session['purchase'];
            req.session['purchase'] = purchaseModel.formatToSession();
            return res.redirect('/purchase/seat/' + req.params['id'] + '/');
        }, (err) => {
            return next(new Error(err.message));
        });
    }
    TransactionModule.start = start;
    function transactionStart(purchaseModel) {
        return __awaiter(this, void 0, void 0, function* () {
            purchaseModel.expired = moment().add('minutes', 30).unix();
            purchaseModel.transactionMP = yield MP.transactionStart.call({
                expired_at: purchaseModel.expired,
            });
            console.log('MP取引開始', purchaseModel.transactionMP.attributes.owners);
        });
    }
})(TransactionModule || (TransactionModule = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TransactionModule;
