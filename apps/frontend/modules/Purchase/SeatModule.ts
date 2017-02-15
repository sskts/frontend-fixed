import * as COA from '@motionpicture/coa-service';
import * as GMO from '@motionpicture/gmo-service';
import * as express from 'express';
import * as MP from '../../../../libs/MP';
import SeatForm from '../../forms/Purchase/SeatForm';
import * as PurchaseSession from '../../models/Purchase/PurchaseModel';

/**
 * 購入座席選択
 * @namespace
 */
namespace SeatModule {
    /**
     * 座席選択
     * @function
     */
    export function index(req: express.Request, res: express.Response, next: express.NextFunction): void {
        if (!req.session) return next(req.__('common.error.property'));
        const purchaseModel = new PurchaseSession.PurchaseModel(req.session['purchase']);
        if (!req.params || !req.params['id']) return next(new Error(req.__('common.error.access')));
        if (!purchaseModel.accessAuth(PurchaseSession.PurchaseModel.SEAT_STATE)) return next(new Error(req.__('common.error.access')));

        //パフォーマンス取得
        MP.getPerformance.call({
            id: req.params.id
        }).then(
            (result) => {
                if (!purchaseModel.transactionMP) return next(new Error(req.__('common.error.property')));
                res.locals.performance = result;
                res.locals.step = PurchaseSession.PurchaseModel.SEAT_STATE;
                res.locals.reserveSeats = null;
                res.locals.transactionId = purchaseModel.transactionMP._id;

                //仮予約中
                if (purchaseModel.reserveSeats) {
                    console.log('仮予約中');
                    res.locals.reserveSeats = JSON.stringify(purchaseModel.reserveSeats);
                }
                purchaseModel.performance = result;

                //セッション更新
                if (!req.session) return next(req.__('common.error.property'));
                req.session['purchase'] = purchaseModel.formatToSession();

                res.locals.error = null;
                return res.render('purchase/seat');
            },
            (err) => {
                return next(new Error(err.message));
            }
        );
    }

    /**
     * 座席決定
     * @function
     */
    export function select(req: express.Request, res: express.Response, next: express.NextFunction): void {
        if (!req.session) return next(req.__('common.error.property'));
        const purchaseModel = new PurchaseSession.PurchaseModel(req.session['purchase']);
        if (!purchaseModel.transactionMP) return next(new Error(req.__('common.error.property')));

        //取引id確認
        if (req.body.transaction_id !== purchaseModel.transactionMP._id) return next(new Error(req.__('common.error.access')));

        //バリデーション
        const form = SeatForm(req);
        form(req, res, () => {
            if (!req.form) return next(req.__('common.error.property'));
            if (req.form.isValid) {
                reserve(req, purchaseModel).then(
                    () => {

                        //セッション更新
                        if (!req.session) return next(req.__('common.error.property'));
                        req.session['purchase'] = purchaseModel.formatToSession();
                        //券種選択へ
                        return res.redirect('/purchase/ticket');
                    },
                    (err) => {
                        return next(new Error(err.message));
                    }
                );
            } else {
                if (!req.params || !req.params.id) return next(new Error(req.__('common.error.access')));
                res.locals.transactionId = purchaseModel.transactionMP;
                res.locals.performance = purchaseModel.performance;
                res.locals.step = PurchaseSession.PurchaseModel.SEAT_STATE;
                res.locals.reserveSeats = req.body.seats;
                res.locals.error = req.form.getErrors();

                return res.render('purchase/seat');

            }
        });
    }

