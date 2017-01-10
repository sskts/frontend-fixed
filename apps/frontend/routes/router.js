"use strict";
const NamedRoutes = require('named-routes');
const BaseController_1 = require('../controllers/BaseController');
const PerformanceController_1 = require('..//controllers/Performance/PerformanceController');
const SeatController_1 = require('../controllers/Purchase/SeatController');
const InputController_1 = require('../controllers/Purchase/InputController');
const TicketController_1 = require('../controllers/Purchase/TicketController');
const ConfirmController_1 = require('../controllers/Purchase/ConfirmController');
const MvtkInputController_1 = require('../controllers/Purchase/Mvtk/MvtkInputController');
const MvtkAuthController_1 = require('../controllers/Purchase/Mvtk/MvtkAuthController');
const MvtkConfirmController_1 = require('../controllers/Purchase/Mvtk/MvtkConfirmController');
const InquiryController_1 = require('../controllers/Inquiry/InquiryController');
const MethodController_1 = require('../controllers/Method/MethodController');
const ErrorController_1 = require('../controllers/Error/ErrorController');
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (app) => {
    let router = new NamedRoutes();
    router.extendExpress(app);
    router.registerAppHelpers(app);
    app.get('/', 'index', (req, res, next) => {
        new BaseController_1.default(req, res, next);
        res.redirect(router.build('performance', {}));
    });
    app.get('/performance', 'performance', (req, res, next) => {
        new PerformanceController_1.default(req, res, next).index();
    });
    app.post('/performance', 'performance', (req, res, next) => {
        new PerformanceController_1.default(req, res, next).getPerformances(req.body.day);
    });
    app.get('/purchase', 'purchase', (req, res, next) => {
        new BaseController_1.default(req, res, next);
        res.redirect(router.build('performance', {}));
    });
    app.get('/purchase/seat', 'purchase.seat', (req, res, next) => {
        new SeatController_1.default(req, res, next).index();
    });
    app.post('/purchase/seat', 'purchase.seat', (req, res, next) => {
        new SeatController_1.default(req, res, next).select();
    });
    app.post('/purchase/getScreenStateReserve', 'purchase.getScreenStateReserve', (req, res, next) => {
        new SeatController_1.default(req, res, next).getScreenStateReserve();
    });
    app.get('/purchase/ticket', 'purchase.ticket', (req, res, next) => {
        new TicketController_1.default(req, res, next).index();
    });
    app.post('/purchase/ticket', 'purchase.ticket', (req, res, next) => {
        new TicketController_1.default(req, res, next).select();
    });
    app.get('/purchase/input', 'purchase.input', (req, res, next) => {
        new InputController_1.default(req, res, next).index();
    });
    app.post('/purchase/input', 'purchase.input', (req, res, next) => {
        new InputController_1.default(req, res, next).submit();
    });
    app.get('/purchase/confirm', 'purchase.confirm', (req, res, next) => {
        new ConfirmController_1.default(req, res, next).index();
    });
    app.post('/purchase/confirm', 'purchase.confirm', (req, res, next) => {
        new ConfirmController_1.default(req, res, next).purchase();
    });
    app.get('/purchase/mvtk', 'purchase.mvtk', (req, res, next) => {
        new MvtkInputController_1.default(req, res, next).index();
    });
    app.post('/purchase/mvtk', 'purchase.mvtk', (req, res, next) => {
        new MvtkInputController_1.default(req, res, next).auth();
    });
    app.get('/purchase/mvtk/auth', 'purchase.mvtk.auth', (req, res, next) => {
        new MvtkAuthController_1.default(req, res, next).index();
    });
    app.post('/purchase/mvtk/auth', 'purchase.mvtk.auth', (req, res, next) => {
        new MvtkAuthController_1.default(req, res, next).submit();
    });
    app.get('/purchase/mvtk/confirm', 'purchase.mvtk.confirm', (req, res, next) => {
        new MvtkConfirmController_1.default(req, res, next).index();
    });
    app.post('/purchase/mvtk/confirm', 'purchase.mvtk.confirm', (req, res, next) => {
        new MvtkConfirmController_1.default(req, res, next).submit();
    });
    app.get('/inquiry/login', 'inquiry', (req, res, next) => {
        new InquiryController_1.default(req, res, next).login();
    });
    app.post('/inquiry/login', 'inquiry', (req, res, next) => {
        new InquiryController_1.default(req, res, next).auth();
    });
    app.get('/inquiry', 'inquiry', (req, res, next) => {
        new InquiryController_1.default(req, res, next).index();
    });
    app.get('/inquiry/print', 'inquiry.print', (req, res, next) => {
        new InquiryController_1.default(req, res, next).print();
    });
    app.get('/method/entry', 'method.ticketing', (req, res, next) => {
        new MethodController_1.default(req, res, next).entry();
    });
    app.get('/method/ticketing', 'method.ticketing', (req, res, next) => {
        new MethodController_1.default(req, res, next).ticketing();
    });
    app.get('/500', '500', (req, res, next) => {
        new BaseController_1.default(req, res, next);
        process.exit(1);
    });
    app.use((err, req, res, next) => {
        new ErrorController_1.default(req, res, next).index(err);
    });
    app.use((req, res, next) => {
        new ErrorController_1.default(req, res, next).notFound();
    });
};
