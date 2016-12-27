import PurchaseController from './PurchaseController';


export default class ConfirmController extends PurchaseController {
    /**
     * 購入者内容確認
     */
    public index(): void {
        if (this.checkSession('reservationNo')
        && this.checkSession('gmo_token_object')
        && this.checkSession('purchaseInfo')
        && this.checkSession('performance')
        && this.checkSession('purchaseSeats')) {
            this.logger.debug('購入者情報入力表示', this.req.session['reservationNo']);
            //購入者内容確認表示
            this.res.locals['reservationNo'] = this.req.session['reservationNo'];
            this.res.locals['gmo_token_object'] = this.req.session['gmo_token_object'];
            this.res.locals['info'] = this.req.session['purchaseInfo'];
            this.res.locals['performance'] = this.req.session['performance'];
            this.res.locals['seats'] = this.req.session['purchaseSeats'];
            this.res.locals['step'] = 3;
            this.res.render('purchase/confirm');
        } else {
            return this.next(new Error('無効なアクセスです'));
        }
        
    }

    /**
     * 購入確定
     */
    public purchase(): void {
        
        //モーションAPI仮購入
        let token = this.req.params.token;
        let toBeExpiredAt = this.req.params.toBeExpiredAt;
        let isSecurityCodeSet = this.req.params.isSecurityCodeSet;
        let reservationNo = this.req.params.reservationNo;

        this.logger.debug('仮購入', {
            token: token,
            reservationNo: reservationNo
        });

        this.deleteSession();

        let purchaseNo = '1234567889';

        this.logger.debug('購入確定', purchaseNo);
        
        this.logger.debug('照会情報取得');
        this.req.session['inquiry'] = {
            purchaseNo: purchaseNo,
            tickets: [
                {
                    id: '123456A1',
                    seat: 'A-1',
                    type: '一般',
                    date: '2016/12/1（木） 15:00〜',
                    theater: 'シネマサンシャイン池袋',
                    screen: 'スクリーン3',
                    title: 'ファンタスティック・ビーストと魔法使いの旅',
                    password: '1q2w3e4r5t'
                },
                {
                    id: '123456A1',
                    seat: 'A-1',
                    type: '一般',
                    date: '2016/12/1（木） 15:00〜',
                    theater: 'シネマサンシャイン池袋',
                    screen: 'スクリーン3',
                    title: 'ファンタスティック・ビーストと魔法使いの旅',
                    password: '1q2w3e4r5t'
                },
                {
                    id: '123456A1',
                    seat: 'A-1',
                    type: '一般',
                    date: '2016/12/1（木） 15:00〜',
                    theater: 'シネマサンシャイン池袋',
                    screen: 'スクリーン3',
                    title: 'ファンタスティック・ビーストと魔法使いの旅',
                    password: '1q2w3e4r5t'
                }
            ]
        };

        //購入完了情報を返す
        this.res.json({
            purchaseNo: purchaseNo
        });
    }


}
