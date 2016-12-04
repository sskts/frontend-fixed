"use strict";
const NamedRoutes = require('named-routes');
const SeatSelectController_1 = require('../controllers/Purchase/SeatSelectController');
const EnterPurchaserController_1 = require('../controllers/Purchase/EnterPurchaserController');
const TicketTypeSelectController_1 = require('../controllers/Purchase/TicketTypeSelectController');
const ConfirmPurchaseController_1 = require('../controllers/Purchase/ConfirmPurchaseController');
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
        new SeatSelectController_1.default(req, res, next).seatSelect();
    });
    app.get('/purchase/denominationSelect', 'purchase.ticketTypeSelect', (req, res, next) => {
        new TicketTypeSelectController_1.default(req, res, next).index();
    });
    app.post('/purchase/denominationSelect', 'purchase.ticketTypeSelect', (req, res, next) => {
        new TicketTypeSelectController_1.default(req, res, next).denominationSelect();
    });
    app.get('/purchase/enterPurchaser', 'purchase.enterPurchaser', (req, res, next) => {
        new EnterPurchaserController_1.default(req, res, next).index();
    });
    app.post('/purchase/enterPurchaser', 'purchase.enterPurchaser', (req, res, next) => {
        new EnterPurchaserController_1.default(req, res, next).enterPurchaser();
    });
    app.get('/purchase/confirmPurchase', 'purchase.confirmPurchase', (req, res, next) => {
        new ConfirmPurchaseController_1.default(req, res, next).index();
    });
    app.post('/purchase/confirmPurchase', 'purchase.confirmPurchase', (req, res, next) => {
        new ConfirmPurchaseController_1.default(req, res, next).purchase();
    });
    // app.get('/Error/NotFound', 'Error.NotFound', (req, res, next) => {(new ErrorController(req, res, next)).notFound()});
    // // 404
    // app.use((req, res, next) => {
    //     return res.redirect('/Error/NotFound');
    // });
    // // error handlers
    // app.use((err: any, req, res, next) => {
    //     (new ErrorController(req, res, next)).index(err);
    // });
};
