/**
 * 購入券種選択
 * @namespace Purchase.TicketModule
 */

import * as COA from '@motionpicture/coa-service';
import * as GMO from '@motionpicture/gmo-service';
import * as debug from 'debug';
import * as express from 'express';
import * as MP from '../../../../libs/MP';
import TicketForm from '../../forms/Purchase/TicketForm';
import * as PurchaseSession from '../../models/Purchase/PurchaseModel';
const debugLog = debug('SSKTS ');

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
    if (!req.session) return next(new Error(req.__('common.error.property')));
    const purchaseModel = new PurchaseSession.PurchaseModel((<any>req.session).purchase);
    if (!purchaseModel.accessAuth(PurchaseSession.PurchaseModel.TICKET_STATE)) return next(new Error(req.__('common.error.access')));
    if (!purchaseModel.performance) return next(new Error(req.__('common.error.property')));
    //券種取得
    getSalesTickets(req, purchaseModel).then((result) => {
        if (!purchaseModel.transactionMP) return next(new Error(req.__('common.error.property')));
        const performance = purchaseModel.performance;
        res.locals.tickets = result;
        res.locals.performance = performance;
        res.locals.reserveSeats = purchaseModel.reserveSeats;
        res.locals.reserveTickets = purchaseModel.reserveTickets;
        res.locals.step = PurchaseSession.PurchaseModel.TICKET_STATE;
        res.locals.transactionId = purchaseModel.transactionMP.id;

        //セッション更新
        if (!req.session) return next(new Error(req.__('common.error.property')));
        (<any>req.session).purchase = purchaseModel.toSession();
        //券種選択表示
        return res.render('purchase/ticket');
    }).catch((err) => {
        return next(new Error(err.message));
    });
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
    if (!req.session) return next(new Error(req.__('common.error.property')));
    const purchaseModel = new PurchaseSession.PurchaseModel((<any>req.session).purchase);
    if (!purchaseModel.transactionMP) return next(new Error(req.__('common.error.property')));

    //取引id確認
    if (req.body.transaction_id !== purchaseModel.transactionMP.id) return next(new Error(req.__('common.error.access')));

    //バリデーション
    const form = TicketForm(req);
    form(req, res, () => {
        const reserveTickets: PurchaseSession.ReserveTicket[] = JSON.parse(req.body.reserve_tickets);
        ticketValidation(req, purchaseModel, reserveTickets).then((result) => {
            if (!req.session) return next(new Error(req.__('common.error.property')));
            purchaseModel.reserveTickets = result;
            upDateAuthorization(req, purchaseModel).then(() => {
                if (!req.session) return next(new Error(req.__('common.error.property')));
                //セッション更新
                (<any>req.session).purchase = purchaseModel.toSession();
                //購入者情報入力へ
                return res.redirect('/purchase/input');
            }).catch((err) => {
                return next(new Error(err.message));
            });
        }).catch((err) => {
            return next(new Error(err.message));
        });
    });
}

/**
 * ムビチケ券種情報
 */
export interface SalesTicket {
    /**
     * チケットコード
     */
    ticket_code: string;
    /**
     * チケット名
     */
    ticket_name: string;
    /**
     * チケット名(カナ)
     */
    ticket_name_kana: string;
    /**
     * チケット名(英)
     */
    ticket_name_eng: string;
    /**
     * 標準単価
     */
    std_price: number;
    /**
     * 加算単価
     */
    add_price: number;
    /**
     * 販売単価
     */
    sale_price: number;
    /**
     * チケット備考
     */
    ticket_note: string;
    /**
     * メガネ単価
     */
    add_price_glasses: number;
    /**
     * ムビチケ購入番号
     */
    mvtk_num: string | null;
    /**
     * メガネ有り無し
     */
    glasses: boolean;
}

/**
 * 券種リスト取得
 * @memberOf Purchase.TicketModule
 * @function getSalesTickets
 * @param {express.Request} req
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {Promise<SalesTicket[]>}
 */
