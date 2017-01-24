"use strict";
const PurchaseController_1 = require("./PurchaseController");
const PurchaseSession = require("../../models/Purchase/PurchaseModel");
class ConfirmController extends PurchaseController_1.default {
    index() {
        if (!this.req.session)
            return this.next(new Error('session is undefined'));
        if (!this.req.session['complete'])
            return this.next(new Error('無効なアクセスです'));
        this.res.locals['input'] = this.req.session['complete'].input;
        this.res.locals['performance'] = this.req.session['complete'].performance;
        this.res.locals['reserveSeats'] = this.req.session['complete'].reserveSeats;
        this.res.locals['reserveTickets'] = this.req.session['complete'].reserveTickets;
        this.res.locals['step'] = PurchaseSession.PurchaseModel.COMPLETE_STATE;
        this.res.locals['price'] = this.req.session['complete'].price;
        this.res.locals['updateReserve'] = this.req.session['complete'].updateReserve;
        this.res.render('purchase/complete');
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ConfirmController;
