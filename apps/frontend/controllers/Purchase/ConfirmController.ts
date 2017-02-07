import PurchaseController from './PurchaseController';
import PurchaseSession = require('../../models/Purchase/PurchaseModel');
import COA = require("@motionpicture/coa-service");
import MP = require('../../../../libs/MP');
import moment = require('moment');

export default class ConfirmController extends PurchaseController {
    /**
     * 購入者内容確認
     */
    public index(): void {

        if (!this.purchaseModel.accessAuth(PurchaseSession.PurchaseModel.CONFIRM_STATE)) return this.next(new Error(this.req.__('common.error.access')));


        //購入者内容確認表示
        this.res.locals['gmoTokenObject'] = (this.purchaseModel.gmo) ? this.purchaseModel.gmo : null;
        this.res.locals['input'] = this.purchaseModel.input;
        this.res.locals['performance'] = this.purchaseModel.performance;
        this.res.locals['reserveSeats'] = this.purchaseModel.reserveSeats;
        this.res.locals['reserveTickets'] = this.purchaseModel.reserveTickets;
        this.res.locals['step'] = PurchaseSession.PurchaseModel.CONFIRM_STATE;
        this.res.locals['price'] = this.purchaseModel.getReserveAmount();
        this.res.locals['updateReserve'] = null;

        //セッション更新
        if (!this.req.session) return this.next(this.req.__('common.error.property'));
        this.req.session['purchase'] = this.purchaseModel.formatToSession();

        return this.res.render('purchase/confirm');

    }

    /**
     * 座席本予約
     */
    private async updateReserve(): Promise<void> {
        if (!this.purchaseModel.performance) throw new Error('purchaseModel.performance is undefined');
        if (!this.purchaseModel.reserveSeats) throw new Error('purchaseModel.reserveSeats is undefined');
        if (!this.purchaseModel.input) throw new Error('purchaseModel.input is undefined');
        if (!this.purchaseModel.transactionMP) throw Error('purchaseModel.transactionMP is undefined');
        if (!this.purchaseModel.expired) throw Error('purchaseModel.transactionMP is undefined');
        //購入期限切れ
        if (this.purchaseModel.expired < moment().add(5, 'minutes').unix()) {
            throw {
                error: new Error(this.req.__('common.error.expire')),
                type: 'expired'
            };
        }

        
            

        let performance = this.purchaseModel.performance;
        let reserveSeats = this.purchaseModel.reserveSeats;
        let input = this.purchaseModel.input;

        try {
            // COA本予約
            this.purchaseModel.updateReserve = await COA.updateReserveInterface.call({
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
                tmp_reserve_num: reserveSeats.tmp_reserve_num,
                /** 予約者名 */
                reserve_name: `${input.last_name_hira}　${input.first_name_hira}`,
                /** 予約者名（かな） */
                reserve_name_jkana: `${input.last_name_hira}　${input.first_name_hira}`,
                /** 電話番号 */
                tel_num: input.tel_num,
                /** メールアドレス */
                mail_addr: input.mail_addr,
                /** 予約金額 */
                reserve_amount: this.purchaseModel.getReserveAmount(),
                /** 価格情報リスト */
                list_ticket: this.purchaseModel.getTicketList(),
            });
            this.logger.debug('COA本予約', this.purchaseModel.updateReserve);
        } catch (err) {
            throw {
                error: new Error(err.message),
                type: 'updateReserve'
            };
        }

        // MP購入者情報登録
        await MP.ownersAnonymous.call({
            transactionId: this.purchaseModel.transactionMP._id,
            name_first: input.first_name_hira,
            name_last: input.last_name_hira,
            tel: input.tel_num,
            email: input.mail_addr,
        });
        this.logger.debug('MP購入者情報登録');

        // MP照会情報登録
        await MP.transactionsEnableInquiry.call({
            transactionId: this.purchaseModel.transactionMP._id,
            inquiry_theater: this.purchaseModel.performance.attributes.theater._id,
            inquiry_id: this.purchaseModel.updateReserve.reserve_num,
            inquiry_pass: this.purchaseModel.input.tel_num,
        });
        this.logger.debug('MP照会情報登録');

        
        // MPメール登録
        let mail = this.createMail();
        await MP.addEmail.call({
            transactionId: this.purchaseModel.transactionMP._id,
            from: mail.from,
            to: mail.to,
            subject: mail.subject,
            content: mail.content,
        });
        this.logger.debug('MPメール登録');

        // MP取引成立
        await MP.transactionClose.call({
            transactionId: this.purchaseModel.transactionMP._id,
        });
        this.logger.debug('MP取引成立');
    }

    /**
     * メール作成
     */
    private createMail(): {
        from: string,
        to: string,
        subject: string,
        content: string,
    } {
        if (!this.purchaseModel.input) throw new Error('purchaseModel.input is undefined');
        let content = 
`購入完了\n
この度はご購入いただき誠にありがとうございます。
`;

        return {
            from: 'noreply@localhost',
            to: this.purchaseModel.input.mail_addr,
            subject: '購入完了',
            content: content,
        }

    }


    /**
     * 購入確定
     */
    public purchase(): void {
        if (!this.transactionAuth()) return this.next(new Error(this.req.__('common.error.access')));
        this.updateReserve().then(() => {
            //購入情報をセッションへ
            if (!this.req.session) throw this.req.__('common.error.property');
            this.req.session['complete'] = {
                updateReserve: this.purchaseModel.updateReserve,
                performance: this.purchaseModel.performance,
                input: this.purchaseModel.input,
                reserveSeats: this.purchaseModel.reserveSeats,
                reserveTickets: this.purchaseModel.reserveTickets,
                price: this.purchaseModel.getReserveAmount()
            };

            //購入セッション削除
            delete this.req.session['purchase'];

            //購入完了情報を返す
            return this.res.json({
                err: null,
                redirect: false,
                result: this.req.session['complete'].updateReserve,
                type: null
            });
        }, (err) => {
            //購入完了情報を返す
            return this.res.json({
                err: (err.error) ? err.error.message : err.message,
                redirect: (err.error) ? false : true,
                result: null,
                type: (err.type) ? err.type : null,
            });
        });
    }






}
