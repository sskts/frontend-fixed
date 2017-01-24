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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PurchaseController;
