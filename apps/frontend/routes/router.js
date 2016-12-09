"use strict";
const NamedRoutes = require('named-routes');
const SeatSelectController_1 = require('../controllers/Purchase/SeatSelectController');
const EnterPurchaseController_1 = require('../controllers/Purchase/EnterPurchaseController');
const TicketTypeSelectController_1 = require('../controllers/Purchase/TicketTypeSelectController');
const ConfirmPurchaseController_1 = require('../controllers/Purchase/ConfirmPurchaseController');
const ErrorController_1 = require('../controllers/Error/ErrorController');
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (app) => {
    let router = new NamedRoutes();
    router.extendExpress(app);
    router.registerAppHelpers(app);
    app.get('/', 'index', (req, res, next) => {
        res.redirect(router.build('purchase.seatSelect', {}));
    });
    app.get('/purchase', 'purchase', (req, res, next) => {
        res.redirect(router.build('purchase.seatSelect', {}));
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
    app.get('/purchase/confirmPurchase', 'purchase.confirmPurchase', (req, res, next) => {
        new ConfirmPurchaseController_1.default(req, res, next).index();
    });
    app.post('/purchase/confirmPurchase', 'purchase.confirmPurchase', (req, res, next) => {
        new ConfirmPurchaseController_1.default(req, res, next).purchase();
    });
    app.get('/500', 'index', (req, res, next) => {
        process.exit(1);
    });
    app.get('/Error/NotFound', 'Error.NotFound', (req, res, next) => {
        (new ErrorController_1.default(req, res, next)).notFound();
    });
    // 404
    app.use((req, res, next) => {
        return res.redirect('/Error/NotFound');
    });
    // error handlers
    app.use((err, req, res, next) => {
        (new ErrorController_1.default(req, res, next)).index(err);
    });
};
