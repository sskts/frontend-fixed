"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * MPサービス
 * @desc シネマサンシャインAPI
 */
const filmService = require("./lib/services/film");
const oauthService = require("./lib/services/oauth");
const performanceService = require("./lib/services/performance");
const screenService = require("./lib/services/screen");
const theaterService = require("./lib/services/theater");
const transactionService = require("./lib/services/transaction");
/**
 * サービスモジュール群
 * @namespace services
 */
var services;
(function (services) {
    services.film = filmService;
    services.oauth = oauthService;
    services.performance = performanceService;
    services.screen = screenService;
    services.theater = theaterService;
    services.transaction = transactionService;
})(services = exports.services || (exports.services = {}));
