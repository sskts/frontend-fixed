import PurchaseController from './PurchaseController';
import SeatForm from '../../forms/Purchase/SeatForm';
import request = require('request');
import config = require('config');

interface name {
    'en': string,
    'ja': string
}

interface performance {
    '__v': number,
    '_id': string,
    'created_at': Date,
    'day': string,
    'film': {
        '_id': string,
        'minutes': number,
        'name': name
    },
    'screen': string,
    'screen_name': name,
    'theater': string,
    'theater_name': name,
    'time_end': string,
    'time_start': string,
    'updated_at': Date
}

export default class SeatSelectController extends PurchaseController {
    /**
     * 座席選択
     */
    public index(): void {
        if (this.req.query && this.req.query['id']) {
            //パフォーマンス取得
            this.getPerformance(this.req.query['id'], (performance: performance) => {
                this.req.session['performance'] = performance;

                this.res.locals['performance'] = performance;
                this.res.locals['step'] = 0;
                this.res.render('purchase/seat');
            });
        }else if(this.checkSession('performance')) {
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
            //変更状態
            let changetype = this.getChangeType();

            if (changetype === 0) {
                //新規
                //モーションAPI仮予約(仮予約番号発行)
                let reservationNo = '123456789';
                //仮予約番号をセッションへ
                this.req.session['reservationNo'] = reservationNo;

                let seats: {
                    code: string,
                    type: string
                }[] = [];

                let seat_codes = JSON.parse(this.req.body.seat_codes);
                for (let code of seat_codes) {
                    seats.push({
                        code: code,
                        type: ''
                    })
                }
                //座席情報をセッションへ
                this.req.session['purchaseSeats'] = seats;
            } else if (changetype === 1) {
                //変更
                //モーションAPI仮予約削除
                //モーションAPI仮予約(仮予約番号発行)
                let reservationNo = '123456789';
                //仮予約番号をセッションへ
                this.req.session['reservationNo'] = reservationNo;

                let seats: {
                    code: string,
                    type: string
                }[] = [];

                let seat_codes = JSON.parse(this.req.body.seat_codes);
                for (let code of seat_codes) {
                    seats.push({
                        code: code,
                        type: ''
                    })
                }
                //座席情報をセッションへ
                this.req.session['purchaseSeats'] = seats;

            } else {
                //変更なし

            }

            this.logger.debug('購入者情報入力完了', this.req.session['purchaseSeats']);
            //券種選択へ
            this.res.redirect(this.router.build('purchase.ticket', {}));

        });
    }

    /**
     * 変更状態
     */
    private getChangeType(): number {
        let result: number;
        if (!this.req.session['reservationNo']) {
            //新規
            result = 0;
        } else {
            //変更
            //変更なし
            result = 1;
        }
        return result;
    }

    /**
     * パフォーマンス取得
     */
    private getPerformance(performancesId: string, cb: Function): void {
        let endpoint: string = config.get<string>('endpoint');
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




}
