import BaseController from '../BaseController';
import express = require('express');
import COA = require("@motionpicture/coa-service");
import PurchaseSession = require('../../models/Purchase/PurchaseModel');
/**
 * TODO any type
 */
export default class PurchaseController extends BaseController {
    /** 購入セッションmodel */
    protected purchaseModel: PurchaseSession.PurchaseModel;

    constructor(req: express.Request, res: express.Response, next: express.NextFunction) {
        super(req, res, next);
        this.init();
    }

    /**
     * 初期化
     */
    private init(): void {
        if (!this.req.session) return this.next(new Error('session is undefined'));
        this.purchaseModel = new PurchaseSession.PurchaseModel(this.req.session['purchase']);
    }

    /**
     * スクリーン状態取得
     */
    public getScreenStateReserve(): void {
        
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