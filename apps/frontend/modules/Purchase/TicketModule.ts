/**
 * 購入券種選択
 * @namespace Purchase.TicketModule
 */

import * as COA from '@motionpicture/coa-service';
import * as GMO from '@motionpicture/gmo-service';
import * as express from 'express';
import * as MP from '../../../../libs/MP';
import TicketForm from '../../forms/Purchase/TicketForm';
import * as PurchaseSession from '../../models/Purchase/PurchaseModel';

/**
 * 券種選択
 * @memberOf Purchase.TicketModule
 * @function index
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
export function index(req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (!req.session) return next(req.__('common.error.property'));
    const purchaseModel = new PurchaseSession.PurchaseModel((<any>req.session).purchase);
    if (!purchaseModel.accessAuth(PurchaseSession.PurchaseModel.TICKET_STATE)) return next(new Error(req.__('common.error.access')));
    if (!purchaseModel.performance) return next(new Error(req.__('common.error.property')));

    //コアAPI券種取得
    const performance = purchaseModel.performance;
    COA.salesTicketInterface.call({
        theater_code: performance.attributes.theater._id,
        date_jouei: performance.attributes.day,
        title_code: performance.attributes.film.coa_title_code,
        title_branch_num: performance.attributes.film.coa_title_branch_num,
        time_begin: performance.attributes.time_start
        // screen_code: performance.screen._id,
    }).then(
        (result) => {
            if (!purchaseModel.transactionMP) return next(new Error(req.__('common.error.property')));
            res.locals.tickets = result.list_ticket;
            res.locals.performance = performance;
            res.locals.reserveSeats = purchaseModel.reserveSeats;
            res.locals.reserveTickets = purchaseModel.reserveTickets;
            res.locals.step = PurchaseSession.PurchaseModel.TICKET_STATE;
            res.locals.transactionId = purchaseModel.transactionMP._id;

            //セッション更新
            if (!req.session) return next(req.__('common.error.property'));
            (<any>req.session).purchase = purchaseModel.formatToSession();
            //券種選択表示
            return res.render('purchase/ticket');
        },
        (err) => {
            return next(new Error(err.message));
        }
        );
}

/**
 * 券種決定
 * @memberOf Purchase.TicketModule
 * @function select
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
export function select(req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (!req.session) return next(req.__('common.error.property'));
    const purchaseModel = new PurchaseSession.PurchaseModel((<any>req.session).purchase);
    if (!purchaseModel.transactionMP) return next(new Error(req.__('common.error.property')));

    //取引id確認
    if (req.body.transaction_id !== purchaseModel.transactionMP._id) return next(new Error(req.__('common.error.access')));

    //バリデーション
    const form = TicketForm(req);
    form(req, res, () => {
        //座席情報をセッションへ
        purchaseModel.reserveTickets = JSON.parse(req.body.reserve_tickets);
        ticketValidation(req, purchaseModel).then(
            () => {
                console.log('券種決定完了');
                if (req.body.mvtk) {
                    if (!req.session) return next(req.__('common.error.property'));
                    //セッション更新
                    (<any>req.session).purchase = purchaseModel.formatToSession();
                    //ムビチケ入力へ
                    return res.redirect('/purchase/mvtk');
                } else {
                    upDateAuthorization(req, purchaseModel).then(
                        () => {
                            if (!req.session) return next(req.__('common.error.property'));
                            //セッション更新
                            (<any>req.session).purchase = purchaseModel.formatToSession();
                            //購入者情報入力へ
                            return res.redirect('/purchase/input');
                        },
                        (err) => {
                            return next(new Error(err.message));
                        }
                    );
                }
            },
            (err) => {
                return next(new Error(err.message));
            }
        );
    });
}

/**
 * 券種検証
 * @memberOf Purchase.TicketModule
 * @function ticketValidation
 * @param {express.Request} req
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {Promise<void>}
 */
