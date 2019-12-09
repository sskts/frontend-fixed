/**
 * 購入確認
 * @namespace Purchase.ConfirmModule
 */
import * as cinerinoService from '@cinerino/api-nodejs-client';
import * as mvtkReserve from '@motionpicture/mvtk-reserve-service';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as HTTPStatus from 'http-status';
import { getApiOption } from '../../functions';
import logger from '../../middlewares/logger';
import { AppError, ErrorType, PurchaseModel } from '../../models';

const log = debug('SSKTS:Purchase.ConfirmModule');

/**
 * 購入者内容確認
 * @memberof Purchase.ConfirmModule
 * @function render
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
export async function render(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (req.session === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        const purchaseModel = new PurchaseModel(req.session.purchase);
        if (purchaseModel.isExpired()) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Expire);
        if (!purchaseModel.accessAuth(PurchaseModel.CONFIRM_STATE)) {
            throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Access);
        }

        //購入者内容確認表示
        res.locals.updateReserve = undefined;
        res.locals.error = undefined;
        res.locals.purchaseModel = purchaseModel;
        res.locals.step = PurchaseModel.CONFIRM_STATE;
        //セッション更新
        purchaseModel.save(req.session);
        res.render('purchase/confirm', { layout: 'layouts/purchase/layout' });
    } catch (err) {
        next(err);
    }
}

/**
 * ムビチケ決済
 * @memberof Purchase.ConfirmModule
 * @function reserveMvtk
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {Promise<mvtkReserve.services.seat.seatInfoSync.ISeatInfoSyncResult>}
 */
async function reserveMvtk(purchaseModel: PurchaseModel): Promise<mvtkReserve.services.seat.seatInfoSync.ISeatInfoSyncResult> {
    // 購入管理番号情報
    const seatInfoSyncIn = purchaseModel.getMvtkSeatInfoSync();
    if (seatInfoSyncIn === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
    let seatInfoSyncInResult: mvtkReserve.services.seat.seatInfoSync.ISeatInfoSyncResult;
    try {
        seatInfoSyncInResult = await mvtkReserve.services.seat.seatInfoSync.seatInfoSync(seatInfoSyncIn);
        if (seatInfoSyncInResult.zskyykResult !== mvtkReserve.services.seat.seatInfoSync.ReservationResult.Success) {
            throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.ExternalModule, 'reservationResult is not success');
        }
    } catch (err) {
        log('Mvtk failure', err);
        logger.error('SSKTS-APP:ConfirmModule.reserveMvtk', seatInfoSyncIn, err);
        throw err;
    }
    log('Mvtk successful');
    // log('GMO', purchaseModel.getReserveAmount());
    // log('MVTK', purchaseModel.getMvtkPrice());
    // log('FULL', purchaseModel.getPrice());

    return seatInfoSyncInResult;
}

/**
 * ムビチケ決済取り消し
 * @memberof Purchase.ConfirmModule
 * @function cancelMvtk
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function cancelMvtk(req: Request, res: Response): Promise<void> {
    try {
        if (req.session === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        const purchaseModel = new PurchaseModel(req.session.purchase);
        // 購入管理番号情報
        const seatInfoSyncIn = purchaseModel.getMvtkSeatInfoSync({
            deleteFlag: mvtkReserve.services.seat.seatInfoSync.DeleteFlag.True
        });
        //セッション削除
        delete req.session.purchase;
        delete req.session.mvtk;
        if (seatInfoSyncIn === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);

        try {
            const seatInfoSyncInResult = await mvtkReserve.services.seat.seatInfoSync.seatInfoSync(seatInfoSyncIn);
            if (seatInfoSyncInResult.zskyykResult !== mvtkReserve.services.seat.seatInfoSync.ReservationResult.CancelSuccess) {
                throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.ExternalModule, 'reservationResult is not cancelSuccess');
            }
            res.json({ isSuccess: true });
            log('Mvtk remove');
        } catch (err) {
            logger.error('SSKTS-APP:ConfirmModule.cancelMvtk', seatInfoSyncIn, err);
            throw err;
        }
    } catch (err) {
        res.json({ isSuccess: false });
    }
}

/**
 * 購入結果
 * @interface IPurchaseResult
 */
interface IPurchaseResult {
    mvtk: undefined | mvtkReserve.services.seat.seatInfoSync.ISeatInfoSyncResult;
    order: undefined | cinerinoService.factory.transaction.placeOrder.IResult;
    mail: undefined | any;
    cognito: undefined | any;
    complete: undefined | any;
}

/**
 * 購入確定
 * @memberof Purchase.ConfirmModule
 * @function purchase
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 * @description フロー(本予約成功、本予約失敗、購入期限切れ)
 */
// tslint:disable-next-line:max-func-body-length
export async function purchase(req: Request, res: Response): Promise<void> {
    const purchaseResult: IPurchaseResult = {
        mvtk: undefined,
        order: undefined,
        mail: undefined,
        cognito: undefined,
        complete: undefined
    };
    try {
        if (req.session === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        const options = getApiOption(req);
        const purchaseModel = new PurchaseModel(req.session.purchase);
        if (purchaseModel.transaction === undefined
            || req.body.transactionId !== purchaseModel.transaction.id) {
            throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        }
        //購入期限切れ
        if (purchaseModel.isExpired()) {
            delete req.session.purchase;
            throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Expire);
        }
        const mvtkTickets = purchaseModel.reserveTickets.filter((ticket) => {
            return (ticket.mvtkNum !== '');
        });
        // ムビチケ使用
        if (purchaseModel.mvtk !== undefined && mvtkTickets.length > 0) {
            purchaseResult.mvtk = await reserveMvtk(purchaseModel);
            log('Mvtk payment');
        }

        purchaseResult.order = await new cinerinoService.service.transaction.PlaceOrder4sskts(options)
            .confirm({
                id: purchaseModel.transaction.id,
                sendEmailMessage: false
            });
        log('Order confirmation');

        //購入情報をセッションへ
        const complete = {
            transaction: purchaseModel.transaction,
            screeningEvent: purchaseModel.screeningEvent,
            profile: purchaseModel.profile,
            seatReservationAuthorization: purchaseModel.seatReservationAuthorization,
            reserveTickets: purchaseModel.reserveTickets
        };
        req.session.complete = complete;
        purchaseResult.complete = complete;
        // 購入セッション削除
        delete req.session.purchase;
        // 購入完了情報を返す
        res.json({ result: purchaseResult });
    } catch (err) {
        log('purchase error', err);
        if (err.code !== undefined) {
            res.status(err.code);
        } else {
            res.status(httpStatus.BAD_REQUEST);
        }
        res.json({ error: err });
    }
}

/**
 * 完了情報取得
 * @memberof Purchase.ConfirmModule
 * @function getCompleteData
 * @param {Request} req
 * @param {Response} res
 * @returns {void}
 */
export function getCompleteData(req: Request, res: Response): void {
    try {
        if (req.session === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        if (req.session.complete === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Expire);
        res.json({ result: req.session.complete });
    } catch (err) {
        log('getCompleteData error', err);
        if (err.code !== undefined) {
            res.status(err.code);
        } else {
            res.status(httpStatus.BAD_REQUEST);
        }
        res.json({ error: err });
    }
}
