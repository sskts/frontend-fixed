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
            if (!this.req.session) return this.next(new Error('session is undefined'));            

            if (this.req.session['reserveSeats']
            && this.req.session['performance']._id === this.req.query['id']) {
                //予約番号あり(仮予約削除=>仮予約)
                this.deleteTmpReserve(() => {
                    this.reserveSeatsTemporarily(() => {
                        if (!this.router) return this.next(new Error('router is undefined'));
                        //券種選択へ
                        this.res.redirect(this.router.build('purchase.ticket', {}));
                    });
                });
            } else {
                //予約番号なし(仮予約)
                this.reserveSeatsTemporarily(() => {
                    if (!this.router) return this.next(new Error('router is undefined'));
                    //券種選択へ
                    this.res.redirect(this.router.build('purchase.ticket', {}));
                });
            }


        });
    }


    /**
     * スクリーン状態取得
     */
    public getScreenStateReserve(): void {
        let args: COA.getStateReserveSeatInterface.Args = this.req.body;
        COA.getStateReserveSeatInterface.call(args, (err, result) => {
            this.res.json({
                err: err,
                result: result
            });
        });
    }

    /**
     * 仮予約削除
     */
    private deleteTmpReserve(cb: Function): void {
        if (!this.req.session) return this.next(new Error('session is undefined'));
        let performance = this.req.session['performance'];
        let reserveSeats = this.req.session['reserveSeats'];
        let args: COA.deleteTmpReserveInterface.Args = {
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
        }
        COA.deleteTmpReserveInterface.call(args, (err, result) => {
            if (err) return this.next(new Error(err.message));
            if (!result) return this.next(new Error('サーバーエラー'));
            this.logger.debug('仮予約削除');
            cb();
        });
    }

    /**
     * 仮予約
     */
    private reserveSeatsTemporarily(cb: Function): void {
        if (!this.req.session) return this.next(new Error('session is undefined'));
        let performance = this.req.session['performance'];
        let args: COA.reserveSeatsTemporarilyInterface.Args = {
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
            list_seat: JSON.parse(this.req.body.seats),
        }
        
        COA.reserveSeatsTemporarilyInterface.call(args, (err, result) => {
            if (err) return this.next(new Error(err.message));
            if (!this.req.session) return this.next(new Error('session is undefined'));
            //予約情報をセッションへ
            this.req.session['reserveSeats'] = result;
            this.logger.debug('仮予約完了', this.req.session['reserveSeats']);
            cb();
        });
    }




}
