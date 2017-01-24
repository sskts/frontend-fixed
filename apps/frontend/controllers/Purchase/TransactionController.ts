import PurchaseController from './PurchaseController';
import config = require('config');
import MP = require('../../../../libs/MP');

/**
 * TODO any type
 */
export default class TransactionController extends PurchaseController {
    

    /**
     * 取引開始
     */
    public start(): void {
        if (!this.req.query || !this.req.query['id']) return this.next(new Error('不適切なアクセスです'));
        
        if (this.purchaseModel.transactionMP && this.purchaseModel.owner) {
            //TODO
            console.log('取引中');
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
        // 一般所有者作成
        this.purchaseModel.owner = await MP.ownerAnonymousCreate.call();
        this.logger.debug('MP一般所有者作成', this.purchaseModel.owner);
        // 取引開始
        this.purchaseModel.transactionMP = await MP.transactionStart.call({
            owners: [config.get<string>('admin_id'), this.purchaseModel.owner._id]
        });
        this.logger.debug('MP取引開始', this.purchaseModel.transactionMP);
    }

    
}