/**
 * 購入座席選択
 * @namespace Purchase.SeatModule
 */

import * as COA from '@motionpicture/coa-service';
import * as GMO from '@motionpicture/gmo-service';
import * as debug from 'debug';
import * as express from 'express';
import * as fs from 'fs-extra-promise';
import * as MP from '../../../../libs/MP';
import SeatForm from '../../forms/Purchase/SeatForm';
import * as PurchaseSession from '../../models/Purchase/PurchaseModel';
import * as UtilModule from '../Util/UtilModule';
const debugLog = debug('SSKTS ');

/**
 * 座席選択
 * @memberOf Purchase.SeatModule
 * @function index
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
export function index(req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (!req.session) return next(new Error(req.__('common.error.property')));
    const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
    if (!purchaseModel.accessAuth(PurchaseSession.PurchaseModel.SEAT_STATE)) return next(new Error(req.__('common.error.access')));

    preparation(req, purchaseModel).then(() => {
        if (!purchaseModel.transactionMP) return next(new Error(req.__('common.error.property')));
        res.locals.performance = purchaseModel.performance;
        res.locals.performanceCOA = purchaseModel.performanceCOA;
        res.locals.step = PurchaseSession.PurchaseModel.SEAT_STATE;
        res.locals.reserveSeats = (purchaseModel.reserveSeats)
            //仮予約中
            ? JSON.stringify(purchaseModel.reserveSeats)
            : null;
        res.locals.transactionId = purchaseModel.transactionMP.id;
        res.locals.error = null;
        res.locals.prevLink = (purchaseModel.performance)
            ? UtilModule.getTheaterUrl(purchaseModel.performance.attributes.theater.name.en)
            : UtilModule.getPortalUrl();

        //セッション更新
        if (!req.session) return next(new Error(req.__('common.error.property')));
        (<any>req.session).purchase = purchaseModel.toSession();

        return res.render('purchase/seat');
    }).catch((err) => {
        return next(new Error(err.message));
    });

}

/**
 * 購入フロー準備
 * @memberOf Purchase.SeatModule
 * @function preparation
 * @param {express.Request} req
 * @param {PurchaseSession.ReserveTicket} purchaseModel
 * @returns {void}
 */
export async function preparation(req: express.Request, purchaseModel: PurchaseSession.PurchaseModel) {
    if (!req.params || !req.params.id) throw new Error(req.__('common.error.access'));
    // パフォーマンス取得
    const performance = await MP.getPerformance(req.params.id);
    debugLog('パフォーマンス取得');
    // COAパフォーマンス取得
    const performanceCOA = await MP.getPerformanceCOA(
        performance.attributes.theater.id, performance.attributes.screen.id, performance.attributes.film.id
    );
    debugLog('COAパフォーマンス取得');
    purchaseModel.performance = performance;
    purchaseModel.performanceCOA = performanceCOA;
}

/**
 * 座席決定
 * @memberOf Purchase.SeatModule
 * @function select
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
export function select(req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (!req.session) return next(new Error(req.__('common.error.property')));
    if (!req.session.purchase) return next(new Error(req.__('common.error.expire')));
    const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
    if (!purchaseModel.transactionMP) return next(new Error(req.__('common.error.property')));

    //取引id確認
    if (req.body.transaction_id !== purchaseModel.transactionMP.id) return next(new Error(req.__('common.error.access')));

    //バリデーション
    const form = SeatForm(req);
    form(req, res, () => {
        if (!(<any>req).form) return next(new Error(req.__('common.error.property')));
        if ((<any>req).form.isValid) {
            reserve(req, purchaseModel).then(() => {
                //セッション更新
                if (!req.session) return next(new Error(req.__('common.error.property')));
                (<any>req.session).purchase = purchaseModel.toSession();
                //券種選択へ
                return res.redirect('/purchase/ticket');
            }).catch((err) => {
                return next(new Error(err.message));
            });
        } else {
            if (!req.params || !req.params.id) return next(new Error(req.__('common.error.access')));
            res.locals.transactionId = purchaseModel.transactionMP;
            res.locals.performance = purchaseModel.performance;
            res.locals.step = PurchaseSession.PurchaseModel.SEAT_STATE;
            res.locals.reserveSeats = req.body.seats;
            res.locals.error = (<any>req).form.getErrors();
            res.locals.prevLink = (purchaseModel.performance)
                ? UtilModule.getTheaterUrl(purchaseModel.performance.attributes.theater.name.en)
                : UtilModule.getPortalUrl();

            return res.render('purchase/seat');

        }
    });
}

/**
 * 座席仮予約
 * @memberOf Purchase.SeatModule
 * @function reserve
 * @param {express.Request} req
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {Promise<void>}
 */
