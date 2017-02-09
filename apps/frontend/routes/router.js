"use strict";
const express = require("express");
const Performances = require("../modules/Performances/PerformancesModule");
const Error = require("../modules/Error/ErrorModule");
const Util = require("../modules/Util/UtilModule");
const purchase = require("./purchase");
const inquiry = require("./inquiry");
const method = require("./method");
let router = express.Router();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (app) => {
    app.use(Util.Module.setLocals);
    router.get('/', (_req, res, _next) => {
        res.redirect('/performances');
    });
    router.get('/performances', Performances.Module.index);
    router.post('/performances', Performances.Module.getPerformances);
    router.get('/500', (_req, _res, _next) => {
        process.exit(1);
    });
    app.use('', router);
    app.use('/purchase', purchase);
    app.use('/inquiry', inquiry);
    app.use('/method', method);
    app.use(Error.Module.index);
    app.use(Error.Module.notFound);
};