async function getSalesTickets(
    req: express.Request,
    purchaseModel: PurchaseSession.PurchaseModel
): Promise<SalesTicket[]> {
    if (!purchaseModel.performance) throw new Error(req.__('common.error.property'));
    if (!purchaseModel.performanceCOA) throw new Error(req.__('common.error.property'));

    const result: SalesTicket[] = [];
    //コアAPI券種取得
    const performance = purchaseModel.performance;
    const salesTickets = await COA.ReserveService.salesTicket({
        theater_code: performance.attributes.theater.id,
        date_jouei: performance.attributes.day,
        title_code: purchaseModel.performanceCOA.titleCode,
        title_branch_num: purchaseModel.performanceCOA.titleBranchNum,
        time_begin: performance.attributes.time_start
        // screen_code: performance.screen.id,
    });

    for (const ticket of salesTickets) {
        result.push({
            ticket_code: ticket.ticket_code, // チケットコード
            ticket_name: ticket.ticket_name, // チケット名
            ticket_name_kana: ticket.ticket_name_kana, // チケット名(カナ)
            ticket_name_eng: ticket.ticket_name_eng, // チケット名(英)
            std_price: ticket.std_price, // 標準単価
            add_price: ticket.add_price, // 加算単価
            sale_price: ticket.sale_price, // 販売単価
            ticket_note: ticket.ticket_note, // チケット備考
            add_price_glasses: 0, // メガネ単価
            mvtk_num: null, // ムビチケ購入番号
            glasses: false // メガネ有無
        });
    }

    if (!purchaseModel.mvtk) return result;

    // ムビチケ情報からチケット情報へ変換
    const mvtkTickets: SalesTicket[] = [];

    for (const mvtk of purchaseModel.mvtk) {
        // tslint:disable-next-line:no-increment-decrement
        for (let i = 0; i < Number(mvtk.ykknInfo.ykknKnshbtsmiNum); i++) {
            mvtkTickets.push({
                ticket_code: mvtk.ticket.ticket_code, // チケットコード
                ticket_name: mvtk.ticket.ticket_name, // チケット名
                ticket_name_kana: mvtk.ticket.ticket_name_kana, // チケット名(カナ)
                ticket_name_eng: mvtk.ticket.ticket_name_eng, // チケット名(英)
                std_price: 0, // 標準単価
                add_price: mvtk.ticket.add_price, // 加算単価
                sale_price: mvtk.ticket.add_price, // 販売単価
                ticket_note: req.__('common.mvtk_code') + mvtk.code, // チケット備考
                add_price_glasses: mvtk.ticket.add_price_glasses, // メガネ単価
                mvtk_num: mvtk.code, // ムビチケ購入番号
                glasses: false  // メガネ有無
            });

            if (mvtk.ticket.add_price_glasses > 0) {
                mvtkTickets.push({
                    ticket_code: mvtk.ticket.ticket_code, // チケットコード
                    ticket_name: mvtk.ticket.ticket_name + req.__('common.glasses'), // チケット名
                    ticket_name_kana: mvtk.ticket.ticket_name_kana, // チケット名(カナ)
                    ticket_name_eng: mvtk.ticket.ticket_name_eng, // チケット名(英)
                    std_price: 0, // 標準単価
                    add_price: mvtk.ticket.add_price, // 加算単価
                    sale_price: mvtk.ticket.add_price + mvtk.ticket.add_price_glasses, // 販売単価
                    ticket_note: req.__('common.mvtk_code') + mvtk.code, // チケット備考
                    add_price_glasses: mvtk.ticket.add_price_glasses, // メガネ単価
                    mvtk_num: mvtk.code, // ムビチケ購入番号
                    glasses: true  // メガネ有無
                });
            }
        }
    }

    return mvtkTickets.concat(result);
}

/**
 * 券種検証
 * @memberOf Purchase.TicketModule
 * @function ticketValidation
 * @param {express.Request} req
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @param {PurchaseSession.ReserveTicket[]} reserveTickets
 * @returns {Promise<void>}
 */
