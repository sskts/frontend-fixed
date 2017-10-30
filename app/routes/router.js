"use strict";
/**
 * ルーティング
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const ErrorModule = require("../modules/Error/ErrorModule");
const UtilModule = require("../modules/Util/UtilModule");
const fixed_1 = require("./fixed");
const inquiry_1 = require("./inquiry");
const method_1 = require("./method");
const purchase_1 = require("./purchase");
const root_1 = require("./root");
const router = express.Router();
exports.default = (app) => {
    app.use('', root_1.default); // ROOT
    app.use('/purchase', purchase_1.default); // 購入
    app.use('/inquiry', inquiry_1.default); // 照会
    app.use('/method', method_1.default); // 方法
    if (process.env.VIEW_TYPE === UtilModule.VIEW.Fixed) {
        app.use('', fixed_1.default); // 券売機
    }
    //エラー
    router.get('/error', (req, res, next) => {
        ErrorModule.errorRender(new Error(), req, res, next);
    });
    app.use(ErrorModule.notFoundRender); // 404
    app.use(ErrorModule.errorRender); // error handlers
};
