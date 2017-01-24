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
        if (!this.req.query || !this.req.params['id']) return this.next(new Error('不適切なアクセスです'));
        if (!this.purchaseModel.checkAccess(PurchaseSession.PurchaseModel.SEAT_STATE)) return this.next(new Error('不適切なアクセスです'));
        //パフォーマンス取得
        MP.getPerformance.call({
            id: this.req.params['id']
        }).then((result) => {
            this.res.locals['performance'] = result.data;
            this.res.locals['step'] = PurchaseSession.PurchaseModel.SEAT_STATE;
            this.res.locals['reserveSeats'] = null;

            //仮予約中
            if (this.purchaseModel.reserveSeats) {
                this.logger.debug('仮予約中')
                this.res.locals['reserveSeats'] = JSON.stringify(this.purchaseModel.reserveSeats);
            }
            this.purchaseModel.performance = result.data;

            //セッション更新
            if (!this.req.session) return this.next(new Error('session is undefined'));
            this.req.session['purchase'] = this.purchaseModel.formatToSession();

            this.res.render('purchase/seat');
        }, (err) => {
            return this.next(new Error(err.message));
        });
    }

   


    /**
     * 座席決定
     */
    public select(): void {
        //バリデーション
        SeatForm(this.req, this.res, () => {
            this.reserve().then(() => {
                if (!this.router) return this.next(new Error('router is undefined'));
                //セッション更新
                if (!this.req.session) return this.next(new Error('session is undefined'));
                this.req.session['purchase'] = this.purchaseModel.formatToSession();
                //券種選択へ
                this.res.redirect(this.router.build('purchase.ticket', {}));
            }, (err) => {
                return this.next(new Error(err.message));
            });
        });
    }

    /**
     * 座席仮予約
     */
    private async reserve(): Promise<void> {
        // console.log('------------------', this.purchaseModel)
        if (!this.purchaseModel.performance) return this.next(new Error('performance is undefined'));
        if (!this.purchaseModel.transactionMP) return this.next(new Error('transactionMP is undefined'));
        if (!this.purchaseModel.owner) return this.next(new Error('owners is undefined'));

        let performance = this.purchaseModel.performance;

        //予約中
        if (this.purchaseModel.reserveSeats) {
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
                tmp_reserve_num: String(reserveSeats.tmp_reserve_num),
            });

            this.logger.debug('COA仮予約削除');

            // COAオーソリ削除
            await MP.removeCOAAuthorization.call({
                transaction: this.purchaseModel.transactionMP,
                ownerId4administrator: config.get<string>('admin_id'),
                reserveSeatsTemporarilyResult: this.purchaseModel.reserveSeats,
                addCOAAuthorizationResult: this.purchaseModel.performance
            });

            this.logger.debug('COAオーソリ削除');

            if (this.purchaseModel.transactionGMO
                && this.purchaseModel.authorizationGMO
                && this.purchaseModel.orderId) {
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
                    transaction: this.purchaseModel.transactionMP,
                    addGMOAuthorizationResult: this.purchaseModel.authorizationGMO,
                    orderId: this.purchaseModel.orderId
                });
                this.logger.debug('GMOオーソリ削除');
                
                //予約チケット情報削除
                this.purchaseModel.reserveTickets = null;
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
            list_seat: seats,
        });
        this.logger.debug('COA仮予約', this.purchaseModel.reserveSeats);


        //COAオーソリ追加
        let COAAuthorizationResult = await MP.addCOAAuthorization.call({
            transaction: this.purchaseModel.transactionMP,
            ownerId4administrator: config.get<string>('admin_id'),
            reserveSeatsTemporarilyResult: this.purchaseModel.reserveSeats,
            performance: performance
        });
        this.logger.debug('COAオーソリ追加', COAAuthorizationResult);

        this.purchaseModel.authorizationCOA = COAAuthorizationResult;

    }

}
