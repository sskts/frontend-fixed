import express = require('express');
import TicketForm from '../../forms/Purchase/TicketForm';
import PurchaseSession = require('../../models/Purchase/PurchaseModel');
import config = require('config');
import COA = require("@motionpicture/coa-service");
import GMO = require("@motionpicture/gmo-service");
import MP = require('../../../../libs/MP');


export namespace Module {
    /**
     * 券種選択
     */
    export function index(req: express.Request, res: express.Response, next: express.NextFunction): void {
        if (!req.session) return next(req.__('common.error.property'));
        let purchaseModel = new PurchaseSession.PurchaseModel(req.session['purchase']);
        if (!purchaseModel.accessAuth(PurchaseSession.PurchaseModel.TICKET_STATE)) return next(new Error(req.__('common.error.access')));
        if (!purchaseModel.performance) return next(new Error(req.__('common.error.property')));

        //コアAPI券種取得
        let performance = purchaseModel.performance;
        COA.salesTicketInterface.call({
            /** 施設コード */
            theater_code: performance.attributes.theater._id,
            /** 上映日 */
            date_jouei: performance.attributes.day,
            /** 作品コード */
            title_code: performance.attributes.film.coa_title_code,
            /** 作品枝番 */
            title_branch_num: performance.attributes.film.coa_title_branch_num,
            /** 上映時刻 */
            time_begin: performance.attributes.time_start,
            /** スクリーンコード */
            // screen_code: performance.screen._id,
        }).then((result) => {
            if (!purchaseModel.transactionMP) return next(new Error(req.__('common.error.property')));
            res.locals['tickets'] = result.list_ticket;
            res.locals['performance'] = performance;
            res.locals['reserveSeats'] = purchaseModel.reserveSeats;
            res.locals['reserveTickets'] = purchaseModel.reserveTickets;
            res.locals['step'] = PurchaseSession.PurchaseModel.TICKET_STATE;
            res.locals['transactionId'] = purchaseModel.transactionMP._id;
            

            //セッション更新
            if (!req.session) return next(req.__('common.error.property'));
            req.session['purchase'] = purchaseModel.formatToSession();
            //券種選択表示
            return res.render('purchase/ticket');
        }, (err) => {
            return next(new Error(err.message));
        });
    }

    /**
     * 券種決定
     */
    export function select(req: express.Request, res: express.Response, next: express.NextFunction): void {
        if (!req.session) return next(req.__('common.error.property'));
        let purchaseModel = new PurchaseSession.PurchaseModel(req.session['purchase']);
        if (!purchaseModel.transactionMP) return next(new Error(req.__('common.error.property'))); 
        
        //取引id確認
        if (req.body.transaction_id !== purchaseModel.transactionMP._id) return next(new Error(req.__('common.error.access')));  
       

        //バリデーション
        let form = TicketForm(req);
        form(req, res, () => {
            //座席情報をセッションへ
            purchaseModel.reserveTickets = JSON.parse(req.body.reserve_tickets);
            ticketValidation(req, purchaseModel).then(() => {
                console.log('券種決定完了');
                if (req.body['mvtk']) {
                    if (!req.session) return next(req.__('common.error.property'));
                    //セッション更新
                    req.session['purchase'] = purchaseModel.formatToSession();
                    //ムビチケ入力へ
                    return res.redirect('/purchase/mvtk');
                } else {
                    upDateAuthorization(req, purchaseModel).then(() => {
                        if (!req.session) return next(req.__('common.error.property'));
                        //セッション更新
                        req.session['purchase'] = purchaseModel.formatToSession();
                        //購入者情報入力へ
                        return res.redirect('/purchase/input');
                    }, (err) => {
                        return next(new Error(err.message));
                    });
                }
            }, (err) => {
                return next(new Error(err.message));
            });
        });
    }

    /**
     * 券種検証
     */
    async function ticketValidation(req: express.Request, purchaseModel: PurchaseSession.PurchaseModel): Promise<void> {
        if (!purchaseModel.performance) throw new Error(req.__('common.error.property'));
        if (!purchaseModel.reserveTickets) throw new Error(req.__('common.error.property'));
        //コアAPI券種取得
        let performance = purchaseModel.performance;
        let salesTickets = await COA.salesTicketInterface.call({
            /** 施設コード */
            theater_code: performance.attributes.theater._id,
            /** 上映日 */
            date_jouei: performance.attributes.day,
            /** 作品コード */
            title_code: performance.attributes.film.coa_title_code,
            /** 作品枝番 */
            title_branch_num: performance.attributes.film.coa_title_branch_num,
            /** 上映時刻 */
            time_begin: performance.attributes.time_start,
            /** スクリーンコード */
            // screen_code: performance.screen._id,
        });

        let reserveTickets = purchaseModel.reserveTickets;
        for (let reserveTicket of reserveTickets) {
            for (let salesTicket of salesTickets.list_ticket) {
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
     */
    async function upDateAuthorization(req: express.Request, purchaseModel: PurchaseSession.PurchaseModel): Promise<void> {
        if (!purchaseModel.transactionMP) throw new Error(req.__('common.error.property'));
        if (!purchaseModel.performance) throw new Error(req.__('common.error.property'));
        if (!purchaseModel.reserveSeats) throw new Error(req.__('common.error.property'));
        if (!purchaseModel.reserveTickets) throw new Error(req.__('common.error.property'));
        if (!purchaseModel.authorizationCOA) throw new Error(req.__('common.error.property'));

        // COAオーソリ削除
        await MP.removeCOAAuthorization.call({
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
            await GMO.CreditService.alterTranInterface.call({
                shop_id: config.get<string>('gmo_shop_id'),
                shop_pass: config.get<string>('gmo_shop_password'),
                access_id: purchaseModel.transactionGMO.access_id,
                access_pass: purchaseModel.transactionGMO.access_pass,
                job_cd: GMO.Util.JOB_CD_VOID
            });
            console.log('GMOオーソリ取消');

            // GMOオーソリ削除
            await MP.removeGMOAuthorization.call({
                transactionId: purchaseModel.transactionMP._id,
                gmoAuthorizationId: purchaseModel.authorizationGMO._id,
            });
            console.log('GMOオーソリ削除');
        }

        //COAオーソリ追加
        let COAAuthorizationResult = await MP.addCOAAuthorization.call({
            transaction: purchaseModel.transactionMP,
            reserveSeatsTemporarilyResult: purchaseModel.reserveSeats,
            salesTicketResults: purchaseModel.reserveTickets,
            performance: purchaseModel.performance,
            totalPrice: purchaseModel.getReserveAmount()
        });
        console.log('MPCOAオーソリ追加', COAAuthorizationResult);

        purchaseModel.authorizationCOA = COAAuthorizationResult;



    }
}
