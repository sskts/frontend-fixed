import PurchaseController from './PurchaseController';
import config = require('config');
import COA = require('@motionpicture/coa-service');
import MP = require('../../../../libs/MP');
import GMO = require("@motionpicture/gmo-service");

export default class OverlapController extends PurchaseController {
    /**
     * 仮予約重複
     */
    public index(): void {
        if (!this.req.params || !this.req.params['id']) return this.next(new Error(PurchaseController.ERROR_MESSAGE_ACCESS));
        if (!this.purchaseModel.performance) throw new Error('performance is undefined');
        //パフォーマンス取得
        MP.getPerformance.call({
            id: this.req.params['id']
        }).then((result) => {
            this.res.locals['performances'] = {
                after: result.data,
                before: this.purchaseModel.performance,
            }
            
            return this.res.render('purchase/overlap');
        }, (err) => {
            return this.next(new Error(err.message));
        });
    }

    /**
     * 新規予約へ
     */
    public newReserve(): void {
        this.removeReserve().then(()=>{
            if (!this.router) return this.next(new Error('router is undefined'));
            if (!this.req.session) return this.next(new Error('session is undefined'));
            //購入スタートへ
            delete this.req.session['purchase'];
            return this.res.redirect(this.router.build('purchase', {
                id: this.req.body.performance_id
            }));
        }, (err)=>{
            return this.next(new Error(err.message));
        });
    }

    /**
     * 前回の予約へ
     */
    public prevReserve(): void {
        if (!this.router) return this.next(new Error('router is undefined'));
        if (!this.req.session) return this.next(new Error('session is undefined'));
        //座席選択へ
         return this.res.redirect(this.router.build('purchase.seat', {
            id: this.req.body.performance_id
        }));
    }



    /**
     * 仮予約取り消し
     */
    private async removeReserve(): Promise<void> {
        if (!this.purchaseModel.performance) throw new Error('performance is undefined');
        if (!this.purchaseModel.transactionMP) throw new Error('transactionMP is undefined');
        if (!this.purchaseModel.reserveSeats) throw new Error('reserveSeats is undefined');
        if (!this.purchaseModel.authorizationCOA) throw new Error('authorizationCOA is undefined');

        let performance = this.purchaseModel.performance;
        let reserveSeats = this.purchaseModel.reserveSeats;

        //COA仮予約削除
        await COA.deleteTmpReserveInterface.call({
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
            /** 座席チケット仮予約番号 */
            tmp_reserve_num: String(reserveSeats.tmp_reserve_num),
        });

        this.logger.debug('COA仮予約削除');

        // COAオーソリ削除
        await MP.removeCOAAuthorization.call({
            transactionId: this.purchaseModel.transactionMP._id,
            coaAuthorizationId: this.purchaseModel.authorizationCOA._id
        });

        this.logger.debug('COAオーソリ削除');

        if (this.purchaseModel.transactionGMO
            && this.purchaseModel.authorizationGMO
            && this.purchaseModel.orderId) {
            //GMOオーソリ取消
            await GMO.CreditService.alterTranInterface.call({
                shop_id: config.get<string>('gmo_shop_id'),
                shop_pass: config.get<string>('gmo_shop_password'),
                access_id: this.purchaseModel.transactionGMO.access_id,
                access_pass: this.purchaseModel.transactionGMO.access_pass,
                job_cd: GMO.Util.JOB_CD_VOID
            });
            this.logger.debug('GMOオーソリ取消');

            // GMOオーソリ削除
            await MP.removeGMOAuthorization.call({
                transactionId: this.purchaseModel.transactionMP._id,
                gmoAuthorizationId: this.purchaseModel.authorizationGMO._id,
            });
            this.logger.debug('GMOオーソリ削除');
        }
        
    }

    

}
