import PurchaseController from './PurchaseController';


export default class TicketTypeSelectController extends PurchaseController {
    /**
     * 券種選択
     */
    public index(): void {
        this.logger.debug('session', this.req.session)
        this.res.locals['token'] = this.req.session['purchaseToken'];
        //コアAPI券種取得

        //券種選択表示
        this.res.render('purchase/ticketTypeSelect');
    }

    /**
     * 券種決定
     */
    public denominationSelect(): void {
        this.checkToken();
        let tickets = [
            {type: '一般', length: 2},
            {type: '学生', length: 1}
        ];
        //券種情報をセッションへ
        this.req.session['purchaseFilm']['tickets'] = tickets;
        //購入者情報入力へ
        this.res.redirect(this.router.build('purchase.enterPurchaser', {}));
    }


}
