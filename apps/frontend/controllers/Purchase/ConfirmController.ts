import PurchaseController from './PurchaseController';


export default class ConfirmController extends PurchaseController {
    /**
     * 購入者内容確認
     */
    public index(): void {
        if (!this.req.session) return this.next(new Error('session is undefined'));
        if (this.req.session['purchaseInfo']
            && this.req.session['performance']
            && this.req.session['reserveSeats']
            && this.req.session['reserveTickets']
            && this.req.session['updateReserve']) {
            //購入者内容確認表示
            this.res.locals['gmoTokenObject'] = (this.req.session['gmoTokenObject']) ? this.req.session['gmoTokenObject'] : null;
            this.res.locals['info'] = this.req.session['purchaseInfo'];
            this.res.locals['performance'] = this.req.session['performance'];
            this.res.locals['reserveSeats'] = this.req.session['reserveSeats'];
            this.res.locals['reserveTickets'] = this.req.session['reserveTickets'];
            this.res.locals['updateReserve'] = this.req.session['updateReserve'];
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
        if (!this.req.session) return this.next(new Error('session is undefined'));
        //モーションAPI仮購入
        // let toBeExpiredAt = this.req.params.toBeExpiredAt;
        // let isSecurityCodeSet = this.req.params.isSecurityCodeSet;


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
