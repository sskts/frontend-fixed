import PurchaseController from './PurchaseController';
import SeatForm from '../../forms/Purchase/SeatForm';
import PurchaseSession = require('../../models/Purchase/PurchaseModel');
import config = require('config');
import COA = require('@motionpicture/coa-service');
import MP = require('../../../../libs/MP');
import GMO = require("@motionpicture/gmo-service");

export default class SeatSelectController extends PurchaseController {
    /**
     * 座席選択
     */
    public index(): void {
        if (!this.req.params || !this.req.params['id']) return this.next(new Error(PurchaseController.ERROR_MESSAGE_ACCESS));
        if (!this.purchaseModel.accessAuth(PurchaseSession.PurchaseModel.SEAT_STATE)) return this.next(new Error(PurchaseController.ERROR_MESSAGE_ACCESS));
        //パフォーマンス取得
        MP.getPerformance.call({
            id: this.req.params['id']
        }).then((result) => {
            this.res.locals['performance'] = result;
            this.res.locals['step'] = PurchaseSession.PurchaseModel.SEAT_STATE;
            this.res.locals['reserveSeats'] = null;


            //仮予約中
            if (this.purchaseModel.reserveSeats) {
                this.logger.debug('仮予約中')
                this.res.locals['reserveSeats'] = JSON.stringify(this.purchaseModel.reserveSeats);
            }
            this.purchaseModel.performance = result;

            //セッション更新
            if (!this.req.session) return this.next(new Error('session is undefined'));
            this.req.session['purchase'] = this.purchaseModel.formatToSession();

            this.res.locals['error'] = null;
            return this.res.render('purchase/seat');
        }, (err) => {
            return this.next(new Error(err.message));
        });
    }




    /**
     * 座席決定
     */
    public select(): void {
        if (!this.transactionAuth()) return this.next(new Error(PurchaseController.ERROR_MESSAGE_ACCESS));
        //バリデーション
        SeatForm(this.req, this.res, () => {
            if (!this.req.form) return this.next(new Error('form is undefined'));
            if (this.req.form.isValid) {
                this.reserve().then(() => {
                    if (!this.router) return this.next(new Error('router is undefined'));
                    //セッション更新
                    if (!this.req.session) return this.next(new Error('session is undefined'));
                    this.req.session['purchase'] = this.purchaseModel.formatToSession();
                    //券種選択へ
                    return this.res.redirect(this.router.build('purchase.ticket', {}));
                }, (err) => {
                    return this.next(new Error(err.message));
                });
            } else {
                if (!this.req.params || !this.req.params['id']) return this.next(new Error(PurchaseController.ERROR_MESSAGE_ACCESS));
                this.res.locals['performance'] = this.purchaseModel.performance;
                this.res.locals['step'] = PurchaseSession.PurchaseModel.SEAT_STATE;
                this.res.locals['reserveSeats'] = this.req.body.seats;


                

                this.res.locals['error'] = this.req.form.getErrors();
                return this.res.render('purchase/seat');
                
            }
        });
    }

    /**
     * 座席仮予約
     */
    private async reserve(): Promise<void> {
        if (!this.purchaseModel.performance) throw new Error('performance is undefined');
        if (!this.purchaseModel.transactionMP) throw new Error('transactionMP is undefined');

        let performance = this.purchaseModel.performance;

        //予約中
        if (this.purchaseModel.reserveSeats) {
            if (!this.purchaseModel.authorizationCOA) throw new Error('authorizationCOA is undefined');
            let reserveSeats = this.purchaseModel.reserveSeats;

            //COA仮予約削除
            await COA.deleteTmpReserveInterface.call({
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
                /** 座席チケット仮予約番号 */
                tmp_reserve_num: reserveSeats.tmp_reserve_num,
            });

            this.logger.debug('COA仮予約削除');

            // COAオーソリ削除
            await MP.removeCOAAuthorization.call({
                transactionId: this.purchaseModel.transactionMP._id,
                coaAuthorizationId: this.purchaseModel.authorizationCOA._id,
            });

            this.logger.debug('MPCOAオーソリ削除');

            if (this.purchaseModel.transactionGMO
                && this.purchaseModel.authorizationGMO) {
                //GMOオーソリ取消
                await GMO.CreditService.alterTranInterface.call({
                    shop_id: config.get<string>('gmo_shop_id'),
                    shop_pass: config.get<string>('gmo_shop_password'),
                    access_id: this.purchaseModel.transactionGMO.access_id,
                    access_pass: this.purchaseModel.transactionGMO.access_pass,
                    job_cd: GMO.Util.JOB_CD_VOID
                });
                this.logger.debug('GMOオーソリ取消');

                // GMOオーソリ削除
                await MP.removeGMOAuthorization.call({
                    transactionId: this.purchaseModel.transactionMP._id,
                    gmoAuthorizationId: this.purchaseModel.authorizationGMO._id,
                });
                this.logger.debug('GMOオーソリ削除');

            }
        }





        //COA仮予約
        let seats = JSON.parse(this.req.body.seats);

        this.purchaseModel.reserveSeats = await COA.reserveSeatsTemporarilyInterface.call({
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
            /** 予約座席数 */
            // cnt_reserve_seat: number,
            /** スクリーンコード */
            screen_code: performance.attributes.screen.coa_screen_code,
            /** 予約座席リスト */
            list_seat: seats.list_tmp_reserve,
        });
        this.logger.debug('COA仮予約', this.purchaseModel.reserveSeats);

        //予約チケット作成
        this.purchaseModel.reserveTickets = this.purchaseModel.reserveSeats.list_tmp_reserve.map((tmpReserve) => {
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
                sale_price: 0,
            }
        });

        //COAオーソリ追加
        let COAAuthorizationResult = await MP.addCOAAuthorization.call({
            transaction: this.purchaseModel.transactionMP,
            reserveSeatsTemporarilyResult: this.purchaseModel.reserveSeats,
            salesTicketResults: this.purchaseModel.reserveTickets,
            performance: performance,
            totalPrice: this.purchaseModel.getReserveAmount()
        });
        this.logger.debug('MPCOAオーソリ追加', COAAuthorizationResult);

        this.purchaseModel.authorizationCOA = COAAuthorizationResult;

    }

}
