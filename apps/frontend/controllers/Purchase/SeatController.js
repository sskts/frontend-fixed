"use strict";
const PurchaseController_1 = require('./PurchaseController');
const SeatForm_1 = require('../../forms/Purchase/SeatForm');
const request = require('request');
const config = require('config');
const COA = require("../../../../lib/coa/coa");
class SeatSelectController extends PurchaseController_1.default {
    /**
     * 座席選択
     */
    index() {
        if (this.req.query && this.req.query['id']) {
            //パフォーマンス取得
            this.getPerformance(this.req.query['id'], (performance) => {
                console.log(performance);
                this.req.session['performance'] = performance;
                this.res.locals['performance'] = performance;
                this.res.locals['step'] = 0;
                this.res.render('purchase/seat');
            });
        }
        else if (this.checkSession('performance')) {
            this.res.locals['performance'] = this.req.session['performance'];
            this.res.locals['step'] = 0;
            this.res.render('purchase/seat');
        }
        else {
            return this.next(new Error('不適切なアクセスです'));
        }
    }
    /**
     * 座席決定
     */
    select() {
        //バリデーション
        SeatForm_1.default(this.req, this.res, () => {
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
            let seats = [];
            let seat_codes = JSON.parse(this.req.body.seat_codes);
            for (let code of seat_codes) {
                seats.push({
                    code: code,
                    ticket: null
                });
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
    getPerformance(performancesId, cb) {
        let endpoint = config.get('mp_api_endpoint');
        let method = 'performance';
        let options = {
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
    getScreenStateReserve() {
        let args = this.req.body;
        COA.getStateReserveSeatInterface.call(args, (err, result) => {
            this.res.json({
                err: err,
                result: result
            });
        });
    }
    /**
     * 仮予約
     */
    deleteTmpReserve(cb) {
        let performance = this.req.session['performance'];
        let args = {
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
        };
        COA.deleteTmpReserveInterface.call(args, (err, result) => {
            if (err)
                return this.next(new Error('サーバーエラー'));
            cb(result);
        });
    }
    /**
     * 仮予約削除
     */
    reserveSeatsTemporarily(cb) {
        let performance = this.req.session['performance'];
        let args = {
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
        };
        // {
        //     /** 座席セクション */
        //     seat_section: string,
        //     /** 座席番号 */
        //     seat_num: string,
        // }
        COA.reserveSeatsTemporarilyInterface.call(args, (err, result) => {
            if (err)
                return this.next(new Error('サーバーエラー'));
            cb(result);
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SeatSelectController;
