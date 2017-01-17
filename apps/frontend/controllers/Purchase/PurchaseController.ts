import BaseController from '../BaseController';
import COA = require("@motionpicture/coa-service");
/**
 * TODO any type
 */
export default class PurchaseController extends BaseController {

    /**
     * セッション削除
     */
    protected deleteSession(): void {
        if (!this.req.session) return;
        delete this.req.session['purchaseInfo']
        // delete this.req.session['performance']
        delete this.req.session['reserveSeats']
        delete this.req.session['reserveTickets']
        delete this.req.session['updateReserve']
        delete this.req.session['gmoTokenObject'];
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
    protected deleteTmpReserve(args: any, cb: Function): void {
        if (!this.req.session) return this.next(new Error('session is undefined'));
        let performance = args.performance;
        let reserveSeats = args.reserveSeats;
        
        COA.deleteTmpReserveInterface.call({
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
        }, (err, result) => {
            if (err) return this.next(new Error(err.message));
            this.logger.debug('仮予約削除', result);
            cb(result);
        });
    }

    /**
     * 仮予約
     */
    protected reserveSeatsTemporarily(args: any, cb: Function): void {
        if (!this.req.session) return this.next(new Error('session is undefined'));
        let performance = args.performance;
        let seats = args.seats;

        COA.reserveSeatsTemporarilyInterface.call({
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
        }, (err, result) => {
            if (err) return this.next(new Error(err.message));
            this.logger.debug('仮予約完了', result);
            cb(result);
        });
    }

    /**
     * 券種取得
     */
    protected getSalesTicket(args: any, cb: Function): void {
        if (!this.req.session) return this.next(new Error('session is undefined'));
        let performance = args.performance;
        COA.salesTicketInterface.call({
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
            /** スクリーンコード */
            // screen_code: performance.screen._id,
        }, (err, result) => {
            if (err) return this.next(new Error(err.message));
            cb(result);
        });
    }

    /**
     * 座席本予約
     */
    protected updateReserve(args: any, cb: Function): void {
        if (!this.req.session) return this.next(new Error('session is undefined'));
        let performance = args.performance;
        let reserveSeats = args.reserveSeats;
        let purchaseInfo = args.purchaseInfo;
        let reserveTickets = args.reserveTickets;
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

        COA.updateReserveInterface.call({
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
        }, (err, result) => {
            if (err) return this.next(new Error(err.message));
            if (!this.req.session) return this.next(new Error('session is undefined'));
            this.logger.debug('本予約完了', result);
            cb(result);
        });
    }

    /**
     * 金額取得
     */
    protected getPrice(args: any): number {
        let reserveSeats = args.reserveSeats;
        let reserveTickets = args.reserveTickets;
        let price = 0;
        for (let seat of reserveSeats.list_tmp_reserve) {
            let ticket = reserveTickets[seat['seat_num']];
            price += ticket.sale_price;
        }
        return price;
    }
}