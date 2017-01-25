"use strict";
const BaseController_1 = require("../BaseController");
const COA = require("@motionpicture/coa-service");
const PurchaseSession = require("../../models/Purchase/PurchaseModel");
class PurchaseController extends BaseController_1.default {
    constructor(req, res, next) {
        super(req, res, next);
        this.init();
    }
    init() {
        if (!this.req.session)
            return this.next(new Error('session is undefined'));
        this.purchaseModel = new PurchaseSession.PurchaseModel(this.req.session['purchase']);
        if (this.purchaseModel.transactionMP) {
            this.res.locals['transactionId'] = this.purchaseModel.transactionMP._id;
        }
        else {
            this.res.locals['transactionId'] = null;
        }
    }
    transactionAuth() {
        if (!this.purchaseModel.transactionMP)
            return false;
        if (!this.req.body.transaction_id)
            return false;
        if (this.purchaseModel.transactionMP._id !== this.req.body.transaction_id)
            return false;
        return true;
    }
    getScreenStateReserve() {
        COA.getStateReserveSeatInterface.call(this.req.body).then((result) => {
            this.res.json({
                err: null,
                result: result
            });
        }, (err) => {
            this.res.json({
                err: err,
                result: null
            });
        });
    }
}
PurchaseController.ERROR_MESSAGE_ACCESS = '不適切なアクセスです';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PurchaseController;
