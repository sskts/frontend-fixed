"use strict";
const PurchaseController_1 = require('./PurchaseController');
const EnterPurchaserForm_1 = require('../../forms/Purchase/EnterPurchaserForm');
class EnterPurchaserController extends PurchaseController_1.default {
    /**
     * 購入者情報入力
     */
    index() {
        this.logger.debug('session', this.req.session['purchaseInfo']);
        //購入者情報入力表示
        this.res.locals['token'] = this.req.session['purchaseToken'];
        this.res.locals['error'] = null;
        this.res.locals['info'] = null;
        this.res.locals['moment'] = require('moment');
        this.res.render('purchase/enterPurchaser');
    }
    /**
     * 購入者情報入力完了
     */
    enterPurchaser() {
        this.checkToken();
        //モーションAPI
        //バリデーション
        EnterPurchaserForm_1.default(this.req, this.res, () => {
            if (this.req.form.isValid) {
                //入力情報をセッションへ
                this.req.session['purchaseInfo'] = this.req.body;
                //購入者内容確認へ
                this.res.redirect(this.router.build('purchase.confirmPurchase', {}));
            }
            else {
                this.res.locals['token'] = this.req.body['token'];
                this.res.locals['error'] = this.req.form.getErrors();
                this.res.locals['info'] = this.req.body;
                this.res.locals['moment'] = require('moment');
                this.res.render('purchase/enterPurchaser');
            }
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EnterPurchaserController;
