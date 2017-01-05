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
                console.log(performance)
                this.req.session['performance'] = performance;

                this.res.locals['performance'] = performance;
                this.res.locals['step'] = 0;
                this.res.render('purchase/seat');
            });
        } else if (this.checkSession('performance')) {
            this.res.locals['performance'] = this.req.session['performance'];
            this.res.locals['step'] = 0;
            this.res.render('purchase/seat');
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


            //新規
            //モーションAPI仮予約(仮予約番号発行)
            // TODO
            // //予約番号あり(仮予約削除=>仮予約)
            // this.deleteTmpReserve((result: COA.deleteTmpReserveInterface.Result) => {
            //     this.reserveSeatsTemporarily((result: COA.reserveSeatsTemporarilyInterface.Result) => {

            //     });
            // });


            // //予約番号なし(仮予約)
            // this.reserveSeatsTemporarily((result: COA.reserveSeatsTemporarilyInterface.Result) => {

            // });




            let seats: {
                code: string,
                ticket: any
            }[] = [];

            let seat_codes = JSON.parse(this.req.body.seat_codes);
            for (let code of seat_codes) {
                seats.push({
                    code: code,
                    ticket: null
                })
            }
            //座席情報をセッションへ
            this.req.session['purchaseSeats'] = seats;

            this.logger.debug('購入者情報入力完了', this.req.session['purchaseSeats']);
            //券種選択へ
            this.res.redirect(this.router.build('purchase.ticket', {}));

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
            if (!body.success) {
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
     * 仮予約
     */
    private deleteTmpReserve(cb: Function): void {
        let performance = this.req.session['performance'];
        let args: COA.deleteTmpReserveInterface.Args = {
            /** 施設コード */
            theater_code: performance.theater,
            /** 上映日 */
            date_jouei: performance.day,
            /** 作品コード */
            title_code: performance.film,
            /** 作品枝番 */
            title_branch_num: performance.film_branch_code,
            /** 上映時刻 */
            time_begin: performance.time_start,
            /** 座席チケット仮予約番号 */
            tmp_reserve_num: '1233458844',
        }
        COA.deleteTmpReserveInterface.call(args, (err: Error, result: boolean) => {
            if (err) return this.next(new Error('サーバーエラー'));
            cb(result);
        });
    }

    /**
     * 仮予約削除
     */
    private reserveSeatsTemporarily(cb: Function): void {
        let performance = this.req.session['performance'];
        let args: COA.reserveSeatsTemporarilyInterface.Args = {
            /** 施設コード */
            theater_code: performance.theater,
            /** 上映日 */
            date_jouei: performance.day,
            /** 作品コード */
            title_code: performance.film,
            /** 作品枝番 */
            title_branch_num: performance.film_branch_code,
            /** 上映時刻 */
            time_begin: performance.time_start,
            /** 予約座席数 */
            // cnt_reserve_seat: number,
            /** 予約座席リスト */
            list_seat: []
        }
        // {
        //     /** 座席セクション */
        //     seat_section: string,
        //     /** 座席番号 */
        //     seat_num: string,
        // }
        COA.reserveSeatsTemporarilyInterface.call(args, (err: Error, result: COA.reserveSeatsTemporarilyInterface.Result) => {
            if (err) return this.next(new Error('サーバーエラー'));
            cb(result);
        });
    }




}
