"use strict";
const express = require("express");
const ErrorModule_1 = require("../modules/Error/ErrorModule");
const PerformancesModule_1 = require("../modules/Performances/PerformancesModule");
const UtilModule_1 = require("../modules/Util/UtilModule");
const inquiry_1 = require("./inquiry");
const method_1 = require("./method");
const purchase_1 = require("./purchase");
/**
 * ルーティング
 */
const router = express.Router();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (app) => {
    app.use(UtilModule_1.default.setLocals);
    // tslint:disable-next-line:variable-name
    router.get('/', (_req, res, _next) => {
        res.redirect('/performances');
    });
    //パフォーマンス一覧
    router.get('/performances', PerformancesModule_1.default.index);
    //パフォーマンス一覧
    router.post('/performances', PerformancesModule_1.default.getPerformances);
    //再起動
    // tslint:disable-next-line:variable-name
    router.get('/500', (_req, _res, _next) => {
        process.exit(1);
    });
    app.use('', router);
    //購入
    app.use('/purchase', purchase_1.default);
    //照会
    app.use('/inquiry', inquiry_1.default);
    //方法
    app.use('/method', method_1.default);
    // error handlers
    app.use(ErrorModule_1.default.index);
    // 404
    app.use(ErrorModule_1.default.notFound);
};
