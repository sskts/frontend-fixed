import express = require('express');
import NamedRoutes = require('named-routes');
import config = require('config');

import PerformanceController from '..//controllers/Performance/PerformanceController';

import SeatSelectController from '../controllers/Purchase/SeatSelectController';
import EnterPurchaseController from '../controllers/Purchase/EnterPurchaseController';
import TicketTypeSelectController from '../controllers/Purchase/TicketTypeSelectController';
import ConfirmController from '../controllers/Purchase/ConfirmController';

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
        res.redirect(router.build('performance', {}));
    });

    app.get('/performance', 'performance', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        new PerformanceController(req, res, next).index();
    });

    app.get('/purchase', 'purchase', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.redirect(router.build('performance', {}));
    });

    app.get('/purchase/seatSelect', 'purchase.seatSelect', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        new SeatSelectController(req, res, next).index();
    });

    app.post('/purchase/seatSelect', 'purchase.seatSelect', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        new SeatSelectController(req, res, next).submit();
    });

    app.get('/purchase/ticketTypeSelect', 'purchase.ticketTypeSelect', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        new TicketTypeSelectController(req, res, next).index();
    });

    app.post('/purchase/ticketTypeSelect', 'purchase.ticketTypeSelect', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        new TicketTypeSelectController(req, res, next).submit();
    });

    app.get('/purchase/enterPurchase', 'purchase.enterPurchase', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        new EnterPurchaseController(req, res, next).index();
    });

    app.post('/purchase/enterPurchase', 'purchase.enterPurchase', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        new EnterPurchaseController(req, res, next).submit();
    });

    app.get('/purchase/confirm', 'purchase.confirmPurchase', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        new ConfirmController(req, res, next).index();
    });

    app.post('/purchase/confirm', 'purchase.confirm', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        new ConfirmController(req, res, next).purchase();
    });

    app.get('/500', '500', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        process.exit(1);
    });






    // error handlers
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        new ErrorController(req, res, next).index(err);
    });

    // 404
    app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
        new ErrorController(req, res, next).notFound();
    });

    
}
