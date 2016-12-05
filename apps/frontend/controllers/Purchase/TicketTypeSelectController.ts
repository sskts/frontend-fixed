import PurchaseController from './PurchaseController';


export default class TicketTypeSelectController extends PurchaseController {
    /**
     * 券種選択
     */
    public index(): void {
        this.logger.debug(this.req.body);
        this.res.locals['token'] = this.req.session['purchaseToken'];
        //コアAPI券種取得
        //販売対象マスター抽出
        let sales = {
            status: '0',
            message: 'メッセージ',
            salesTargetList: [
                {
                    salesTargetCode: '0000',
                    salesTargetName: '一般',
                    salesTargetNameKana: '一般',
                    salesTargetNameEnglish: '一般'
                },
                {
                    salesTargetCode: '0001',
                    salesTargetName: '中学生・小学生',
                    salesTargetNameKana: '中学生・小学生',
                    salesTargetNameEnglish: '中学生・小学生'
                }
            ]
            
        };
        this.res.locals['SALES_TYPE'] = {
            '0000': '一般',
            '0001': '中学生・小学生'
        };
        this.res.locals['sales'] = sales;
        this.res.locals['seats'] = this.req.session['purchaseSeats'];;
        //券種選択表示
        this.res.render('purchase/ticketTypeSelect');
    }

    /**
     * 券種決定
     */
    public denominationSelect(): void {
        this.checkToken();
        this.logger.debug('request', this.req.body);
        let seats: {
            code: string,
            type: string
        }[] = JSON.parse(this.req.body.seatCodes);
        
        //モーションAPI仮抑え
        
        //座席情報をセッションへ
        this.req.session['purchaseSeats'] = seats;
        //購入者情報入力へ
        this.res.redirect(this.router.build('purchase.enterPurchaser', {}));
    }


}
