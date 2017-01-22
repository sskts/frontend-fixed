import PurchaseController from './PurchaseController';
import TicketForm from '../../forms/Purchase/TicketForm';
import PurchaseSession = require('../../models/Purchase/PurchaseModel');
import COA = require("@motionpicture/coa-service");

export default class TicketTypeSelectController extends PurchaseController {
    /**
     * 券種選択
     */
    public index(): void {
        if (!this.req.session) return this.next(new Error('session is undefined'));
        
        this.purchaseModel.checkAccess(PurchaseSession.PurchaseModel.TICKET_STATE, this.next);
        if (!this.purchaseModel.performance) return this.next(new Error('purchaseModel.performance is undefined'));

        //コアAPI券種取得
        let performance = this.purchaseModel.performance;
        COA.salesTicketInterface.call({
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
            /** スクリーンコード */
            // screen_code: performance.screen._id,
        }).then((result)=>{
            this.logger.debug('券種取得', result);
            this.res.locals['tickets'] = result.list_ticket;
            this.res.locals['performance'] = performance;
            this.res.locals['reserveSeats'] = this.purchaseModel.reserveSeats;
            this.res.locals['reserveTickets'] = (this.purchaseModel.reserveTickets) ? this.purchaseModel.reserveTickets : null;
            this.res.locals['step'] = PurchaseSession.PurchaseModel.TICKET_STATE;
            //セッション更新
            if (!this.req.session) return this.next(new Error('session is undefined'));
            this.req.session['purchase'] = this.purchaseModel.formatToSession();
            //券種選択表示
            this.res.render('purchase/ticket');
        }, (err)=>{
            return this.next(new Error(err.message));
        });
    }

    /**
     * 券種決定
     */
    public select(): void {
        //バリデーション
        TicketForm(this.req, this.res, () => {
            if (!this.router) return this.next(new Error('router is undefined'));

            //座席情報をセッションへ
            this.purchaseModel.reserveTickets = JSON.parse(this.req.body.reserve_tickets);
            this.logger.debug('券種決定完了', this.purchaseModel.reserveTickets);

            //セッション更新
            if (!this.req.session) return this.next(new Error('session is undefined'));
            this.req.session['purchase'] = this.purchaseModel.formatToSession();

            if (this.req.body['mvtk']) {
                //購入者情報入力へ
                this.res.redirect(this.router.build('purchase.mvtk', {}));
            } else {
                //購入者情報入力へ
                this.res.redirect(this.router.build('purchase.input', {}));
            }
        });
    }
}
