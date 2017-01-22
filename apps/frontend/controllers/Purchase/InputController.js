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
const InputForm_1 = require("../../forms/Purchase/InputForm");
const PurchaseSession = require("../../models/Purchase/PurchaseModel");
const config = require("config");
const GMO = require("@motionpicture/gmo-service");
class InputController extends PurchaseController_1.default {
    index() {
        if (!this.purchaseModel.checkAccess(PurchaseSession.PurchaseModel.INPUT_STATE))
            return this.next(new Error('無効なアクセスです'));
        this.res.locals['error'] = null;
        this.res.locals['input'] = this.purchaseModel.input;
        this.res.locals['moment'] = require('moment');
        this.res.locals['step'] = PurchaseSession.PurchaseModel.INPUT_STATE;
        this.res.locals['gmoModuleUrl'] = config.get('gmo_module_url');
        this.res.locals['gmoShopId'] = config.get('gmo_shop_id');
        this.res.locals['price'] = this.purchaseModel.getReserveAmount();
        if (process.env.NODE_ENV === 'dev') {
            this.res.locals['input'] = {
                last_name_hira: 'はたぐち',
                first_name_hira: 'あきと',
                mail_addr: 'hataguchi@motionpicture.jp',
                mail_confirm: 'hataguchi@motionpicture.jp',
                tel_num: '09040007648'
            };
        }
        if (!this.req.session)
            return this.next(new Error('session is undefined'));
        this.req.session['purchase'] = this.purchaseModel.formatToSession();
        this.res.render('purchase/input');
    }
    submit() {
        InputForm_1.default(this.req, this.res, () => {
            if (!this.req.form)
                return this.next(new Error('form is undefined'));
            if (this.req.form.isValid) {
                this.purchaseModel.input = {
                    last_name_hira: this.req.body.last_name_hira,
                    first_name_hira: this.req.body.first_name_hira,
                    mail_addr: this.req.body.mail_addr,
                    tel_num: this.req.body.tel_num,
                };
                this.purchaseModel.gmo = JSON.parse(this.req.body.gmo_token_object);
                this.addAuthorization().then(() => {
                    if (!this.router)
                        return this.next(new Error('router is undefined'));
                    if (!this.req.session)
                        return this.next(new Error('session is undefined'));
                    this.req.session['purchase'] = this.purchaseModel.formatToSession();
                    this.res.redirect(this.router.build('purchase.confirm', {}));
                }, (err) => {
                    return this.next(new Error(err.message));
                });
            }
            else {
                this.res.locals['error'] = this.req.form.getErrors();
                this.res.locals['input'] = this.req.body;
                this.res.locals['moment'] = require('moment');
                this.res.locals['step'] = 2;
                this.res.locals['gmoModuleUrl'] = config.get('gmo_module_url');
                this.res.locals['gmoShopId'] = config.get('gmo_shop_id');
                this.res.locals['price'] = this.purchaseModel.getReserveAmount();
                this.res.render('purchase/input');
            }
        });
    }
    addAuthorization() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.req.session)
                throw new Error('session is undefined');
            let gmo = this.purchaseModel.gmo;
            if (!gmo)
                throw new Error('gmo is undefined');
            let amount = this.purchaseModel.getReserveAmount();
            let orderId = Date.now().toString();
            let entryTranResult = yield GMO.CreditService.entryTranInterface.call({
                shop_id: config.get('gmo_shop_id'),
                shop_pass: config.get('gmo_shop_password'),
                order_id: orderId,
                job_cd: GMO.Util.JOB_CD_AUTH,
                amount: amount,
            });
            this.logger.debug('GMOオーソリ取得', entryTranResult);
            let execTranResult = yield GMO.CreditService.execTranInterface.call({
                access_id: entryTranResult.access_id,
                access_pass: entryTranResult.access_pass,
                order_id: orderId,
                method: "1",
                token: gmo.token
            });
            this.logger.debug('GMO決済', execTranResult);
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InputController;