async function ticketValidation(req: express.Request, purchaseModel: PurchaseSession.PurchaseModel): Promise<void> {
    if (!purchaseModel.performance) throw new Error(req.__('common.error.property'));
    if (!purchaseModel.reserveTickets) throw new Error(req.__('common.error.property'));
    //コアAPI券種取得
    const performance = purchaseModel.performance;
    const salesTickets = await COA.salesTicketInterface.call({
        theater_code: performance.attributes.theater._id,
        date_jouei: performance.attributes.day,
        title_code: performance.attributes.film.coa_title_code,
        title_branch_num: performance.attributes.film.coa_title_branch_num,
        time_begin: performance.attributes.time_start
        // screen_code: performance.screen._id,
    });

    const reserveTickets = purchaseModel.reserveTickets;
    for (const reserveTicket of reserveTickets) {
        for (const salesTicket of salesTickets.list_ticket) {
            if (salesTicket.ticket_code === reserveTicket.ticket_code) {
                if (salesTicket.sale_price !== reserveTicket.sale_price) {
                    console.log(`${reserveTicket.seat_code}: 券種検証NG`);
                    throw new Error(req.__('common.error.access'));
                }
                console.log(`${reserveTicket.seat_code}: 券種検証OK`);
                break;
            }
        }
    }
}

/**
 * オーソリ追加
 * @memberOf Purchase.TicketModule
 * @function upDateAuthorization
 * @param {express.Request} req
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {Promise<void>}
 */
async function upDateAuthorization(req: express.Request, purchaseModel: PurchaseSession.PurchaseModel): Promise<void> {
    if (!purchaseModel.transactionMP) throw new Error(req.__('common.error.property'));
    if (!purchaseModel.performance) throw new Error(req.__('common.error.property'));
    if (!purchaseModel.reserveSeats) throw new Error(req.__('common.error.property'));
    if (!purchaseModel.reserveTickets) throw new Error(req.__('common.error.property'));
    if (!purchaseModel.authorizationCOA) throw new Error(req.__('common.error.property'));

    // COAオーソリ削除
    await MP.removeCOAAuthorization({
        transactionId: purchaseModel.transactionMP._id,
        coaAuthorizationId: purchaseModel.authorizationCOA._id
    });

    console.log('MPCOAオーソリ削除');

    if (purchaseModel.transactionGMO
        && purchaseModel.authorizationGMO
        && purchaseModel.orderId) {
        //GMOオーソリあり
        if (!purchaseModel.transactionGMO) throw new Error(req.__('common.error.property'));
        if (!purchaseModel.authorizationGMO) throw new Error(req.__('common.error.property'));
        if (!purchaseModel.orderId) throw new Error(req.__('common.error.property'));

        //GMOオーソリ取消
        await GMO.CreditService.alterTran({
            shopId: process.env.GMO_SHOP_ID,
            shopPass: process.env.GMO_SHOP_PASSWORD,
            accessId: purchaseModel.transactionGMO.accessId,
            accessPass: purchaseModel.transactionGMO.accessPass,
            jobCd: GMO.Util.JOB_CD_VOID
        });
        console.log('GMOオーソリ取消');

        // GMOオーソリ削除
        await MP.removeGMOAuthorization({
            transactionId: purchaseModel.transactionMP._id,
            gmoAuthorizationId: purchaseModel.authorizationGMO._id
        });
        console.log('GMOオーソリ削除');
    }

    //COAオーソリ追加
    const coaAuthorizationResult = await MP.addCOAAuthorization({
        transaction: purchaseModel.transactionMP,
        reserveSeatsTemporarilyResult: purchaseModel.reserveSeats,
        salesTicketResults: purchaseModel.reserveTickets,
        performance: purchaseModel.performance,
        totalPrice: purchaseModel.getReserveAmount()
    });
    console.log('MPCOAオーソリ追加', coaAuthorizationResult);
    purchaseModel.authorizationCOA = coaAuthorizationResult;
}
