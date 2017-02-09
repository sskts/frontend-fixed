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
const COA = require("@motionpicture/coa-service");
const MP = require("../../../../libs/MP");
const moment = require("moment");
var ConfirmModule;
(function (ConfirmModule) {
    function index(req, res, next) {
        if (!req.session)
            return next(req.__('common.error.property'));
        let purchaseModel = new PurchaseSession.PurchaseModel(req.session['purchase']);
        if (!purchaseModel.accessAuth(PurchaseSession.PurchaseModel.CONFIRM_STATE))
            return next(new Error(req.__('common.error.access')));
        if (!purchaseModel.transactionMP)
            return next(new Error(req.__('common.error.property')));
        res.locals['gmoTokenObject'] = (purchaseModel.gmo) ? purchaseModel.gmo : null;
        res.locals['input'] = purchaseModel.input;
        res.locals['performance'] = purchaseModel.performance;
        res.locals['reserveSeats'] = purchaseModel.reserveSeats;
        res.locals['reserveTickets'] = purchaseModel.reserveTickets;
        res.locals['step'] = PurchaseSession.PurchaseModel.CONFIRM_STATE;
        res.locals['price'] = purchaseModel.getReserveAmount();
        res.locals['updateReserve'] = null;
        res.locals['error'] = null;
        res.locals['transactionId'] = purchaseModel.transactionMP._id;
        if (!req.session)
            return next(req.__('common.error.property'));
        req.session['purchase'] = purchaseModel.formatToSession();
        return res.render('purchase/confirm');
    }
    ConfirmModule.index = index;
    function updateReserve(req, purchaseModel) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!purchaseModel.performance)
                throw new Error(req.__('common.error.property'));
            if (!purchaseModel.reserveSeats)
                throw new Error(req.__('common.error.property'));
            if (!purchaseModel.input)
                throw new Error(req.__('common.error.property'));
            if (!purchaseModel.transactionMP)
                throw Error(req.__('common.error.property'));
            if (!purchaseModel.expired)
                throw Error(req.__('common.error.property'));
            if (!req.session)
                throw Error(req.__('common.error.property'));
            if (purchaseModel.expired < moment().add(5, 'minutes').unix()) {
                delete req.session['purchase'];
                throw {
                    error: new Error(req.__('common.error.expire')),
                    type: 'expired'
                };
            }
            let performance = purchaseModel.performance;
            let reserveSeats = purchaseModel.reserveSeats;
            let input = purchaseModel.input;
            try {
                purchaseModel.updateReserve = yield COA.updateReserveInterface.call({
                    theater_code: performance.attributes.theater._id,
                    date_jouei: performance.attributes.day,
                    title_code: performance.attributes.film.coa_title_code,
                    title_branch_num: performance.attributes.film.coa_title_branch_num,
                    time_begin: performance.attributes.time_start,
                    tmp_reserve_num: reserveSeats.tmp_reserve_num,
                    reserve_name: `${input.last_name_hira}　${input.first_name_hira}`,
                    reserve_name_jkana: `${input.last_name_hira}　${input.first_name_hira}`,
                    tel_num: input.tel_num,
                    mail_addr: input.mail_addr,
                    reserve_amount: purchaseModel.getReserveAmount(),
                    list_ticket: purchaseModel.getTicketList(),
                });
                console.log('COA本予約', purchaseModel.updateReserve);
            }
            catch (err) {
                throw {
                    error: new Error(err.message),
                    type: 'updateReserve'
                };
            }
            yield MP.ownersAnonymous.call({
                transactionId: purchaseModel.transactionMP._id,
                name_first: input.first_name_hira,
                name_last: input.last_name_hira,
                tel: input.tel_num,
                email: input.mail_addr,
            });
            console.log('MP購入者情報登録');
            yield MP.transactionsEnableInquiry.call({
                transactionId: purchaseModel.transactionMP._id,
                inquiry_theater: purchaseModel.performance.attributes.theater._id,
                inquiry_id: purchaseModel.updateReserve.reserve_num,
                inquiry_pass: purchaseModel.input.tel_num,
            });
            console.log('MP照会情報登録');
            yield MP.addEmail.call({
                transactionId: purchaseModel.transactionMP._id,
                from: 'noreply@localhost',
                to: purchaseModel.input.mail_addr,
                subject: '購入完了',
                content: `購入完了\n
この度はご購入いただき誠にありがとうございます。`,
            });
            console.log('MPメール登録');
            yield MP.transactionClose.call({
                transactionId: purchaseModel.transactionMP._id,
            });
            console.log('MP取引成立');
        });
    }
    function purchase(req, res, next) {
        if (!req.session)
            return next(req.__('common.error.property'));
        let purchaseModel = new PurchaseSession.PurchaseModel(req.session['purchase']);
        if (!purchaseModel.transactionMP)
            return next(new Error(req.__('common.error.property')));
        if (req.body.transaction_id !== purchaseModel.transactionMP._id)
            return next(new Error(req.__('common.error.access')));
        updateReserve(req, purchaseModel).then(() => {
            if (!req.session)
                throw req.__('common.error.property');
            req.session['complete'] = {
                updateReserve: purchaseModel.updateReserve,
                performance: purchaseModel.performance,
                input: purchaseModel.input,
                reserveSeats: purchaseModel.reserveSeats,
                reserveTickets: purchaseModel.reserveTickets,
                price: purchaseModel.getReserveAmount()
            };
            delete req.session['purchase'];
            return res.json({
                err: null,
                redirect: false,
                result: req.session['complete'].updateReserve,
                type: null
            });
        }, (err) => {
            return res.json({
                err: (err.error) ? err.error.message : err.message,
                redirect: (err.error) ? false : true,
                result: null,
                type: (err.type) ? err.type : null,
            });
        });
    }
    ConfirmModule.purchase = purchase;
})(ConfirmModule || (ConfirmModule = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ConfirmModule;
