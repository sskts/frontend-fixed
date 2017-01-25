import PurchaseController from './PurchaseController';
import MP = require('../../../../libs/MP');
import moment = require('moment');

/**
 * TODO any type
 */
export default class TransactionController extends PurchaseController {
    

    /**
     * 取引開始
     */
    public start(): void {
        if (!this.req.query || !this.req.query['id']) return this.next(new Error(PurchaseController.ERROR_MESSAGE_ACCESS));
        if (this.purchaseModel.transactionMP && this.purchaseModel.owner && this.purchaseModel.reserveSeats) {
            if (!this.router) return this.next(new Error('router is undefined'));
            //重複確認へ
            this.res.redirect(this.router.build('purchase.overlap', {
                id: this.req.query['id']
            }));
        }

        this.transactionStart().then(() => {
            if (!this.router) return this.next(new Error('router is undefined'));
            if (!this.req.session) return this.next(new Error('session is undefined'));
            //セッション更新
            this.req.session['purchase'] = this.purchaseModel.formatToSession();
            //座席選択へ
            this.res.redirect(this.router.build('purchase.seat', {
                id: this.req.query['id']
            }));
        }, (err) => {
            return this.next(new Error(err.message));
        });
    }

     /**
     * 取引開始
     */
    private async transactionStart(): Promise<void> {
        // 運営者取得
        this.purchaseModel.administrator = await MP.getAdministrator.call();
        this.logger.debug('MP運営者', this.purchaseModel.administrator);
        // 一般所有者作成
        this.purchaseModel.owner = await MP.ownerAnonymousCreate.call();
        this.logger.debug('MP一般所有者作成', this.purchaseModel.owner);
        // 取引開始
        this.purchaseModel.transactionMP = await MP.transactionStart.call({
            expired_at: moment().add('minutes', 30).unix(),
            owners: [this.purchaseModel.administrator._id, this.purchaseModel.owner._id]
        });
        this.logger.debug('MP取引開始', this.purchaseModel.transactionMP);
    }

    
}