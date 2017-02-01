"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const request = require("request-promise-native");
const config = require("config");
const GMO = require("@motionpicture/gmo-service");
const endPoint = config.get('mp_api_endpoint');
var getPerformance;
(function (getPerformance) {
    function call(args) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield request.get({
                url: `${endPoint}/performances/${args.id}`,
                body: {},
                json: true,
                simple: false,
                resolveWithFullResponse: true,
            });
            if (response.statusCode !== 200)
                throw new Error(response.body.message);
            console.log('performances:', response.body);
            return response.body;
        });
    }
    getPerformance.call = call;
})(getPerformance = exports.getPerformance || (exports.getPerformance = {}));
var transactionStart;
(function (transactionStart) {
    function call(args) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield request.post({
                url: `${endPoint}/transactions`,
                body: {
                    expired_at: args.expired_at,
                },
                json: true,
                simple: false,
                resolveWithFullResponse: true,
            });
            if (response.statusCode !== 201)
                throw new Error(response.body.message);
            let transaction = response.body.data;
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
            let promoterOwner = args.transaction.attributes.owners.find((owner) => {
                return (owner.group === "PROMOTER");
            });
            let promoterOwnerId = (promoterOwner) ? promoterOwner._id : null;
            let anonymousOwner = args.transaction.attributes.owners.find((owner) => {
                return (owner.group === "ANONYMOUS");
            });
            let anonymousOwnerId = (anonymousOwner) ? anonymousOwner._id : null;
            let response = yield request.post({
                url: `${endPoint}/transactions/${args.transaction._id}/authorizations/coaSeatReservation`,
                body: {
                    owner_id_from: promoterOwnerId,
                    owner_id_to: anonymousOwnerId,
                    coa_tmp_reserve_num: args.reserveSeatsTemporarilyResult.tmp_reserve_num,
                    coa_theater_code: args.performance.attributes.theater._id,
                    coa_date_jouei: args.performance.attributes.day,
                    coa_title_code: args.performance.attributes.film.coa_title_code,
                    coa_title_branch_num: args.performance.attributes.film.coa_title_branch_num,
                    coa_time_begin: args.performance.attributes.time_start,
                    coa_screen_code: args.performance.attributes.screen.coa_screen_code,
                    seats: args.salesTicketResults.map((tmpReserve) => {
                        return {
                            performance: args.performance._id,
                            section: tmpReserve.section,
                            seat_code: tmpReserve.seat_code,
                            ticket_code: tmpReserve.ticket_code,
                            ticket_name_ja: tmpReserve.ticket_name_ja,
                            ticket_name_en: tmpReserve.ticket_name_en,
                            ticket_name_kana: tmpReserve.ticket_name_kana,
                            std_price: tmpReserve.std_price,
                            add_price: tmpReserve.add_price,
                            dis_price: tmpReserve.dis_price,
                            sale_price: tmpReserve.sale_price,
                        };
                    }),
                    price: args.totalPrice,
                },
                json: true,
                simple: false,
                resolveWithFullResponse: true,
            });
            if (response.statusCode !== 200)
                throw new Error(response.body.message);
            console.log('addCOAAuthorization result');
            return response.body.data;
        });
    }
    addCOAAuthorization.call = call;
})(addCOAAuthorization = exports.addCOAAuthorization || (exports.addCOAAuthorization = {}));
var removeCOAAuthorization;
(function (removeCOAAuthorization) {
    function call(args) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield request.del({
                url: `${endPoint}/transactions/${args.transactionId}/authorizations/${args.coaAuthorizationId}`,
                body: {},
                json: true,
                simple: false,
                resolveWithFullResponse: true,
            });
            if (response.statusCode !== 204)
                throw new Error(response.body.message);
            console.log('addCOAAuthorization result');
        });
    }
    removeCOAAuthorization.call = call;
})(removeCOAAuthorization = exports.removeCOAAuthorization || (exports.removeCOAAuthorization = {}));
var addGMOAuthorization;
(function (addGMOAuthorization) {
    function call(args) {
        return __awaiter(this, void 0, void 0, function* () {
            let promoterOwner = args.transaction.attributes.owners.find((owner) => {
                return (owner.group === "PROMOTER");
            });
            let promoterOwnerId = (promoterOwner) ? promoterOwner._id : null;
            let anonymousOwner = args.transaction.attributes.owners.find((owner) => {
                return (owner.group === "ANONYMOUS");
            });
            let anonymousOwnerId = (anonymousOwner) ? anonymousOwner._id : null;
            let response = yield request.post({
                url: `${endPoint}/transactions/${args.transaction._id}/authorizations/gmo`,
                body: {
                    owner_id_from: anonymousOwnerId,
                    owner_id_to: promoterOwnerId,
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
                resolveWithFullResponse: true,
            });
            if (response.statusCode !== 200)
                throw new Error(response.body.message);
            console.log("addGMOAuthorization result:");
            return response.body.data;
        });
    }
    addGMOAuthorization.call = call;
})(addGMOAuthorization = exports.addGMOAuthorization || (exports.addGMOAuthorization = {}));
var removeGMOAuthorization;
(function (removeGMOAuthorization) {
    function call(args) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield request.del({
                url: `${endPoint}/transactions/${args.transactionId}/authorizations/${args.gmoAuthorizationId}`,
                body: {},
                json: true,
                simple: false,
                resolveWithFullResponse: true,
            });
            if (response.statusCode !== 204)
                throw new Error(response.body.message);
            console.log("removeGMOAuthorization result:");
        });
    }
    removeGMOAuthorization.call = call;
})(removeGMOAuthorization = exports.removeGMOAuthorization || (exports.removeGMOAuthorization = {}));
var ownersAnonymous;
(function (ownersAnonymous) {
    function call(args) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield request.patch({
                url: `${endPoint}/transactions/${args.transactionId}/anonymousOwner`,
                body: {
                    name_first: args.name_first,
                    name_last: args.name_last,
                    tel: args.tel,
                    email: args.email,
                },
                json: true,
                simple: false,
                resolveWithFullResponse: true,
            });
            if (response.statusCode !== 204)
                throw new Error(response.body.message);
            console.log("removeGMOAuthorization result:");
        });
    }
    ownersAnonymous.call = call;
})(ownersAnonymous = exports.ownersAnonymous || (exports.ownersAnonymous = {}));
var transactionsEnableInquiry;
(function (transactionsEnableInquiry) {
    function call(args) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield request.patch({
                url: `${endPoint}/transactions/${args.transactionId}/enableInquiry`,
                body: {
                    inquiry_id: args.updateReserveResult.reserve_num,
                    inquiry_pass: args.inquiry_pass
                },
                json: true,
                simple: false,
                resolveWithFullResponse: true,
            });
            if (response.statusCode !== 204)
                throw new Error(response.body.message);
            console.log("transactionsEnableInquiry result:");
        });
    }
    transactionsEnableInquiry.call = call;
})(transactionsEnableInquiry = exports.transactionsEnableInquiry || (exports.transactionsEnableInquiry = {}));
var transactionClose;
(function (transactionClose) {
    function call(args) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield request.patch({
                url: `${endPoint}/transactions/${args.transactionId}/close`,
                body: {},
                json: true,
                simple: false,
                resolveWithFullResponse: true,
            });
            if (response.statusCode !== 204)
                throw new Error(response.body.message);
            console.log('close result:');
        });
    }
    transactionClose.call = call;
})(transactionClose = exports.transactionClose || (exports.transactionClose = {}));
var addEmail;
(function (addEmail) {
    function call(args) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield request.post({
                url: `${endPoint}/transactions/${args.transactionId}/notifications/email`,
                body: {
                    from: args.from,
                    to: args.to,
                    subject: args.subject,
                    content: args.content,
                },
                json: true,
                simple: false,
                resolveWithFullResponse: true,
            });
            if (response.statusCode !== 200)
                throw new Error(response.body.message);
            console.log('addEmail result:' + response.body.data);
            return response.body.data;
        });
    }
    addEmail.call = call;
})(addEmail = exports.addEmail || (exports.addEmail = {}));
var removeEmail;
(function (removeEmail) {
    function call(args) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield request.del({
                url: `${endPoint}/transactions/${args.transactionId}/notifications/${args.emailId}`,
                body: {},
                json: true,
                simple: false,
                resolveWithFullResponse: true,
            });
            if (response.statusCode !== 204)
                throw new Error(response.body.message);
            console.log('removeEmail result:');
        });
    }
    removeEmail.call = call;
})(removeEmail = exports.removeEmail || (exports.removeEmail = {}));
