import express = require('express');
import NamedRoutes = require('named-routes');
import config = require('config');

import SeatSelectController from '../controllers/Reservation/SeatSelectController';
import EnterPurchaserController from '../controllers/Reservation/EnterPurchaserController';
import DenominationSelectController from '../controllers/Reservation/DenominationSelectController';
import ConfirmPurchaseController from '../controllers/Reservation/ConfirmPurchaseController';

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
        res.redirect('/Error/NotFound');
    });

    app.get('/reservation/seatSelect', 'reservation.seatSelect', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        new SeatSelectController(req, res, next).index();
    });

    app.get('/reservation/denominationSelect', 'reservation.denominationSelect', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        new DenominationSelectController(req, res, next).index();
    });

    app.get('/reservation/enterPurchaser', 'reservation.enterPurchaser', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        new EnterPurchaserController(req, res, next).index();
    });

    app.get('/reservation/confirmPurchase', 'reservation.confirmPurchase', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        new ConfirmPurchaseController(req, res, next).index();
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
}
