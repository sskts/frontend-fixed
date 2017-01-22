import PurchaseController from './PurchaseController';
import PurchaseSession = require('../../models/Purchase/PurchaseModel');
import COA = require("@motionpicture/coa-service");
// import MP = require('../../../../libs/MP');

export default class ConfirmController extends PurchaseController {
    /**
     * 購入者内容確認
     */
    public index(): void {
        
        if (!this.purchaseModel.checkAccess(PurchaseSession.PurchaseModel.CONFIRM_STATE)) return this.next(new Error('無効なアクセスです'));
        

        //購入者内容確認表示
        this.res.locals['gmoTokenObject'] = (this.purchaseModel.gmo) ? this.purchaseModel.gmo : null;
        this.res.locals['input'] = this.purchaseModel.input;
        this.res.locals['performance'] = this.purchaseModel.performance;
        this.res.locals['reserveSeats'] = this.purchaseModel.reserveSeats;
        this.res.locals['reserveTickets'] = this.purchaseModel.reserveTickets;
        this.res.locals['step'] = PurchaseSession.PurchaseModel.CONFIRM_STATE;
        this.res.locals['price'] = this.purchaseModel.getReserveAmount();

        //セッション更新
        if (!this.req.session) return this.next(new Error('session is undefined'));
        this.req.session['purchase'] = this.purchaseModel.formatToSession();

        this.res.render('purchase/confirm');

    }

    /**
     * 座席本予約
     */
    private async updateReserve(): Promise<COA.updateReserveInterface.Result> {
        if (!this.req.session) throw new Error('session is undefined');
        if (!this.purchaseModel.performance) throw new Error('purchaseModel.performance is undefined');
        if (!this.purchaseModel.reserveSeats) throw new Error('purchaseModel.reserveSeats is undefined');
        if (!this.purchaseModel.input) throw new Error('purchaseModel.input is undefined');

        let performance = this.purchaseModel.performance;
        let reserveSeats = this.purchaseModel.reserveSeats;
        let input = this.purchaseModel.input;


        let amount: number = this.purchaseModel.getReserveAmount();


        let updateReserve = await COA.updateReserveInterface.call({
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
        //予約情報をセッションへ
        this.purchaseModel.updateReserve = updateReserve;
        this.req.session['purchase'] = this.purchaseModel.formatToSession();

        return updateReserve;
    }


    /**
     * 購入確定
     */
    public purchase() {
        this.updateReserve().then((result) => {
            //Session削除
            this.deleteSession();

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
