
import * as express from 'express';
import * as moment from 'moment';
import * as MP from '../../../../libs/MP';
import * as PurchaseSession from '../../models/Purchase/PurchaseModel';

/**
 * 取引
 * @namespace
 */
namespace TransactionModule {
    /**
     * 取引開始
     * @function
     */
    export function start(req: express.Request, res: express.Response, next: express.NextFunction): void {
        if (!req.params || !req.params.id) return next(new Error(req.__('common.error.access')));
        if (!req.session) return next(req.__('common.error.property'));
        // tslint:disable-next-line:no-string-literal
        const purchaseModel = new PurchaseSession.PurchaseModel(req.session['purchase']);
        if (purchaseModel.transactionMP && purchaseModel.reserveSeats) {

            //重複確認へ
            return res.redirect('/purchase/' + req.params.id + '/overlap');
        }

        transactionStart(purchaseModel).then(
            () => {
                if (!req.session) return next(req.__('common.error.property'));
                // tslint:disable-next-line:no-string-literal
                delete req.session['purchase'];
                //セッション更新
                // tslint:disable-next-line:no-string-literal
                req.session['purchase'] = purchaseModel.formatToSession();
                //座席選択へ
                return res.redirect('/purchase/seat/' + req.params.id + '/');
            },
            (err) => {
                return next(new Error(err.message));
            }
        );
    }

    /**
     * 取引開始
     * @function
     */
    async function transactionStart(purchaseModel: PurchaseSession.PurchaseModel): Promise<void> {
        // 取引開始
        const minutes = 30;
        purchaseModel.expired = moment().add('minutes', minutes).unix();
        purchaseModel.transactionMP = await MP.transactionStart.call({
            expired_at: purchaseModel.expired
        });
        console.log('MP取引開始', purchaseModel.transactionMP.attributes.owners);
    }
}

export default TransactionModule;
