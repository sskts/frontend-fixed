"use strict";
const PurchaseController_1 = require('./PurchaseController');
const SeatSelectForm_1 = require('../../forms/Purchase/SeatSelectForm');
const request = require('request');
const config = require('config');
class SeatSelectController extends PurchaseController_1.default {
    /**
     * 座席選択
     */
    index() {
        if (this.req.query && this.req.query['id']) {
            //パフォーマンス取得
            this.getPerformance(this.req.query['id'], (performance) => {
                this.req.session['performance'] = performance;
                this.res.locals['performance'] = performance;
                this.res.locals['step'] = 0;
                this.res.render('purchase/seatSelect');
            });
        }
        else {
            return this.next(new Error('不適切なアクセスです'));
        }
    }
    /**
     * 座席決定
     */
    submit() {
        //バリデーション
        SeatSelectForm_1.default(this.req, this.res, () => {
            //変更状態
            let changetype = this.getChangeType();
            if (changetype === 0) {
                //新規
                //モーションAPI仮予約(仮予約番号発行)
                let reservationNo = '123456789';
                //仮予約番号をセッションへ
                this.req.session['reservationNo'] = reservationNo;
                let seats = [];
                let seatCodes = JSON.parse(this.req.body.seatCodes);
                for (let code of seatCodes) {
                    seats.push({
                        code: code,
                        type: ''
                    });
                }
                //座席情報をセッションへ
                this.req.session['purchaseSeats'] = seats;
            }
            else if (changetype === 1) {
                //変更
                //モーションAPI仮予約削除
                //モーションAPI仮予約(仮予約番号発行)
                let reservationNo = '123456789';
                //仮予約番号をセッションへ
                this.req.session['reservationNo'] = reservationNo;
                let seats = [];
                let seatCodes = JSON.parse(this.req.body.seatCodes);
                for (let code of seatCodes) {
                    seats.push({
                        code: code,
                        type: ''
                    });
                }
                //座席情報をセッションへ
                this.req.session['purchaseSeats'] = seats;
            }
            else {
            }
            this.logger.debug('購入者情報入力完了', this.req.session['purchaseSeats']);
            //券種選択へ
            this.res.redirect(this.router.build('purchase.ticketTypeSelect', {}));
        });
    }
    /**
     * 変更状態
     */
    getChangeType() {
        let result;
        if (!this.req.session['reservationNo']) {
            //新規
            result = 0;
        }
        else {
            //変更
            //変更なし
            result = 1;
        }
        return result;
    }
    /**
     * パフォーマンス取得
     */
    getPerformance(performancesId, cb) {
        let endpoint = config.get('endpoint');
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
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SeatSelectController;
