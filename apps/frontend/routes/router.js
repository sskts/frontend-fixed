"use strict";
const NamedRoutes = require('named-routes');
const SeatSelectController_1 = require('../controllers/Reservation/SeatSelectController');
const EnterPurchaserController_1 = require('../controllers/Reservation/EnterPurchaserController');
const DenominationSelectController_1 = require('../controllers/Reservation/DenominationSelectController');
const ConfirmPurchaseController_1 = require('../controllers/Reservation/ConfirmPurchaseController');
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (app) => {
    let router = new NamedRoutes();
    router.extendExpress(app);
    router.registerAppHelpers(app);
    app.get('/', 'index', (req, res, next) => {
        res.redirect('/Error/NotFound');
    });
    app.get('/reservation/seatSelect', 'reservation.seatSelect', (req, res, next) => {
        new SeatSelectController_1.default(req, res, next).index();
    });
    app.get('/reservation/denominationSelect', 'reservation.denominationSelect', (req, res, next) => {
        new DenominationSelectController_1.default(req, res, next).index();
    });
    app.get('/reservation/enterPurchaser', 'reservation.enterPurchaser', (req, res, next) => {
        new EnterPurchaserController_1.default(req, res, next).index();
    });
    app.get('/reservation/confirmPurchase', 'reservation.confirmPurchase', (req, res, next) => {
        new ConfirmPurchaseController_1.default(req, res, next).index();
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