async function reserve(req: express.Request, purchaseModel: PurchaseSession.PurchaseModel): Promise<void> {
    if (!purchaseModel.performance) throw new Error(req.__('common.error.property'));
    if (!purchaseModel.transactionMP) throw new Error(req.__('common.error.property'));
    if (!purchaseModel.performanceCOA) throw new Error(req.__('common.error.property'));
    const performance = purchaseModel.performance;

    //予約中
    if (purchaseModel.reserveSeats) {
        if (!purchaseModel.authorizationCOA) throw new Error(req.__('common.error.property'));
        const reserveSeats = purchaseModel.reserveSeats;

        //COA仮予約削除
        await COA.ReserveService.delTmpReserve({
            theater_code: performance.attributes.theater.id,
            date_jouei: performance.attributes.day,
            title_code: purchaseModel.performanceCOA.titleCode,
            title_branch_num: purchaseModel.performanceCOA.titleBranchNum,
            time_begin: performance.attributes.time_start,
            tmp_reserve_num: reserveSeats.tmp_reserve_num
        });
        debugLog('COA仮予約削除');
        // COAオーソリ削除
        await MP.removeCOAAuthorization({
            transactionId: purchaseModel.transactionMP.id,
            coaAuthorizationId: purchaseModel.authorizationCOA.id
        });
        debugLog('MPCOAオーソリ削除');
        if (purchaseModel.transactionGMO
            && purchaseModel.authorizationGMO) {
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
    }
    //COA仮予約
    const seats = JSON.parse(req.body.seats);
    purchaseModel.reserveSeats = await COA.ReserveService.updTmpReserveSeat({
        theater_code: performance.attributes.theater.id,
        date_jouei: performance.attributes.day,
        title_code: purchaseModel.performanceCOA.titleCode,
        title_branch_num: purchaseModel.performanceCOA.titleBranchNum,
        time_begin: performance.attributes.time_start,
        // cnt_reserve_seat: number,
        screen_code: purchaseModel.performanceCOA.screenCode,
        list_seat: seats.list_tmp_reserve
    });
    debugLog('COA仮予約', purchaseModel.reserveSeats);

    //予約チケット作成
    purchaseModel.reserveTickets = purchaseModel.reserveSeats.list_tmp_reserve.map((tmpReserve) => {
        return {
            section: tmpReserve.seat_section,
            seat_code: tmpReserve.seat_num,
            ticket_code: '',
            ticket_name: '',
            ticket_name_eng: '',
            ticket_name_kana: '',
            std_price: 0,
            add_price: 0,
            dis_price: 0,
            sale_price: 0,
            add_price_glasses: 0,
            glasses: false,
            mvtk_num: null
        };
    });

    //COAオーソリ追加
    const coaAuthorizationResult = await MP.addCOAAuthorization({
        transaction: purchaseModel.transactionMP,
        reserveSeatsTemporarilyResult: purchaseModel.reserveSeats,
        salesTicketResults: purchaseModel.reserveTickets,
        performance: performance,
        performanceCOA: purchaseModel.performanceCOA,
        price: purchaseModel.getReserveAmount()
    });
    debugLog('MPCOAオーソリ追加', coaAuthorizationResult);
    purchaseModel.authorizationCOA = coaAuthorizationResult;
}

/**
 * スクリーン状態取得
 * @memberOf Purchase.SeatModule
 * @function getScreenStateReserve
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
// tslint:disable-next-line:variable-name
export function getScreenStateReserve(req: express.Request, res: express.Response, _next: express.NextFunction): void {
    getScreenData(req).then((result) => {
        return res.json({ err: null, result: result });
    }).catch((err) => {
        debugLog(err);
        return res.json({ err: err, result: null });
    });
}

/**
 * スクリーン情報取得
 * @memberOf Purchase.SeatModule
 * @function getScreenStateReserve
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {Promise<ScreenData>}
 */
async function getScreenData(req: express.Request): Promise<ScreenData> {
    const num = 10;
    const screenCode: string = (Number(req.body.screen_code) < num)
        ? `0${req.body.screen_code}`
        : req.body.screen_code;
    const screen = await fs.readJSONAsync(`./apps/frontend/theaters/${req.body.theater_code}/${screenCode}.json`);
    const setting = await fs.readJSONAsync('./apps/frontend/theaters/setting.json');
    const state = await COA.ReserveService.stateReserveSeat(req.body);
    return {
        screen: screen,
        setting: setting,
        state: state
    };
}

/**
 * スクリーン情報
 */
interface ScreenData {
    screen: any;
    setting: any;
    state: COA.ReserveService.StateReserveSeatResult;
}
