"use strict";
const NamedRoutes = require('named-routes');
const PerformanceController_1 = require('..//controllers/Performance/PerformanceController');
const SeatSelectController_1 = require('../controllers/Purchase/SeatSelectController');
const EnterPurchaseController_1 = require('../controllers/Purchase/EnterPurchaseController');
const TicketTypeSelectController_1 = require('../controllers/Purchase/TicketTypeSelectController');
const ConfirmController_1 = require('../controllers/Purchase/ConfirmController');
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
    app.get('/purchase/seatSelect', 'purchase.seatSelect', (req, res, next) => {
        new SeatSelectController_1.default(req, res, next).index();
    });
    app.post('/purchase/seatSelect', 'purchase.seatSelect', (req, res, next) => {
        new SeatSelectController_1.default(req, res, next).submit();
    });
    app.get('/purchase/ticketTypeSelect', 'purchase.ticketTypeSelect', (req, res, next) => {
        new TicketTypeSelectController_1.default(req, res, next).index();
    });
    app.post('/purchase/ticketTypeSelect', 'purchase.ticketTypeSelect', (req, res, next) => {
        new TicketTypeSelectController_1.default(req, res, next).submit();
    });
    app.get('/purchase/enterPurchase', 'purchase.enterPurchase', (req, res, next) => {
        new EnterPurchaseController_1.default(req, res, next).index();
    });
    app.post('/purchase/enterPurchase', 'purchase.enterPurchase', (req, res, next) => {
        new EnterPurchaseController_1.default(req, res, next).submit();
    });
    app.get('/purchase/confirm', 'purchase.confirmPurchase', (req, res, next) => {
        new ConfirmController_1.default(req, res, next).index();
    });
    app.post('/purchase/confirm', 'purchase.confirm', (req, res, next) => {
        new ConfirmController_1.default(req, res, next).purchase();
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
