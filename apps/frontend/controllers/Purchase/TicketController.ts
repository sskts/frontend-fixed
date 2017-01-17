import PurchaseController from './PurchaseController';
import TicketForm from '../../forms/Purchase/TicketForm';
import COA = require("@motionpicture/coa-service");

export default class TicketTypeSelectController extends PurchaseController {
    /**
     * 券種選択
     */
    public index(): void {
        if (!this.req.session) return this.next(new Error('session is undefined'));
        if (this.req.session['performance']
            && this.req.session['reserveSeats']) {

            //コアAPI券種取得
            this.getSalesTicket({
                performance: this.req.session['performance']
            }, (result: COA.salesTicketInterface.Result) => {
                if (!this.req.session) return this.next(new Error('session is undefined'));
                this.res.locals['tickets'] = result.list_ticket;
                this.res.locals['performance'] = this.req.session['performance'];
                this.res.locals['reserveSeats'] = this.req.session['reserveSeats'];
                this.res.locals['reserveTickets'] = (this.req.session['reserveTickets']) ? this.req.session['reserveTickets'] : null;
                this.res.locals['step'] = 1;
                //券種選択表示
                this.res.render('purchase/ticket');
            });


        } else {
            return this.next(new Error('無効なアクセスです'));
        }
    }

    /**
     * 券種決定
     */
    public select(): void {
        //バリデーション

        TicketForm(this.req, this.res, () => {
            if (!this.req.session) return this.next(new Error('session is undefined'));
            if (!this.router) return this.next(new Error('router is undefined'));

            //モーションAPI仮抑え

            //座席情報をセッションへ
            this.req.session['reserveTickets'] = JSON.parse(this.req.body.reserve_tickets);
            this.logger.debug('券種決定完了', this.req.session['reserveTickets']);

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
