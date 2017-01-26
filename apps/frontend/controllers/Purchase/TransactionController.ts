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
        if (!this.req.params || !this.req.params['id']) return this.next(new Error(PurchaseController.ERROR_MESSAGE_ACCESS));
        if (this.purchaseModel.transactionMP && this.purchaseModel.owner && this.purchaseModel.reserveSeats) {
            if (!this.router) return this.next(new Error('router is undefined'));
            //重複確認へ
            console.log('重複確認=====================')
            return this.res.redirect(this.router.build('purchase.overlap', {
                id: this.req.params['id']
            }));
        }

        this.transactionStart().then(() => {
            if (!this.router) return this.next(new Error('router is undefined'));
            if (!this.req.session) return this.next(new Error('session is undefined'));
            delete this.req.session['purchase'];
            //セッション更新
            this.req.session['purchase'] = this.purchaseModel.formatToSession();
            //座席選択へ
            return this.res.redirect(this.router.build('purchase.seat', {
                id: this.req.params['id']
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
        this.purchaseModel.expired = moment().add('minutes', 30).unix();
        this.purchaseModel.transactionMP = await MP.transactionStart.call({
            expired_at: this.purchaseModel.expired,
            owners: [this.purchaseModel.administrator._id, this.purchaseModel.owner._id]
        });
        
        this.logger.debug('MP取引開始', this.purchaseModel.transactionMP);
    }

    
}