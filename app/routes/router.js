"use strict";
/**
 * ルーティング
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const SupertestRequest = require("../middlewares/supertestRequest");
const ErrorModule = require("../modules/Error/ErrorModule");
const PerformancesModule = require("../modules/Performances/PerformancesModule");
const inquiry_1 = require("./inquiry");
const method_1 = require("./method");
const purchase_1 = require("./purchase");
const router = express.Router();
exports.default = (app) => {
    if (process.env.NODE_ENV === 'development') {
        app.use(SupertestRequest.supertestSession);
    }
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        // tslint:disable-next-line:variable-name
        router.get('/', (_req, res, _next) => {
            res.redirect('/performances');
        });
        //パフォーマンス一覧
        router.get('/performances', PerformancesModule.index);
        //パフォーマンス一覧
        router.post('/performances', PerformancesModule.getPerformances);
        //再起動
        // tslint:disable-next-line:variable-name
        router.get('/500', (_req, _res, _next) => {
            process.exit(1);
        });
        //セッション作成
        // tslint:disable-next-line:variable-name
        router.get('/create/session', createSession);
        //スクリーンテスト
        // tslint:disable-next-line:variable-name
        router.get('/screen', (_req, res, _next) => {
            res.render('screens/test');
        });
    }
    app.use('', router);
    //購入
    app.use('/purchase', purchase_1.default);
    //照会
    app.use('/inquiry', inquiry_1.default);
    //方法
    app.use('/method', method_1.default);
    //エラー
    router.get('/error', (req, res, next) => {
        ErrorModule.index(new Error(), req, res, next);
    });
    // error handlers
    app.use(ErrorModule.index);
    // 404
    app.use(ErrorModule.notFound);
};
/**
 * セッション作成
 * @function createSession
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
// tslint:disable-next-line:variable-name
function createSession(req, _res, next) {
    if (req.session === undefined) {
        next();
        return;
    }
    req.session.purchase = (req.body.purchase !== undefined) ? req.body.purchase : null;
    req.session.inquiry = (req.body.inquiry !== undefined) ? req.body.inquiry : null;
    req.session.complete = (req.body.complete !== undefined) ? req.body.complete : null;
    next();
    return;
}
