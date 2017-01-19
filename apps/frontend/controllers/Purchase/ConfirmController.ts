import PurchaseController from './PurchaseController';
import COA = require("@motionpicture/coa-service");

export default class ConfirmController extends PurchaseController {
    /**
     * 購入者内容確認
     */
    public index(): void {
        if (!this.req.session) return this.next(new Error('session is undefined'));
        if (this.req.session['purchaseInfo']
            && this.req.session['performance']
            && this.req.session['reserveSeats']
            && this.req.session['reserveTickets']) {
            //購入者内容確認表示
            this.res.locals['gmoTokenObject'] = (this.req.session['gmoTokenObject']) ? this.req.session['gmoTokenObject'] : null;
            this.res.locals['info'] = this.req.session['purchaseInfo'];
            this.res.locals['performance'] = this.req.session['performance'];
            this.res.locals['reserveSeats'] = this.req.session['reserveSeats'];
            this.res.locals['reserveTickets'] = this.req.session['reserveTickets'];
            this.res.locals['step'] = 3;
            this.res.locals['price'] = this.getPrice({
                reserveTickets: this.req.session['reserveTickets'],
                reserveSeats: this.req.session['reserveSeats']
            });
            this.res.render('purchase/confirm');
        } else {
            return this.next(new Error('無効なアクセスです'));
        }

    }

    /**
     * 座席本予約
     */
    private updateReserve(): Promise<COA.updateReserveInterface.Result> {
        if (!this.req.session) throw new Error('session is undefined');

        let performance = this.req.session['performance'];
        let reserveSeats = this.req.session['reserveSeats'];
        let purchaseInfo = this.req.session['purchaseInfo'];
        let reserveTickets = this.req.session['reserveTickets'];
        let tickets: any[] = [];

        for (let seat of reserveSeats.list_tmp_reserve) {
            let ticket = reserveTickets[seat['seat_num']];
            tickets.push({
                /** チケットコード */
                ticket_code: ticket.ticket_code,
                /** 標準単価 */
                std_price: ticket.std_price,
                /** 加算単価 */
                add_price: ticket.add_price,
                /** 割引額 */
                dis_price: ticket.dis_price || 0,
                /** 金額 */
                sale_price: ticket.sale_price,
                /** 枚数 */
                ticket_count: ticket.limit_count,
                /** 座席番号 */
                seat_num: seat['seat_num'],
            });
        }

        /** 予約金額 */
        let amount: number = this.getPrice({
            reserveSeats: reserveSeats,
            reserveTickets: reserveTickets
        });


        let updateReserve = COA.updateReserveInterface.call({
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
            /** 予約者名 */
            reserve_name: purchaseInfo.last_name_kanji + purchaseInfo.first_name_kanji,
            /** 予約者名（かな） */
            reserve_name_jkana: purchaseInfo.last_name_hira + purchaseInfo.first_name_hira,
            /** 電話番号 */
            tel_num: purchaseInfo.tel_num,
            /** メールアドレス */
            mail_addr: purchaseInfo.mail_addr,
            /** 予約金額 */
            reserve_amount: amount,
            /** 価格情報リスト */
            list_ticket: tickets,
        });

        this.logger.debug('本予約完了', updateReserve);
        return updateReserve;
    }


    /**
     * 購入確定
     */
    public async purchase() {
        this.updateReserve().then((result) => {
            if (!this.req.session) return this.next(new Error('session is undefined'));
            //予約情報をセッションへ
            this.req.session['updateReserve'] = result;
            this.deleteSession();

            this.logger.debug('照会情報取得');
            //TODO スクリーンコード未追加
            this.req.session['inquiry'] = {
                status: 0,
                message: '',
                list_reserve_seat:
                [{ seat_num: 'Ｊ－７' },
                { seat_num: 'Ｊ－８' },
                { seat_num: 'Ｊ－９' },
                { seat_num: 'Ｊ－１０' }],
                title_branch_num: '0',
                title_code: '8570',
                list_ticket:
                [{
                    ticket_count: 2,
                    ticket_name: '一般',
                    ticket_price: 1800,
                    ticket_code: '10'
                },
                {
                    ticket_count: 1,
                    ticket_name: '大･高生',
                    ticket_price: 1500,
                    ticket_code: '30'
                },
                {
                    ticket_code: '80',
                    ticket_price: 1000,
                    ticket_count: 1,
                    ticket_name: 'シニア'
                }],
                time_begin: '2130',
                date_jouei: '20161215'
            };

            this.logger.debug('購入確定', result);
            //購入完了情報を返す
            this.res.json({
                err: null,
                result: result
            });
        }, (err) => {
            //購入完了情報を返す
            this.res.json({
                err: err,
                result: null
            });
        });
    }






}
