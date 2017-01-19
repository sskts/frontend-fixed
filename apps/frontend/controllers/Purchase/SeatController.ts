import PurchaseController from './PurchaseController';
import SeatForm from '../../forms/Purchase/SeatForm';
import COA = require("@motionpicture/coa-service");


export default class SeatSelectController extends PurchaseController {
    /**
     * 座席選択
     */
    public index(): void {
        if (this.req.query && this.req.query['id']) {
            //パフォーマンス取得
            //TODO performance type any
            this.getPerformance(this.req.query['id'], (performance: any) => {
                if (!this.req.session) return this.next(new Error('session is undefined'));
                this.res.locals['performance'] = performance;
                this.res.locals['step'] = 0;
                this.res.locals['reserveSeats'] = null;
                //console.log(this.req.session['reserveSeats'], this.req.session['performance']._id, this.req.query['id'])
                //仮予約中
                if (this.req.session['reserveSeats']
                    && this.req.session['performance']
                    && this.req.session['performance']._id === this.req.query['id']) {
                    this.res.locals['reserveSeats'] = JSON.stringify(this.req.session['reserveSeats']);
                }
                this.req.session['performance'] = performance;
                this.res.render('purchase/seat');
            });
        } else {
            return this.next(new Error('不適切なアクセスです'));
        }
    }

    /**
     * 座席決定
     */
    public select(): void {
        //バリデーション
        SeatForm(this.req, this.res, () => {
            this.reserve().then((result)=>{
                if (!this.router) return this.next(new Error('router is undefined'));
                if (!this.req.session) return this.next(new Error('session is undefined'));
                //予約情報をセッションへ
                this.req.session['reserveSeats'] = result;
                //券種選択へ
                this.res.redirect(this.router.build('purchase.ticket', {}));
            }, (err)=>{
                return this.next(new Error(err.message));
            });
        });
    }

    /**
     * 座席仮予約
     */
    private async reserve(): Promise<void | COA.reserveSeatsTemporarilyInterface.Result> {
        if (!this.req.session) return this.next(new Error('session is undefined'));

        //予約中
        if (this.req.session['reserveSeats']
        && this.req.session['performance']._id === this.req.query['id']) {
            let performance = this.req.session['performance'];
            let reserveSeats = this.req.session['reserveSeats'];
            //仮予約削除
            await COA.deleteTmpReserveInterface.call({
                /** 施設コード */
                theater_code: performance.theater._id,
                /** 上映日 */
                date_jouei: performance.day,
                /** 作品コード */
                title_code: performance.film.coa_title_code,
                /** 作品枝番 */
                title_branch_num: performance.film.coa_title_branch_num,
                /** 上映時刻 */
                time_begin: performance.time_start,
                /** 座席チケット仮予約番号 */
                tmp_reserve_num: reserveSeats.tmp_reserve_num,
            });

            this.logger.debug('仮予約削除');
        }
        
        //仮予約
        let performance = this.req.session['performance'];
        let seats = JSON.parse(this.req.body.seats);

        let reserveSeatsTemporarilyResult = await COA.reserveSeatsTemporarilyInterface.call({
            /** 施設コード */
            theater_code: performance.theater._id,
            /** 上映日 */
            date_jouei: performance.day,
            /** 作品コード */
            title_code: performance.film.coa_title_code,
            /** 作品枝番 */
            title_branch_num: performance.film.coa_title_branch_num,
            /** 上映時刻 */
            time_begin: performance.time_start,
            /** 予約座席数 */
            // cnt_reserve_seat: number,
            /** スクリーンコード */
            screen_code: performance.screen.coa_screen_code,
            /** 予約座席リスト */
            list_seat: seats,
        });
        this.logger.debug('仮予約', reserveSeatsTemporarilyResult);

        return reserveSeatsTemporarilyResult; 
    }

}
