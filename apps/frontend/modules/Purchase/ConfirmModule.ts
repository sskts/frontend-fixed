
import * as COA from '@motionpicture/coa-service';
import * as express from 'express';
import * as moment from 'moment';
import * as MP from '../../../../libs/MP';
import * as PurchaseSession from '../../models/Purchase/PurchaseModel';

/**
 * 購入確認
 * @namespace
 */
namespace ConfirmModule {
    /**
     * 購入者内容確認
     * @function
     */
    export function index(req: express.Request, res: express.Response, next: express.NextFunction): void {
        if (!req.session) return next(req.__('common.error.property'));
        const purchaseModel = new PurchaseSession.PurchaseModel((<any>req.session).purchase);
        if (!purchaseModel.accessAuth(PurchaseSession.PurchaseModel.CONFIRM_STATE)) return next(new Error(req.__('common.error.access')));
        if (!purchaseModel.transactionMP) return next(new Error(req.__('common.error.property')));

        //購入者内容確認表示
        res.locals.gmoTokenObject = (purchaseModel.gmo) ? purchaseModel.gmo : null;
        res.locals.input = purchaseModel.input;
        res.locals.performance = purchaseModel.performance;
        res.locals.reserveSeats = purchaseModel.reserveSeats;
        res.locals.reserveTickets = purchaseModel.reserveTickets;
        res.locals.step = PurchaseSession.PurchaseModel.CONFIRM_STATE;
        res.locals.price = purchaseModel.getReserveAmount();
        res.locals.updateReserve = null;
        res.locals.error = null;
        res.locals.transactionId = purchaseModel.transactionMP._id;

        //セッション更新
        if (!req.session) return next(req.__('common.error.property'));
        (<any>req.session).purchase = purchaseModel.formatToSession();

        return res.render('purchase/confirm');

    }

    /**
     * 座席本予約
     * @function
     */
    async function updateReserve(req: express.Request, purchaseModel: PurchaseSession.PurchaseModel): Promise<void> {
        if (!purchaseModel.performance) throw new Error(req.__('common.error.property'));
        if (!purchaseModel.reserveSeats) throw new Error(req.__('common.error.property'));
        if (!purchaseModel.input) throw new Error(req.__('common.error.property'));
        if (!purchaseModel.transactionMP) throw Error(req.__('common.error.property'));
        if (!purchaseModel.expired) throw Error(req.__('common.error.property'));
        if (!req.session) throw Error(req.__('common.error.property'));
        //購入期限切れ
        const minutes = 5;
        if (purchaseModel.expired < moment().add(minutes, 'minutes').unix()) {
            //購入セッション削除
            delete (<any>req.session).purchase;
            throw {
                error: new Error(req.__('common.error.expire')),
                type: 'expired'
            };
        }

        const performance = purchaseModel.performance;
        const reserveSeats = purchaseModel.reserveSeats;
        const input = purchaseModel.input;

        try {
            // COA本予約
            purchaseModel.updateReserve = await COA.updateReserveInterface.call({
                theater_code: performance.attributes.theater._id,
                date_jouei: performance.attributes.day,
                title_code: performance.attributes.film.coa_title_code,
                title_branch_num: performance.attributes.film.coa_title_branch_num,
                time_begin: performance.attributes.time_start,
                tmp_reserve_num: reserveSeats.tmp_reserve_num,
                reserve_name: `${input.last_name_hira}　${input.first_name_hira}`,
                reserve_name_jkana: `${input.last_name_hira}　${input.first_name_hira}`,
                tel_num: input.tel_num,
                mail_addr: input.mail_addr,
                reserve_amount: purchaseModel.getReserveAmount(),
                list_ticket: purchaseModel.getTicketList()
            });
            console.log('COA本予約', purchaseModel.updateReserve);
        } catch (err) {
            throw {
                error: new Error(err.message),
                type: 'updateReserve'
            };
        }

        // MP購入者情報登録
        await MP.ownersAnonymous.call({
            transactionId: purchaseModel.transactionMP._id,
            name_first: input.first_name_hira,
            name_last: input.last_name_hira,
            tel: input.tel_num,
            email: input.mail_addr
        });
        console.log('MP購入者情報登録');

        // MP照会情報登録
        await MP.transactionsEnableInquiry.call({
            transactionId: purchaseModel.transactionMP._id,
            inquiry_theater: purchaseModel.performance.attributes.theater._id,
            inquiry_id: purchaseModel.updateReserve.reserve_num,
            inquiry_pass: purchaseModel.input.tel_num
        });
        console.log('MP照会情報登録');

        // MPメール登録
        await MP.addEmail.call({
            transactionId: purchaseModel.transactionMP._id,
            from: 'noreply@localhost',
            to: purchaseModel.input.mail_addr,
            subject: '購入完了',
            content: `購入完了\n
この度はご購入いただき誠にありがとうございます。
購入番号 ${purchaseModel.updateReserve.reserve_num}`
        });
        console.log('MPメール登録');

        // MP取引成立
        await MP.transactionClose.call({
            transactionId: purchaseModel.transactionMP._id
        });
        console.log('MP取引成立');
    }

    /**
     * 購入確定
     * @function
     */
    export function purchase(req: express.Request, res: express.Response, next: express.NextFunction): void {
        if (!req.session) return next(req.__('common.error.property'));
        const purchaseModel = new PurchaseSession.PurchaseModel((<any>req.session).purchase);
        if (!purchaseModel.transactionMP) return next(new Error(req.__('common.error.property')));

        //取引id確認
        if (req.body.transaction_id !== purchaseModel.transactionMP._id) return next(new Error(req.__('common.error.access')));

        updateReserve(req, purchaseModel).then(
            () => {
                //購入情報をセッションへ
                if (!req.session) throw req.__('common.error.property');
                (<any>req.session).complete = {
                    updateReserve: purchaseModel.updateReserve,
                    performance: purchaseModel.performance,
                    input: purchaseModel.input,
                    reserveSeats: purchaseModel.reserveSeats,
                    reserveTickets: purchaseModel.reserveTickets,
                    price: purchaseModel.getReserveAmount()
                };

                //購入セッション削除
                delete (<any>req.session).purchase;

                //購入完了情報を返す
                return res.json({
                    err: null,
                    redirect: false,
                    result: (<any>req.session).complete.updateReserve,
                    type: null
                });
            },
            (err) => {
                //購入完了情報を返す
                return res.json({
                    err: (err.error) ? err.error.message : err.message,
                    redirect: (err.error) ? false : true,
                    result: null,
                    type: (err.type) ? err.type : null
                });
            }
        );
    }
}

export default ConfirmModule;
