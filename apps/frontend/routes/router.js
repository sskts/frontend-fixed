"use strict";
const NamedRoutes = require('named-routes');
const PerformanceController_1 = require('..//controllers/Performance/PerformanceController');
const SeatController_1 = require('../controllers/Purchase/SeatController');
const InputController_1 = require('../controllers/Purchase/InputController');
const TicketController_1 = require('../controllers/Purchase/TicketController');
const ConfirmController_1 = require('../controllers/Purchase/ConfirmController');
const InquiryController_1 = require('../controllers/Inquiry/InquiryController');
const MethodController_1 = require('../controllers/Method/MethodController');
const ErrorController_1 = require('../controllers/Error/ErrorController');
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (app) => {
    let router = new NamedRoutes();
    router.extendExpress(app);
    router.registerAppHelpers(app);
    app.get('/', 'index', (req, res, next) => {
        res.redirect(router.build('performance', {}));
    });
    app.get('/performance', 'performance', (req, res, next) => {
        new PerformanceController_1.default(req, res, next).index();
    });
    app.get('/purchase', 'purchase', (req, res, next) => {
        res.redirect(router.build('performance', {}));
    });
    //座席選択
    app.get('/purchase/seat', 'purchase.seat', (req, res, next) => {
        new SeatController_1.default(req, res, next).index();
    });
    app.post('/purchase/seat', 'purchase.seat', (req, res, next) => {
        new SeatController_1.default(req, res, next).select();
    });
    //券種選択
    app.get('/purchase/ticket', 'purchase.ticket', (req, res, next) => {
        new TicketController_1.default(req, res, next).index();
    });
    app.post('/purchase/ticket', 'purchase.ticket', (req, res, next) => {
        new TicketController_1.default(req, res, next).select();
    });
    //購入者情報入力
    app.get('/purchase/input', 'purchase.input', (req, res, next) => {
        new InputController_1.default(req, res, next).index();
    });
    app.post('/purchase/input', 'purchase.input', (req, res, next) => {
        new InputController_1.default(req, res, next).submit();
    });
    //購入内容確認
    app.get('/purchase/confirm', 'purchase.confirm', (req, res, next) => {
        new ConfirmController_1.default(req, res, next).index();
    });
    app.post('/purchase/confirm', 'purchase.confirm', (req, res, next) => {
        new ConfirmController_1.default(req, res, next).purchase();
    });
    //チケット照会ログイン
    app.get('/inquiry/login', 'inquiry', (req, res, next) => {
        new InquiryController_1.default(req, res, next).login();
    });
    app.post('/inquiry/login', 'inquiry', (req, res, next) => {
        new InquiryController_1.default(req, res, next).auth();
    });
    //チケット照会
    app.get('/inquiry', 'inquiry', (req, res, next) => {
        new InquiryController_1.default(req, res, next).index();
    });
    //チケット照会(QRコード発行印刷ページ)
    app.get('/inquiry/print', 'inquiry.print', (req, res, next) => {
        new InquiryController_1.default(req, res, next).print();
    });
    //入場方法説明
    app.get('/method/entry', 'method.ticketing', (req, res, next) => {
        new MethodController_1.default(req, res, next).entry();
    });
    //発券方法説明
    app.get('/method/ticketing', 'method.ticketing', (req, res, next) => {
        new MethodController_1.default(req, res, next).ticketing();
    });
    app.get('/500', '500', (req, res, next) => {
        process.exit(1);
    });
    // error handlers
    app.use((err, req, res, next) => {
        new ErrorController_1.default(req, res, next).index(err);
    });
    // 404
    app.use((req, res, next) => {
        new ErrorController_1.default(req, res, next).notFound();
    });
};
