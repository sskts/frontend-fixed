"use strict";
const express = require("express");
const PerformancesModule_1 = require("../modules/Performances/PerformancesModule");
const ErrorModule_1 = require("../modules/Error/ErrorModule");
const UtilModule_1 = require("../modules/Util/UtilModule");
const purchase_1 = require("./purchase");
const inquiry_1 = require("./inquiry");
const method_1 = require("./method");
const router = express.Router();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (app) => {
    app.use(UtilModule_1.default.setLocals);
    router.get('/', (_req, res, _next) => {
        res.redirect('/performances');
    });
    router.get('/performances', PerformancesModule_1.default.index);
    router.post('/performances', PerformancesModule_1.default.getPerformances);
    router.get('/500', (_req, _res, _next) => {
        process.exit(1);
    });
    app.use('', router);
    app.use('/purchase', purchase_1.default);
    app.use('/inquiry', inquiry_1.default);
    app.use('/method', method_1.default);
    app.use(ErrorModule_1.default.index);
    app.use(ErrorModule_1.default.notFound);
};
