import PurchaseController from './PurchaseController';
import SeatForm from '../../forms/Purchase/SeatForm';
import PurchaseSession = require('../../models/Purchase/PurchaseModel');
// import config = require('config');
import COA = require('@motionpicture/coa-service');
import MP = require('../../../../libs/MP');


export default class SeatSelectController extends PurchaseController {
    /**
     * 座席選択
     */
    public index(): void {
        if (!this.req.query || !this.req.query['id']) return this.next(new Error('不適切なアクセスです'));
                
        
        //パフォーマンス取得
        MP.getPerformance.call({
            id: this.req.query['id']
        }).then((result) => {
            this.res.locals['performance'] = result.data;
            this.res.locals['step'] = PurchaseSession.PurchaseModel.SEAT_STATE;
            this.res.locals['reserveSeats'] = null;
            
            //仮予約中
            if (this.purchaseModel.reserveSeats
                && this.purchaseModel.performance
                && this.purchaseModel.performance._id === this.req.query['id']) {
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
            this.reserve().then((result) => {
                if (!result) return this.next(new Error('result is null'));
                if (!this.router) return this.next(new Error('router is undefined'));
                //予約情報をセッションへ
                this.purchaseModel.reserveSeats = result;
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
    private async reserve(): Promise<void | COA.reserveSeatsTemporarilyInterface.Result> {
        // console.log('------------------', this.purchaseModel)
        let performance = this.purchaseModel.performance;
        if (!performance) return this.next(new Error('performance is undefined'));
        //予約中
        if (this.purchaseModel.reserveSeats
            && this.purchaseModel.performance
            && this.purchaseModel.performance._id === this.req.query['id']) {
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

            this.logger.debug('仮予約削除');
        }

        //TODO
        // // 一般所有者作成
        // let owner = await MP.ownerAnonymousCreate.call();
        // this.req.session['owner'] = owner;

        // // 取引開始
        // let transaction = await MP.transactionStart.call({
        //     owners: [config.get<string>('admin_id'), owner._id]
        // });

        // this.req.session['transaction'] = transaction;

        //COA仮予約
        let seats = JSON.parse(this.req.body.seats);

        let reserveSeatsTemporarilyResult = await COA.reserveSeatsTemporarilyInterface.call({
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
        this.logger.debug('仮予約', reserveSeatsTemporarilyResult);

        return reserveSeatsTemporarilyResult;
    }

}
