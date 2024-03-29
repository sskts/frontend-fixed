"use strict";
/**
 * ルーティング
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const moment = require("moment");
const error_controller_1 = require("../controllers/error/error.controller");
const functions_1 = require("../functions");
const requireSDK_1 = require("../middlewares/requireSDK");
const fixed_1 = require("./fixed");
const inquiry_1 = require("./inquiry");
const router = express.Router();
exports.default = (app) => {
    app.use(requireSDK_1.requireSDK);
    // tslint:disable-next-line:variable-name
    app.use((_req, res, next) => {
        res.locals.escapeHtml = functions_1.escapeHtml;
        res.locals.formatPrice = functions_1.formatPrice;
        res.locals.moment = moment;
        res.locals.timeFormat = functions_1.timeFormat;
        res.locals.portalSite = process.env.PORTAL_SITE_URL;
        res.locals.env = process.env.NODE_ENV;
        res.locals.appSiteUrl = process.env.APP_SITE_URL;
        next();
    });
    app.use('', fixed_1.default); // 券売機
    app.use('/inquiry', inquiry_1.default); // 照会
    // エラー
    router.get('/error', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, error_controller_1.errorRender)(new Error(), req, res, next);
    }));
    app.use(error_controller_1.notFoundRender); // 404
    app.use(error_controller_1.errorRender); // error handlers
};
