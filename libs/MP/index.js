"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const request = require('request-promise-native');
const config = require('config');
const GMO = require("@motionpicture/gmo-service");
const endPoint = config.get('mp_api_endpoint');
var getPerformance;
(function (getPerformance) {
    function call(args) {
        return __awaiter(this, void 0, void 0, function* () {
            let body = yield request.get({
                url: `${endPoint}/performance/${args.id}`,
                body: {},
                json: true,
                simple: false,
            });
            if (!body.success)
                throw new Error(body.message);
            let performance = body;
            console.log('performance:', performance);
            return performance;
        });
    }
    getPerformance.call = call;
})(getPerformance = exports.getPerformance || (exports.getPerformance = {}));
var ownerAnonymousCreate;
(function (ownerAnonymousCreate) {
    function call() {
        return __awaiter(this, void 0, void 0, function* () {
            let body = yield request.post({
                url: `${endPoint}/config/owner/anonymous/create`,
                body: {
                    group: 'ANONYMOUS',
                },
                json: true,
                simple: false,
            });
            if (!body.success)
                throw new Error(body.message);
            let owner = body.owner;
            console.log('owner:', owner);
            return owner;
        });
    }
    ownerAnonymousCreate.call = call;
})(ownerAnonymousCreate = exports.ownerAnonymousCreate || (exports.ownerAnonymousCreate = {}));
var transactionStart;
(function (transactionStart) {
    function call(args) {
        return __awaiter(this, void 0, void 0, function* () {
            let body = yield request.post({
                url: `${endPoint}/transaction/start`,
                body: {
                    owners: args.owners
                },
                json: true,
                simple: false,
            });
            if (!body.success)
                throw new Error(body.message);
            let transaction = body.transaction;
            console.log('transaction:', transaction);
            return transaction;
        });
    }
    transactionStart.call = call;
})(transactionStart = exports.transactionStart || (exports.transactionStart = {}));
var addCOAAuthorization;
(function (addCOAAuthorization) {
    function call(args) {
        return __awaiter(this, void 0, void 0, function* () {
            let body = yield request.post({
                url: `${endPoint}/transaction/${args.transaction._id}/addCOAAuthorization`,
                body: {
                    transaction_password: args.transaction.password,
                    owner_id: args.ownerId4administrator,
                    coa_tmp_reserve_num: args.reserveSeatsTemporarilyResult.tmp_reserve_num,
                    seats: args.reserveSeatsTemporarilyResult.list_tmp_reserve.map((tmpReserve) => {
                        return {
                            performance: args.performance._id,
                            section: tmpReserve.seat_section,
                            seat_code: tmpReserve.seat_num,
                            ticket_code: '',
                        };
                    })
                },
                json: true,
                simple: false,
            });
            if (!body.success)
                throw new Error(body.message);
            console.log('addCOAAuthorization result:', body);
        });
    }
    addCOAAuthorization.call = call;
})(addCOAAuthorization = exports.addCOAAuthorization || (exports.addCOAAuthorization = {}));
var addGMOAuthorization;
(function (addGMOAuthorization) {
    function call(args) {
        return __awaiter(this, void 0, void 0, function* () {
            let body = yield request.post({
                url: `${endPoint}/transaction/${args.transaction._id}/addCOAAuthorization`,
                body: {
                    transaction_password: args.transaction.password,
                    owner_id: args.owner._id,
                    gmo_shop_id: config.get('gmo_shop_id'),
                    gmo_shop_password: config.get('gmo_shop_password'),
                    gmo_order_id: args.orderId,
                    gmo_amount: args.amount,
                    gmo_access_id: args.entryTranResult.access_id,
                    gmo_access_password: args.entryTranResult.access_pass,
                    gmo_job_cd: GMO.Util.JOB_CD_SALES,
                    gmo_pay_type: GMO.Util.PAY_TYPE_CREDIT,
                },
                json: true,
                simple: false,
            });
            if (!body.success)
                throw new Error(body.message);
            console.log("addGMOAuthorization result:", body);
        });
    }
    addGMOAuthorization.call = call;
})(addGMOAuthorization = exports.addGMOAuthorization || (exports.addGMOAuthorization = {}));
var transactionClose;
(function (transactionClose) {
    function call(args) {
        return __awaiter(this, void 0, void 0, function* () {
            let body = yield request.post({
                url: `${endPoint}/transaction/${args.transaction._id}/close`,
                body: {
                    password: args.transaction.password
                },
                json: true,
                simple: false,
            });
            if (!body.success)
                throw new Error(body.message);
            console.log('close result:', body);
        });
    }
    transactionClose.call = call;
})(transactionClose = exports.transactionClose || (exports.transactionClose = {}));
