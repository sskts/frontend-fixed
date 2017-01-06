import PurchaseController from './PurchaseController';
import SeatForm from '../../forms/Purchase/SeatForm';
import request = require('request');
import config = require('config');
import * as COA from "../../../../lib/coa/coa";



export default class SeatSelectController extends PurchaseController {
    /**
     * 座席選択
     */
    public index(): void {
        if (this.req.query && this.req.query['id']) {
            //パフォーマンス取得
            this.getPerformance(this.req.query['id'], (performance: any) => {
                if (!this.req.session) return this.next(new Error('session is undefined'));
                console.log(performance)
                this.req.session['performance'] = performance;

                this.res.locals['performance'] = performance;
                this.res.locals['step'] = 0;
                this.res.locals['reserveSeats'] = null;
                if (this.req.session['reserveSeats']) {
                    this.res.locals['reserveSeats'] = JSON.stringify(this.req.session['reserveSeats']);
                    console.log(this.res.locals['reserveSeats'])
                }
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
            

            let seats = JSON.parse(this.req.body.seat_codes);
            

            if (this.req.session['reserveSeats']) {
                // //予約番号あり(仮予約削除=>仮予約)
                // this.deleteTmpReserve((result: COA.deleteTmpReserveInterface.Result) => {
                //     this.reserveSeatsTemporarily((result: COA.reserveSeatsTemporarilyInterface.Result) => {

                //     });
                // });
            } else {
                // //予約番号なし(仮予約)
                this.reserveSeatsTemporarily(seats, (result: COA.reserveSeatsTemporarilyInterface.Result) => {
                    if (!this.req.session) return this.next(new Error('session is undefined'));
                    if (!this.router) return this.next(new Error('router is undefined'));
                    //予約情報をセッションへ
                    this.req.session['reserveSeats'] = result;
                    this.logger.debug('購入者情報入力完了', this.req.session['reserveSeats']);
                    //券種選択へ
                    this.res.redirect(this.router.build('purchase.ticket', {}));
                });
            }


        });
    }


    /**
     * パフォーマンス取得
     */
    private getPerformance(performancesId: string, cb: Function): void {
        let endpoint: string = config.get<string>('mp_api_endpoint');
        let method: string = 'performance';

        let options: request.Options = {
            url: `${endpoint}/${method}/${performancesId}`,
            method: 'GET',
            json: true,
        };

        request.get(options, (error, response, body) => {
            if (error) {
                return this.next(new Error('サーバーエラー'));
            }
            if (!response || !body.success) {
                return this.next(new Error('サーバーエラー'));
            }

            cb(body.performance);
        });
    }

    /**
     * スクリーン状態取得
     */
    public getScreenStateReserve(): void {
        let args: COA.getStateReserveSeatInterface.Args = this.req.body;
        COA.getStateReserveSeatInterface.call(args, (err: Error, result: COA.getStateReserveSeatInterface.Result) => {
            this.res.json({
                err: err,
                result: result
            });
        });
    }

    /**
     * 仮予約削除
     */
    // private deleteTmpReserve(cb: Function): void {
    //     if (!this.req.session) return this.next(new Error('session is undefined'));
    //     let performance = this.req.session['performance'];
    //     let args: COA.deleteTmpReserveInterface.Args = {
    //         /** 施設コード */
    //         theater_code: performance.theater,
    //         /** 上映日 */
    //         date_jouei: performance.day,
    //         /** 作品コード */
    //         title_code: performance.film,
    //         /** 作品枝番 */
    //         title_branch_num: performance.film_branch_code,
    //         /** 上映時刻 */
    //         time_begin: performance.time_start,
    //         /** 座席チケット仮予約番号 */
    //         tmp_reserve_num: '1233458844',
    //     }
    //     COA.deleteTmpReserveInterface.call(args, (err: Error, result: boolean) => {
    //         if (err) return this.next(new Error('サーバーエラー'));
    //         cb(result);
    //     });
    // }

    /**
     * 仮予約
     */
    private reserveSeatsTemporarily(seats: any, cb: Function): void {
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
            screen_code: performance.screen._id,
            /** 予約座席リスト */
            list_seat: seats
        }
        // {
        //     /** 座席セクション */
        //     seat_section: string,
        //     /** 座席番号 */
        //     seat_num: string,
        // }
        COA.reserveSeatsTemporarilyInterface.call(args, (err: Error, result: COA.reserveSeatsTemporarilyInterface.Result) => {
            if (err) return this.next(new Error(err.message));
            cb(result);
        });
    }




}
