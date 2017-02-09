"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const InputForm_1 = require("../../forms/Purchase/InputForm");
const PurchaseSession = require("../../models/Purchase/PurchaseModel");
const config = require("config");
const GMO = require("@motionpicture/gmo-service");
const MP = require("../../../../libs/MP");
var Module;
(function (Module) {
    function index(req, res, next) {
        if (!req.session)
            return next(req.__('common.error.property'));
        let purchaseModel = new PurchaseSession.PurchaseModel(req.session['purchase']);
        if (!purchaseModel.accessAuth(PurchaseSession.PurchaseModel.INPUT_STATE))
            return next(new Error(req.__('common.error.access')));
        if (!purchaseModel.transactionMP)
            return next(req.__('common.error.property'));
        res.locals['error'] = null;
        res.locals['moment'] = require('moment');
        res.locals['step'] = PurchaseSession.PurchaseModel.INPUT_STATE;
        res.locals['gmoModuleUrl'] = config.get('gmo_module_url');
        res.locals['gmoShopId'] = config.get('gmo_shop_id');
        res.locals['price'] = purchaseModel.getReserveAmount();
        res.locals['transactionId'] = purchaseModel.transactionMP._id;
        if (purchaseModel.input) {
            res.locals['input'] = purchaseModel.input;
        }
        else {
            res.locals['input'] = {
                last_name_hira: '',
                first_name_hira: '',
                mail_addr: '',
                mail_confirm: '',
                tel_num: '',
                agree: ''
            };
        }
        if (process.env.NODE_ENV === 'dev' && !purchaseModel.input) {
            res.locals['input'] = {
                last_name_hira: 'はたぐち',
                first_name_hira: 'あきと',
                mail_addr: 'hataguchi@motionpicture.jp',
                mail_confirm: 'hataguchi@motionpicture.jp',
                tel_num: '09040007648',
            };
        }
        if (!req.session)
            return next(req.__('common.error.property'));
        req.session['purchase'] = purchaseModel.formatToSession();
        return res.render('purchase/input');
    }
    Module.index = index;
    function submit(req, res, next) {
        if (!req.session)
            return next(req.__('common.error.property'));
        let purchaseModel = new PurchaseSession.PurchaseModel(req.session['purchase']);
        if (!purchaseModel.transactionMP)
            return next(new Error(req.__('common.error.property')));
        if (req.body.transaction_id !== purchaseModel.transactionMP._id)
            return next(new Error(req.__('common.error.access')));
        let form = InputForm_1.default(req);
        form(req, res, () => {
            if (!req.form)
                return next(req.__('common.error.property'));
            if (req.form.isValid) {
                purchaseModel.input = {
                    last_name_hira: req.body.last_name_hira,
                    first_name_hira: req.body.first_name_hira,
                    mail_addr: req.body.mail_addr,
                    mail_confirm: req.body.mail_confirm,
                    tel_num: req.body.tel_num,
                    agree: req.body.agree
                };
                if (req.body.gmo_token_object) {
                    purchaseModel.gmo = JSON.parse(req.body.gmo_token_object);
                    addAuthorization(req, purchaseModel).then(() => {
                        if (!req.session)
                            return next(req.__('common.error.property'));
                        req.session['purchase'] = purchaseModel.formatToSession();
                        return res.redirect('/purchase/confirm');
                    }, (err) => {
                        if (!err.hasOwnProperty('type'))
                            return next(new Error(err.message));
                        if (!purchaseModel.transactionMP)
                            return next(req.__('common.error.property'));
                        res.locals['error'] = {
                            cardno: [`${req.__('common.cardno')}${req.__('common.validation.card')}`],
                            expire: [`${req.__('common.expire')}${req.__('common.validation.card')}`],
                            securitycode: [`${req.__('common.securitycode')}${req.__('common.validation.card')}`],
                        };
                        res.locals['input'] = req.body;
                        res.locals['moment'] = require('moment');
                        res.locals['step'] = 2;
                        res.locals['gmoModuleUrl'] = config.get('gmo_module_url');
                        res.locals['gmoShopId'] = config.get('gmo_shop_id');
                        res.locals['price'] = purchaseModel.getReserveAmount();
                        res.locals['transactionId'] = purchaseModel.transactionMP._id;
                        return res.render('purchase/input');
                    });
                }
                else {
                    if (!req.session)
                        return next(req.__('common.error.property'));
                    req.session['purchase'] = purchaseModel.formatToSession();
                    return res.redirect('/purchase/confirm');
                }
            }
            else {
                if (!purchaseModel.transactionMP)
                    return next(req.__('common.error.property'));
                res.locals['error'] = req.form.getErrors();
                res.locals['input'] = req.body;
                res.locals['moment'] = require('moment');
                res.locals['step'] = 2;
                res.locals['gmoModuleUrl'] = config.get('gmo_module_url');
                res.locals['gmoShopId'] = config.get('gmo_shop_id');
                res.locals['price'] = purchaseModel.getReserveAmount();
                res.locals['transactionId'] = purchaseModel.transactionMP._id;
                return res.render('purchase/input');
            }
        });
    }
    Module.submit = submit;
    function addAuthorization(req, purchaseModel) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!purchaseModel.transactionMP)
                throw new Error(req.__('common.error.property'));
            if (!purchaseModel.gmo)
                throw new Error(req.__('common.error.property'));
            if (purchaseModel.transactionGMO
                && purchaseModel.authorizationGMO
                && purchaseModel.orderId) {
                if (!purchaseModel.transactionGMO)
                    throw new Error(req.__('common.error.property'));
                if (!purchaseModel.authorizationGMO)
                    throw new Error(req.__('common.error.property'));
                if (!purchaseModel.orderId)
                    throw new Error(req.__('common.error.property'));
                yield GMO.CreditService.alterTranInterface.call({
                    shop_id: config.get('gmo_shop_id'),
                    shop_pass: config.get('gmo_shop_password'),
                    access_id: purchaseModel.transactionGMO.access_id,
                    access_pass: purchaseModel.transactionGMO.access_pass,
                    job_cd: GMO.Util.JOB_CD_VOID
                });
                console.log('GMOオーソリ取消');
                yield MP.removeGMOAuthorization.call({
                    transactionId: purchaseModel.transactionMP._id,
                    gmoAuthorizationId: purchaseModel.authorizationGMO._id,
                });
                console.log('GMOオーソリ削除');
            }
            try {
                purchaseModel.orderId = Date.now().toString();
                let amount = purchaseModel.getReserveAmount();
                purchaseModel.transactionGMO = yield GMO.CreditService.entryTranInterface.call({
                    shop_id: config.get('gmo_shop_id'),
                    shop_pass: config.get('gmo_shop_password'),
                    order_id: purchaseModel.orderId,
                    job_cd: GMO.Util.JOB_CD_AUTH,
                    amount: amount,
                });
                console.log('GMOオーソリ取得', purchaseModel.orderId);
                yield GMO.CreditService.execTranInterface.call({
                    access_id: purchaseModel.transactionGMO.access_id,
                    access_pass: purchaseModel.transactionGMO.access_pass,
                    order_id: purchaseModel.orderId,
                    method: "1",
                    token: purchaseModel.gmo.token
                });
                console.log('GMO決済');
                purchaseModel.authorizationGMO = yield MP.addGMOAuthorization.call({
                    transaction: purchaseModel.transactionMP,
                    orderId: purchaseModel.orderId,
                    amount: amount,
                    entryTranResult: purchaseModel.transactionGMO,
                });
                console.log('MPGMOオーソリ追加', purchaseModel.authorizationGMO);
            }
            catch (err) {
                throw {
                    error: new Error(err.message),
                    type: 'addAuthorization'
                };
            }
        });
    }
})(Module = exports.Module || (exports.Module = {}));
