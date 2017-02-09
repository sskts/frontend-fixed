"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const SeatForm_1 = require("../../forms/Purchase/SeatForm");
const PurchaseSession = require("../../models/Purchase/PurchaseModel");
const config = require("config");
const COA = require("@motionpicture/coa-service");
const MP = require("../../../../libs/MP");
const GMO = require("@motionpicture/gmo-service");
var Module;
(function (Module) {
    function index(req, res, next) {
        if (!req.session)
            return next(req.__('common.error.property'));
        let purchaseModel = new PurchaseSession.PurchaseModel(req.session['purchase']);
        if (!req.params || !req.params['id'])
            return next(new Error(req.__('common.error.access')));
        if (!purchaseModel.accessAuth(PurchaseSession.PurchaseModel.SEAT_STATE))
            return next(new Error(req.__('common.error.access')));
        MP.getPerformance.call({
            id: req.params['id']
        }).then((result) => {
            if (!purchaseModel.transactionMP)
                return next(new Error(req.__('common.error.property')));
            res.locals['performance'] = result;
            res.locals['step'] = PurchaseSession.PurchaseModel.SEAT_STATE;
            res.locals['reserveSeats'] = null;
            res.locals['transactionId'] = purchaseModel.transactionMP._id;
            if (purchaseModel.reserveSeats) {
                console.log('仮予約中');
                res.locals['reserveSeats'] = JSON.stringify(purchaseModel.reserveSeats);
            }
            purchaseModel.performance = result;
            if (!req.session)
                return next(req.__('common.error.property'));
            req.session['purchase'] = purchaseModel.formatToSession();
            res.locals['error'] = null;
            return res.render('purchase/seat');
        }, (err) => {
            return next(new Error(err.message));
        });
    }
    Module.index = index;
    function select(req, res, next) {
        if (!req.session)
            return next(req.__('common.error.property'));
        let purchaseModel = new PurchaseSession.PurchaseModel(req.session['purchase']);
        if (!purchaseModel.transactionMP)
            return next(new Error(req.__('common.error.property')));
        console.log('座席決定1', req.body.transaction_id, purchaseModel.transactionMP._id);
        if (req.body.transaction_id !== purchaseModel.transactionMP._id)
            return next(new Error(req.__('common.error.access')));
        console.log('座席決定2');
        let form = SeatForm_1.default(req);
        form(req, res, () => {
            if (!req.form)
                return next(req.__('common.error.property'));
            if (req.form.isValid) {
                reserve(req, purchaseModel).then(() => {
                    if (!req.session)
                        return next(req.__('common.error.property'));
                    req.session['purchase'] = purchaseModel.formatToSession();
                    return res.redirect('/purchase/ticket');
                }, (err) => {
                    return next(new Error(err.message));
                });
            }
            else {
                if (!req.params || !req.params['id'])
                    return next(new Error(req.__('common.error.access')));
                res.locals['transactionId'] = purchaseModel.transactionMP;
                res.locals['performance'] = purchaseModel.performance;
                res.locals['step'] = PurchaseSession.PurchaseModel.SEAT_STATE;
                res.locals['reserveSeats'] = req.body.seats;
                res.locals['error'] = req.form.getErrors();
                return res.render('purchase/seat');
            }
        });
    }
    Module.select = select;
    function reserve(req, purchaseModel) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!purchaseModel.performance)
                throw new Error(req.__('common.error.property'));
            if (!purchaseModel.transactionMP)
                throw new Error(req.__('common.error.property'));
            let performance = purchaseModel.performance;
            if (purchaseModel.reserveSeats) {
                if (!purchaseModel.authorizationCOA)
                    throw new Error(req.__('common.error.property'));
                let reserveSeats = purchaseModel.reserveSeats;
                yield COA.deleteTmpReserveInterface.call({
                    theater_code: performance.attributes.theater._id,
                    date_jouei: performance.attributes.day,
                    title_code: performance.attributes.film.coa_title_code,
                    title_branch_num: performance.attributes.film.coa_title_branch_num,
                    time_begin: performance.attributes.time_start,
                    tmp_reserve_num: reserveSeats.tmp_reserve_num,
                });
                console.log('COA仮予約削除');
                yield MP.removeCOAAuthorization.call({
                    transactionId: purchaseModel.transactionMP._id,
                    coaAuthorizationId: purchaseModel.authorizationCOA._id,
                });
                console.log('MPCOAオーソリ削除');
                if (purchaseModel.transactionGMO
                    && purchaseModel.authorizationGMO) {
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
            }
            let seats = JSON.parse(req.body.seats);
            purchaseModel.reserveSeats = yield COA.reserveSeatsTemporarilyInterface.call({
                theater_code: performance.attributes.theater._id,
                date_jouei: performance.attributes.day,
                title_code: performance.attributes.film.coa_title_code,
                title_branch_num: performance.attributes.film.coa_title_branch_num,
                time_begin: performance.attributes.time_start,
                screen_code: performance.attributes.screen.coa_screen_code,
                list_seat: seats.list_tmp_reserve,
            });
            console.log('COA仮予約', purchaseModel.reserveSeats);
            purchaseModel.reserveTickets = purchaseModel.reserveSeats.list_tmp_reserve.map((tmpReserve) => {
                return {
                    section: tmpReserve.seat_section,
                    seat_code: tmpReserve.seat_num,
                    ticket_code: '',
                    ticket_name_ja: '',
                    ticket_name_en: '',
                    ticket_name_kana: '',
                    std_price: 0,
                    add_price: 0,
                    dis_price: 0,
                    sale_price: 0,
                };
            });
            let COAAuthorizationResult = yield MP.addCOAAuthorization.call({
                transaction: purchaseModel.transactionMP,
                reserveSeatsTemporarilyResult: purchaseModel.reserveSeats,
                salesTicketResults: purchaseModel.reserveTickets,
                performance: performance,
                totalPrice: purchaseModel.getReserveAmount()
            });
            console.log('MPCOAオーソリ追加', COAAuthorizationResult);
            purchaseModel.authorizationCOA = COAAuthorizationResult;
        });
    }
    function getScreenStateReserve(req, res, _next) {
        COA.getStateReserveSeatInterface.call(req.body).then((result) => {
            res.json({
                err: null,
                result: result
            });
        }, (err) => {
            res.json({
                err: err,
                result: null
            });
        });
    }
    Module.getScreenStateReserve = getScreenStateReserve;
})(Module = exports.Module || (exports.Module = {}));
