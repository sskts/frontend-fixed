import express = require('express');
import NamedRoutes = require('named-routes');
import config = require('config');

import SeatSelectController from '../controllers/Purchase/SeatSelectController';
import EnterPurchaserController from '../controllers/Purchase/EnterPurchaserController';
import TicketTypeSelectController from '../controllers/Purchase/TicketTypeSelectController';
import ConfirmPurchaseController from '../controllers/Purchase/ConfirmPurchaseController';

import ErrorController from '../controllers/Error/ErrorController';

/**
 * URLルーティング
 * 
 * app.get(パス, ルーティング名称, メソッド);
 * といった形でルーティングを登録する
 * ルーティング名称は、ejs側やコントローラーでURLを生成する際に用いたりするので、意識的にページ一意な値を定めること
 * 
 * リクエスト毎に、req,res,nextでコントローラーインスタンスを生成して、URLに応じたメソッドを実行する、という考え方
 * 
 */
export default (app: any) => {
    let router: Express.NamedRoutes = new NamedRoutes();
    router.extendExpress(app);
    router.registerAppHelpers(app);

    app.get('/', 'index', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.redirect(router.build('purchase.seatSelect', {}));
    });

    app.get('/purchase', 'purchase', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.redirect(router.build('purchase.seatSelect', {}));
    });

    app.get('/purchase/seatSelect', 'purchase.seatSelect', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        new SeatSelectController(req, res, next).index();
    });

    app.post('/purchase/seatSelect', 'purchase.seatSelect', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        new SeatSelectController(req, res, next).seatSelect();
    });

    app.get('/purchase/denominationSelect', 'purchase.ticketTypeSelect', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        new TicketTypeSelectController(req, res, next).index();
    });

    app.post('/purchase/denominationSelect', 'purchase.ticketTypeSelect', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        new TicketTypeSelectController(req, res, next).denominationSelect();
    });

    app.get('/purchase/enterPurchaser', 'purchase.enterPurchaser', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        new EnterPurchaserController(req, res, next).index();
    });

    app.post('/purchase/enterPurchaser', 'purchase.enterPurchaser', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        new EnterPurchaserController(req, res, next).enterPurchaser();
    });

    app.get('/purchase/confirmPurchase', 'purchase.confirmPurchase', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        new ConfirmPurchaseController(req, res, next).index();
    });

    app.post('/purchase/confirmPurchase', 'purchase.confirmPurchase', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        new ConfirmPurchaseController(req, res, next).purchase();
    });

    











    app.get('/Error/NotFound', 'Error.NotFound', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        (new ErrorController(req, res, next)).notFound()}
    );

    // 404
    app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
        return res.redirect('/Error/NotFound');
    });

    // error handlers
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        (new ErrorController(req, res, next)).index(err);
    });
}