    /**
     * 座席仮予約
     * @function
     */
    async function reserve(req: express.Request, purchaseModel: PurchaseSession.PurchaseModel): Promise<void> {
        if (!purchaseModel.performance) throw new Error(req.__('common.error.property'));
        if (!purchaseModel.transactionMP) throw new Error(req.__('common.error.property'));
        const performance = purchaseModel.performance;
        //予約中
        if (purchaseModel.reserveSeats) {
            if (!purchaseModel.authorizationCOA) throw new Error(req.__('common.error.property'));
            const reserveSeats = purchaseModel.reserveSeats;

            //COA仮予約削除
            await COA.deleteTmpReserveInterface.call({
                theater_code: performance.attributes.theater._id,
                date_jouei: performance.attributes.day,
                title_code: performance.attributes.film.coa_title_code,
                title_branch_num: performance.attributes.film.coa_title_branch_num,
                time_begin: performance.attributes.time_start,
                tmp_reserve_num: reserveSeats.tmp_reserve_num
            });
            console.log('COA仮予約削除');
            // COAオーソリ削除
            await MP.removeCOAAuthorization.call({
                transactionId: purchaseModel.transactionMP._id,
                coaAuthorizationId: purchaseModel.authorizationCOA._id
            });
            console.log('MPCOAオーソリ削除');
            if (purchaseModel.transactionGMO
                && purchaseModel.authorizationGMO) {
                //GMOオーソリ取消
                await GMO.CreditService.alterTranInterface.call({
                    shop_id: process.env.GMO_SHOP_ID,
                    shop_pass: process.env.GMO_SHOP_PASSWORD,
                    access_id: purchaseModel.transactionGMO.access_id,
                    access_pass: purchaseModel.transactionGMO.access_pass,
                    job_cd: GMO.Util.JOB_CD_VOID
                });
                console.log('GMOオーソリ取消');
                // GMOオーソリ削除
                await MP.removeGMOAuthorization.call({
                    transactionId: purchaseModel.transactionMP._id,
                    gmoAuthorizationId: purchaseModel.authorizationGMO._id
                });
                console.log('GMOオーソリ削除');
            }
        }
        //COA仮予約
        const seats = JSON.parse(req.body.seats);
        purchaseModel.reserveSeats = await COA.reserveSeatsTemporarilyInterface.call({
            theater_code: performance.attributes.theater._id,
            date_jouei: performance.attributes.day,
            title_code: performance.attributes.film.coa_title_code,
            title_branch_num: performance.attributes.film.coa_title_branch_num,
            time_begin: performance.attributes.time_start,
            // cnt_reserve_seat: number,
            screen_code: performance.attributes.screen.coa_screen_code,
            list_seat: seats.list_tmp_reserve
        });
        console.log('COA仮予約', purchaseModel.reserveSeats);

        //予約チケット作成
        purchaseModel.reserveTickets = purchaseModel.reserveSeats.list_tmp_reserve.map((tmpReserve) => {
            return {
                section: tmpReserve.seat_section,
                seat_code: tmpReserve.seat_num,
                ticket_code: '',
                ticket_name_ja: '',
                ticket_name_en: '',
                ticket_name_kana: '',
                std_price: 0,
                add_price: 0,
                dis_price: 0,
                sale_price: 0
            };
        });

        //COAオーソリ追加
        const COAAuthorizationResult = await MP.addCOAAuthorization.call({
            transaction: purchaseModel.transactionMP,
            reserveSeatsTemporarilyResult: purchaseModel.reserveSeats,
            salesTicketResults: purchaseModel.reserveTickets,
            performance: performance,
            totalPrice: purchaseModel.getReserveAmount()
        });
        console.log('MPCOAオーソリ追加', COAAuthorizationResult);
        purchaseModel.authorizationCOA = COAAuthorizationResult;
    }

    /**
     * スクリーン状態取得
     * @function
     */
    export function getScreenStateReserve(req: express.Request, res: express.Response, _next: express.NextFunction): void {

        COA.getStateReserveSeatInterface.call(req.body).then(
            (result) => {
                res.json({
                    err: null,
                    result: result
                });
            },
            (err) => {
                res.json({
                    err: err,
                    result: null
                });
            }
        );
    }
}

export default SeatModule;
