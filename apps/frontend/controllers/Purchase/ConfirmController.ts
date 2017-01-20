import PurchaseController from './PurchaseController';
import PurchaseSession = require('../../models/Purchase/PurchaseModel');
import COA = require("@motionpicture/coa-service");
// import MP = require('../../../../libs/MP');

export default class ConfirmController extends PurchaseController {
    /**
     * 購入者内容確認
     */
    public index(): void {
        
        this.purchaseModel.checkAccess(PurchaseSession.PurchaseModel.CONFIRM_STATE, this.next);
        
        //購入者内容確認表示
        this.res.locals['gmoTokenObject'] = (this.purchaseModel.gmo) ? this.purchaseModel.gmo : null;
        this.res.locals['info'] = this.purchaseModel.input;
        this.res.locals['performance'] = this.purchaseModel.performance;
        this.res.locals['reserveSeats'] = this.purchaseModel.reserveSeats;
        this.res.locals['reserveTickets'] = this.purchaseModel.reserveTickets;
        this.res.locals['step'] = PurchaseSession.PurchaseModel.CONFIRM_STATE;
        this.res.locals['price'] = this.purchaseModel.getReserveAmount();

        //セッション更新
        if (!this.req.session) return this.next(new Error('session is undefined'));
        this.purchaseModel.upDate(this.req.session['purchase']);

        this.res.render('purchase/confirm');

    }

    /**
     * 座席本予約
     */
    private async updateReserve(): Promise<COA.updateReserveInterface.Result> {
        if (!this.purchaseModel.performance) throw new Error('purchaseModel.performance is undefined');
        if (!this.purchaseModel.reserveSeats) throw new Error('purchaseModel.reserveSeats is undefined');
        if (!this.purchaseModel.input) throw new Error('purchaseModel.input is undefined');

        let performance = this.purchaseModel.performance;
        let reserveSeats = this.purchaseModel.reserveSeats;
        let input = this.purchaseModel.input;


        let amount: number = this.purchaseModel.getReserveAmount();


        let updateReserve = COA.updateReserveInterface.call({
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
            /** 予約者名 */
            reserve_name: input.last_name_hira + input.first_name_hira,
            /** 予約者名（かな） */
            reserve_name_jkana: input.last_name_hira + input.first_name_hira,
            /** 電話番号 */
            tel_num: input.tel_num,
            /** メールアドレス */
            mail_addr: input.mail_addr,
            /** 予約金額 */
            reserve_amount: amount,
            /** 価格情報リスト */
            list_ticket: this.purchaseModel.getTicketList(),
        });

        this.logger.debug('本予約完了', updateReserve);
        return updateReserve;
    }


    /**
     * 購入確定
     */
    public async purchase() {
        this.updateReserve().then((result) => {
            
            //予約情報をセッションへ
            this.purchaseModel.updateReserve = result;
            //セッション更新
            if (!this.req.session) return this.next(new Error('session is undefined'));
            this.purchaseModel.upDate(this.req.session['purchase']);
            
            this.deleteSession();

            this.logger.debug('照会情報取得');
            //TODO スクリーンコード未追加
            if (!this.req.session) return this.next(new Error('session is undefined'));
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
