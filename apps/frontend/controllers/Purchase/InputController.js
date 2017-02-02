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
const MP = require("../../../../libs/MP");
class InputController extends PurchaseController_1.default {
    index() {
        if (!this.purchaseModel.accessAuth(PurchaseSession.PurchaseModel.INPUT_STATE))
            return this.next(new Error(PurchaseController_1.default.ERROR_MESSAGE_ACCESS));
        this.res.locals['error'] = null;
        this.res.locals['moment'] = require('moment');
        this.res.locals['step'] = PurchaseSession.PurchaseModel.INPUT_STATE;
        this.res.locals['gmoModuleUrl'] = config.get('gmo_module_url');
        this.res.locals['gmoShopId'] = config.get('gmo_shop_id');
        this.res.locals['price'] = this.purchaseModel.getReserveAmount();
        if (this.purchaseModel.input) {
            this.res.locals['input'] = this.purchaseModel.input;
        }
        else {
            this.res.locals['input'] = {
                last_name_hira: '',
                first_name_hira: '',
                mail_addr: '',
                mail_confirm: '',
                tel_num: '',
                agree: ''
            };
        }
        if (process.env.NODE_ENV === 'dev' && !this.purchaseModel.input) {
            this.res.locals['input'] = {
                last_name_hira: 'はたぐち',
                first_name_hira: 'あきと',
                mail_addr: 'hataguchi@motionpicture.jp',
                mail_confirm: 'hataguchi@motionpicture.jp',
                tel_num: '09040007648',
            };
        }
        if (!this.req.session)
            return this.next(new Error('session is undefined'));
        this.req.session['purchase'] = this.purchaseModel.formatToSession();
        return this.res.render('purchase/input');
    }
    submit() {
        if (!this.transactionAuth())
            return this.next(new Error(PurchaseController_1.default.ERROR_MESSAGE_ACCESS));
        InputForm_1.default(this.req, this.res, () => {
            if (!this.req.form)
                return this.next(new Error('form is undefined'));
            if (this.req.form.isValid) {
                this.purchaseModel.input = {
                    last_name_hira: this.req.body.last_name_hira,
                    first_name_hira: this.req.body.first_name_hira,
                    mail_addr: this.req.body.mail_addr,
                    mail_confirm: this.req.body.mail_confirm,
                    tel_num: this.req.body.tel_num,
                    agree: this.req.body.agree
                };
                if (this.req.body.gmo_token_object) {
                    this.purchaseModel.gmo = JSON.parse(this.req.body.gmo_token_object);
                    this.addAuthorization().then(() => {
                        if (!this.router)
                            return this.next(new Error('router is undefined'));
                        if (!this.req.session)
                            return this.next(new Error('session is undefined'));
                        this.req.session['purchase'] = this.purchaseModel.formatToSession();
                        return this.res.redirect(this.router.build('purchase.confirm', {}));
                    }, (err) => {
                        if (!err.hasOwnProperty('type'))
                            return this.next(err.message);
                        this.res.locals['error'] = {
                            cardno: ['クレジットカードカード番号ををご確認ください']
                        };
                        this.res.locals['input'] = this.req.body;
                        this.res.locals['moment'] = require('moment');
                        this.res.locals['step'] = 2;
                        this.res.locals['gmoModuleUrl'] = config.get('gmo_module_url');
                        this.res.locals['gmoShopId'] = config.get('gmo_shop_id');
                        this.res.locals['price'] = this.purchaseModel.getReserveAmount();
                        return this.res.render('purchase/input');
                    });
                }
                else {
                    if (!this.router)
                        return this.next(new Error('router is undefined'));
                    if (!this.req.session)
                        return this.next(new Error('session is undefined'));
                    this.req.session['purchase'] = this.purchaseModel.formatToSession();
                    return this.res.redirect(this.router.build('purchase.confirm', {}));
                }
            }
            else {
                this.res.locals['error'] = this.req.form.getErrors();
                this.res.locals['input'] = this.req.body;
                this.res.locals['moment'] = require('moment');
                this.res.locals['step'] = 2;
                this.res.locals['gmoModuleUrl'] = config.get('gmo_module_url');
                this.res.locals['gmoShopId'] = config.get('gmo_shop_id');
                this.res.locals['price'] = this.purchaseModel.getReserveAmount();
                return this.res.render('purchase/input');
            }
        });
    }
    addAuthorization() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.purchaseModel.transactionMP)
                throw new Error('transactionMP is undefined');
            if (!this.purchaseModel.gmo)
                throw new Error('gmo is undefined');
            if (this.purchaseModel.transactionGMO
                && this.purchaseModel.authorizationGMO
                && this.purchaseModel.orderId) {
                if (!this.purchaseModel.transactionGMO)
                    throw new Error('transactionGMO is undefined');
                if (!this.purchaseModel.authorizationGMO)
                    throw new Error('authorizationGMO is undefined');
                if (!this.purchaseModel.orderId)
                    throw new Error('orderId is undefined');
                yield GMO.CreditService.alterTranInterface.call({
                    shop_id: config.get('gmo_shop_id'),
                    shop_pass: config.get('gmo_shop_password'),
                    access_id: this.purchaseModel.transactionGMO.access_id,
                    access_pass: this.purchaseModel.transactionGMO.access_pass,
                    job_cd: GMO.Util.JOB_CD_VOID
                });
                this.logger.debug('GMOオーソリ取消');
                yield MP.removeGMOAuthorization.call({
                    transactionId: this.purchaseModel.transactionMP._id,
                    gmoAuthorizationId: this.purchaseModel.authorizationGMO._id,
                });
                this.logger.debug('GMOオーソリ削除');
            }
            try {
                this.purchaseModel.orderId = Date.now().toString();
                let amount = this.purchaseModel.getReserveAmount();
                this.purchaseModel.transactionGMO = yield GMO.CreditService.entryTranInterface.call({
                    shop_id: config.get('gmo_shop_id'),
                    shop_pass: config.get('gmo_shop_password'),
                    order_id: this.purchaseModel.orderId,
                    job_cd: GMO.Util.JOB_CD_AUTH,
                    amount: amount,
                });
                this.logger.debug('GMOオーソリ取得', this.purchaseModel.orderId);
                yield GMO.CreditService.execTranInterface.call({
                    access_id: this.purchaseModel.transactionGMO.access_id,
                    access_pass: this.purchaseModel.transactionGMO.access_pass,
                    order_id: this.purchaseModel.orderId,
                    method: "1",
                    token: this.purchaseModel.gmo.token
                });
                this.logger.debug('GMO決済');
                this.purchaseModel.authorizationGMO = yield MP.addGMOAuthorization.call({
                    transaction: this.purchaseModel.transactionMP,
                    orderId: this.purchaseModel.orderId,
                    amount: amount,
                    entryTranResult: this.purchaseModel.transactionGMO,
                });
                this.logger.debug('MPGMOオーソリ追加', this.purchaseModel.authorizationGMO);
            }
            catch (err) {
                throw {
                    error: new Error(err.message),
                    type: 'addAuthorization'
                };
            }
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InputController;
