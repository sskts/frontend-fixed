import PurchaseController from './PurchaseController';
import TicketForm from '../../forms/Purchase/TicketForm';
import PurchaseSession = require('../../models/Purchase/PurchaseModel');
import config = require('config');
import COA = require("@motionpicture/coa-service");
import GMO = require("@motionpicture/gmo-service");
import MP = require('../../../../libs/MP');

export default class TicketTypeSelectController extends PurchaseController {
    /**
     * 券種選択
     */
    public index(): void {
        if (!this.purchaseModel.accessAuth(PurchaseSession.PurchaseModel.TICKET_STATE)) return this.next(new Error(PurchaseController.ERROR_MESSAGE_ACCESS));
        if (!this.purchaseModel.performance) return this.next(new Error('purchaseModel.performance is undefined'));

        //コアAPI券種取得
        let performance = this.purchaseModel.performance;
        COA.salesTicketInterface.call({
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
            /** スクリーンコード */
            // screen_code: performance.screen._id,
        }).then((result) => {
            this.logger.debug('券種取得', result);
            this.res.locals['tickets'] = result.list_ticket;
            this.res.locals['performance'] = performance;
            this.res.locals['reserveSeats'] = this.purchaseModel.reserveSeats;
            this.res.locals['reserveTickets'] = this.purchaseModel.reserveTickets;
            this.res.locals['step'] = PurchaseSession.PurchaseModel.TICKET_STATE;

            //セッション更新
            if (!this.req.session) return this.next(new Error('session is undefined'));
            this.req.session['purchase'] = this.purchaseModel.formatToSession();
            //券種選択表示
            return this.res.render('purchase/ticket');
        }, (err) => {
            return this.next(new Error(err.message));
        });
    }

    /**
     * 券種決定
     */
    public select(): void {
        if (!this.transactionAuth()) return this.next(new Error(PurchaseController.ERROR_MESSAGE_ACCESS));
        //バリデーション
        TicketForm(this.req, this.res, () => {
            //座席情報をセッションへ
            this.purchaseModel.reserveTickets = JSON.parse(this.req.body.reserve_tickets);
            this.logger.debug('券種決定完了');
            if (this.req.body['mvtk']) {
                if (!this.router) return this.next(new Error('router is undefined'));
                if (!this.req.session) return this.next(new Error('session is undefined'));
                //セッション更新
                this.req.session['purchase'] = this.purchaseModel.formatToSession();
                //ムビチケ入力へ
                return this.res.redirect(this.router.build('purchase.mvtk', {}));
            } else {
                this.upDateAuthorization().then(() => {
                    if (!this.router) return this.next(new Error('router is undefined'));
                    if (!this.req.session) return this.next(new Error('session is undefined'));
                    //セッション更新
                    this.req.session['purchase'] = this.purchaseModel.formatToSession();
                    //購入者情報入力へ
                    return this.res.redirect(this.router.build('purchase.input', {}));
                }, (err) => {
                    return this.next(new Error(err.message));
                });

            }
        });
    }

    /**
     * オーソリ追加
     */
    private async upDateAuthorization(): Promise<void> {
        if (!this.purchaseModel.transactionMP) throw new Error('transactionMP is undefined');
        if (!this.purchaseModel.performance) throw new Error('performance is undefined');
        if (!this.purchaseModel.reserveSeats) throw new Error('reserveSeats is undefined');
        if (!this.purchaseModel.reserveTickets) throw new Error('reserveTickets is undefined');
        if (!this.purchaseModel.owner) throw new Error('owners is undefined');
        if (!this.purchaseModel.administrator) throw new Error('administrator is undefined');

        // COAオーソリ削除
        await MP.removeCOAAuthorization.call({
            transaction: this.purchaseModel.transactionMP,
            ownerId4administrator: this.purchaseModel.administrator._id,
            reserveSeatsTemporarilyResult: this.purchaseModel.reserveSeats,
            addCOAAuthorizationResult: this.purchaseModel.performance
        });

        this.logger.debug('MPCOAオーソリ削除');

        if (this.purchaseModel.transactionGMO
            && this.purchaseModel.authorizationGMO
            && this.purchaseModel.orderId) {
            //GMOオーソリあり
            if (!this.purchaseModel.transactionGMO) throw new Error('transactionGMO is undefined');
            if (!this.purchaseModel.authorizationGMO) throw new Error('authorizationGMO is undefined');
            if (!this.purchaseModel.orderId) throw new Error('orderId is undefined');


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
                transaction: this.purchaseModel.transactionMP,
                addGMOAuthorizationResult: this.purchaseModel.authorizationGMO,
            });
            this.logger.debug('GMOオーソリ削除');
        }

        //COAオーソリ追加
        let COAAuthorizationResult = await MP.addCOAAuthorization.call({
            transaction: this.purchaseModel.transactionMP,
            administratorOwnerId: this.purchaseModel.administrator._id,
            anonymousOwnerId: this.purchaseModel.owner._id,
            reserveSeatsTemporarilyResult: this.purchaseModel.reserveSeats,
            salesTicketResults: this.purchaseModel.reserveTickets,
            performance: this.purchaseModel.performance,
            totalPrice: this.purchaseModel.getReserveAmount()
        });
        this.logger.debug('MPCOAオーソリ追加', COAAuthorizationResult);

        this.purchaseModel.authorizationCOA = COAAuthorizationResult;



    }
}
