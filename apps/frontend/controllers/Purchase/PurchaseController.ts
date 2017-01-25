import BaseController from '../BaseController';
import express = require('express');
import COA = require("@motionpicture/coa-service");
import PurchaseSession = require('../../models/Purchase/PurchaseModel');
/**
 * TODO any type
 */
export default class PurchaseController extends BaseController {
    /** エラーメッセージ 認証 */
    public static ERROR_MESSAGE_ACCESS = '不適切なアクセスです';
    /** 購入セッションモデル */
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
        
        //取引id設定
        if (this.purchaseModel.transactionMP) {
            this.res.locals['transactionId'] = this.purchaseModel.transactionMP._id;
        } else {
            this.res.locals['transactionId'] = null;
        }

    }

    /**
     * 取引認証
     */
    protected transactionAuth(): boolean {
        if (!this.purchaseModel.transactionMP) return false;
        if (!this.req.body.transaction_id) return false;
        if (this.purchaseModel.transactionMP._id !== this.req.body.transaction_id) return false;
        return true;
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