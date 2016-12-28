import PurchaseController from './PurchaseController';
import TicketForm from '../../forms/Purchase/TicketForm';

export default class TicketTypeSelectController extends PurchaseController {
    /**
     * 券種選択
     */
    public index(): void {
        if (this.checkSession('reservationNo')
        && this.checkSession('performance')
        && this.checkSession('purchaseSeats')) {
            this.logger.debug('券種選択表示', this.req.session['reservationNo']);
            
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
            this.res.locals['seats'] = this.req.session['purchaseSeats'];
            this.res.locals['step'] = 1;
            this.res.locals['reservationNo'] = this.req.session['reservationNo'];
            //券種選択表示
            this.res.render('purchase/ticket');
        } else {
            return this.next(new Error('無効なアクセスです'));
        }
    }

    /**
     * 券種決定
     */
    public select(): void {
        if (this.checkSession('reservationNo')) {
            //バリデーション
            TicketForm(this.req, this.res, () => {
                let seats: {
                    code: string,
                    type: string
                }[] = JSON.parse(this.req.body.seat_codes);

                //モーションAPI仮抑え

                //座席情報をセッションへ
                this.req.session['purchaseSeats'] = seats;
                this.logger.debug('購入者情報入力完了', this.req.session['purchaseSeats']);
                
                if (this.req.body['mvtk']) {
                    //購入者情報入力へ
                    this.res.redirect(this.router.build('purchase.mvtk', {}));
                } else {
                    //購入者情報入力へ
                    this.res.redirect(this.router.build('purchase.input', {}));
                }
                

            });
        } else {
            return this.next(new Error('無効なアクセスです'));
        }

    }


}
