"use strict";
/**
 * SSKTS API Node.js Client
 *
 * @ignore
 */
Object.defineProperty(exports, "__esModule", { value: true });
const clientCredentialsClient_1 = require("./auth/clientCredentialsClient");
const googleTokenClient_1 = require("./auth/googleTokenClient");
const EventService = require("./service/event");
const OrderService = require("./service/order");
const OrganizationService = require("./service/organization");
const PersonService = require("./service/person");
const PlaceService = require("./service/place");
const PlaceOrderTransactionService = require("./service/transaction/placeOrder");
var auth;
(function (auth) {
    class ClientCredentials extends clientCredentialsClient_1.default {
    }
    auth.ClientCredentials = ClientCredentials;
    class GoogleToken extends googleTokenClient_1.default {
    }
    auth.GoogleToken = GoogleToken;
})(auth = exports.auth || (exports.auth = {}));
var service;
(function (service) {
    service.event = EventService;
    service.order = OrderService;
    service.organization = OrganizationService;
    service.person = PersonService;
    service.place = PlaceService;
    let transaction;
    (function (transaction) {
        transaction.placeOrder = PlaceOrderTransactionService;
    })(transaction = service.transaction || (service.transaction = {}));
})(service = exports.service || (exports.service = {}));