async function ticketValidation(
    req: express.Request,
    purchaseModel: PurchaseSession.PurchaseModel,
    reserveTickets: PurchaseSession.ReserveTicket[]
): Promise<PurchaseSession.ReserveTicket[]> {
    if (!purchaseModel.performance) throw new Error(req.__('common.error.property'));
    if (!purchaseModel.performanceCOA) throw new Error(req.__('common.error.property'));

    const result: PurchaseSession.ReserveTicket[] = [];
    //コアAPI券種取得
    const performance = purchaseModel.performance;
    const salesTickets = await COA.ReserveService.salesTicket({
        theater_code: performance.attributes.theater.id,
        date_jouei: performance.attributes.day,
        title_code: purchaseModel.performanceCOA.titleCode,
        title_branch_num: purchaseModel.performanceCOA.titleBranchNum,
        time_begin: performance.attributes.time_start
        // screen_code: performance.screen.id,
    });

    for (const ticket of reserveTickets) {

        if (ticket.mvtk_num) {
            // ムビチケ
            if (!purchaseModel.mvtk) throw new Error(req.__('common.error.property'));
            const mvtkTicket = purchaseModel.mvtk.find((value) => {
                return (value.code === ticket.mvtk_num && value.ticket.ticket_code === ticket.ticket_code);
            });
            if (!mvtkTicket) throw new Error(req.__('common.error.access'));
            result.push({
                section: ticket.section, // 座席セクション
                seat_code: ticket.seat_code, // 座席番号
                ticket_code: mvtkTicket.ticket.ticket_code, // チケットコード
                ticket_name: (ticket.glasses)
                    ? mvtkTicket.ticket.ticket_name + req.__('common.glasses')
                    : mvtkTicket.ticket.ticket_name, // チケット名
                ticket_name_eng: mvtkTicket.ticket.ticket_name_eng, // チケット名（英）
                ticket_name_kana: mvtkTicket.ticket.ticket_name_kana, // チケット名（カナ）
                std_price: 0, // 標準単価
                add_price: mvtkTicket.ticket.add_price, // 加算単価
                dis_price: 0, // 割引額
                sale_price: (ticket.glasses)
                    ? (mvtkTicket.ticket.add_price + mvtkTicket.ticket.add_price_glasses)
                    : mvtkTicket.ticket.add_price, // 販売単価
                add_price_glasses: mvtkTicket.ticket.add_price_glasses, // メガネ単価
                glasses: ticket.glasses, // メガネ有り無し
                mvtk_num: mvtkTicket.code // ムビチケ購入番号
            });
        } else {
            // 通常券種
            const salesTicket = salesTickets.find((value) => {
                return (value.ticket_code === ticket.ticket_code);
            });
            if (!salesTicket) throw new Error(req.__('common.error.access'));
            result.push({
                section: ticket.section, // 座席セクション
                seat_code: ticket.seat_code, // 座席番号
                ticket_code: salesTicket.ticket_code, // チケットコード
                ticket_name: salesTicket.ticket_name, // チケット名
                ticket_name_eng: salesTicket.ticket_name_eng, // チケット名（英）
                ticket_name_kana: salesTicket.ticket_name_kana, // チケット名（カナ）
                std_price: salesTicket.std_price, // 標準単価
                add_price: salesTicket.add_price, // 加算単価
                dis_price: 0, // 割引額
                sale_price: salesTicket.sale_price, // 販売単価
                add_price_glasses: ticket.add_price_glasses, // メガネ単価
                glasses: ticket.glasses, // メガネ有り無し
                mvtk_num: ticket.mvtk_num // ムビチケ購入番号
            });
        }
    }
    return result;
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
    if (!purchaseModel.performanceCOA) throw new Error(req.__('common.error.property'));

    // COAオーソリ削除
    await MP.removeCOAAuthorization({
        transactionId: purchaseModel.transactionMP.id,
        coaAuthorizationId: purchaseModel.authorizationCOA.id
    });

    debugLog('MPCOAオーソリ削除');

    if (purchaseModel.transactionGMO
        && purchaseModel.authorizationGMO
        && purchaseModel.orderId) {
        //GMOオーソリあり
        if (!purchaseModel.transactionGMO) throw new Error(req.__('common.error.property'));
        if (!purchaseModel.authorizationGMO) throw new Error(req.__('common.error.property'));
        if (!purchaseModel.orderId) throw new Error(req.__('common.error.property'));
        // todo GMO情報取得API作成中
        let gmoShopId = 'tshop00026096';
        let gmoShopPassword = 'xbxmkaa6';
        if (process.env.NODE_ENV === 'test') {
            gmoShopId = 'tshop00026715';
            gmoShopPassword = 'ybmbptww';
        }
        //GMOオーソリ取消
        await GMO.CreditService.alterTran({
            shopId: gmoShopId,
            shopPass: gmoShopPassword,
            accessId: purchaseModel.transactionGMO.accessId,
            accessPass: purchaseModel.transactionGMO.accessPass,
            jobCd: GMO.Util.JOB_CD_VOID
        });
        debugLog('GMOオーソリ取消');

        // GMOオーソリ削除
        await MP.removeGMOAuthorization({
            transactionId: purchaseModel.transactionMP.id,
            gmoAuthorizationId: purchaseModel.authorizationGMO.id
        });
        debugLog('GMOオーソリ削除');
    }

    //COAオーソリ追加
    const coaAuthorizationResult = await MP.addCOAAuthorization({
        transaction: purchaseModel.transactionMP,
        reserveSeatsTemporarilyResult: purchaseModel.reserveSeats,
        salesTicketResults: purchaseModel.reserveTickets,
        performance: purchaseModel.performance,
        performanceCOA: purchaseModel.performanceCOA,
        price: purchaseModel.getReserveAmount()
    });
    debugLog('MPCOAオーソリ追加', coaAuthorizationResult);
    purchaseModel.authorizationCOA = coaAuthorizationResult;
}
