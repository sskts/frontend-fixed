/**
 * 購入確認
 * @namespace Purchase.ConfirmModule
 */
import * as mvtkReserve from '@motionpicture/mvtk-reserve-service';
import * as sasaki from '@motionpicture/sskts-api-nodejs-client';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as HTTPStatus from 'http-status';
import logger from '../../middlewares/logger';
import { AuthModel } from '../../models/Auth/AuthModel';
import { PurchaseModel } from '../../models/Purchase/PurchaseModel';
import * as AwsCognitoService from '../../service/AwsCognitoService';
import { AppError, ErrorType } from '../Util/ErrorUtilModule';
import * as UtilModule from '../Util/UtilModule';
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
        res.locals.updateReserve = null;
        res.locals.error = null;
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
 * @returns {Promise<void>}
 */
async function reserveMvtk(purchaseModel: PurchaseModel): Promise<void> {
    // 購入管理番号情報
    const seatInfoSyncIn = purchaseModel.getMvtkSeatInfoSync();
    log('購入管理番号情報', seatInfoSyncIn);
    if (seatInfoSyncIn === null) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
    try {
        const seatInfoSyncInResult = await mvtkReserve.services.seat.seatInfoSync.seatInfoSync(seatInfoSyncIn);
        if (seatInfoSyncInResult.zskyykResult !== mvtkReserve.services.seat.seatInfoSync.ReservationResult.Success) {
            throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.ExternalModule, 'reservationResult is not success');
        }
    } catch (err) {
        log('MVTKムビチケ着券失敗', err);
        logger.error('SSKTS-APP:ConfirmModule.reserveMvtk', seatInfoSyncIn, err);
        throw err;
    }
    log('MVTKムビチケ着券成功');
    // log('GMO', purchaseModel.getReserveAmount());
    // log('MVTK', purchaseModel.getMvtkPrice());
    // log('FULL', purchaseModel.getPrice());
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
        log('購入管理番号情報', seatInfoSyncIn);
        //セッション削除
        delete req.session.purchase;
        delete req.session.mvtk;
        if (seatInfoSyncIn === null) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);

        try {
            const seatInfoSyncInResult = await mvtkReserve.services.seat.seatInfoSync.seatInfoSync(seatInfoSyncIn);
            if (seatInfoSyncInResult.zskyykResult !== mvtkReserve.services.seat.seatInfoSync.ReservationResult.CancelSuccess) {
                throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.ExternalModule, 'reservationResult is not cancelSuccess');
            }
            res.json({ isSuccess: true });
            log('MVTKムビチケ着券削除');
        } catch (err) {
            logger.error('SSKTS-APP:ConfirmModule.cancelMvtk', seatInfoSyncIn, err);
            throw err;
        }
    } catch (err) {
        res.json({ isSuccess: false });
    }
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
    try {
        if (req.session === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        const authModel = new AuthModel(req.session.auth);
        const options = {
            endpoint: (<string>process.env.SSKTS_API_ENDPOINT),
            auth: authModel.create()
        };
        const purchaseModel = new PurchaseModel(req.session.purchase);
        if (purchaseModel.transaction === null
            || purchaseModel.individualScreeningEvent === null
            || purchaseModel.profile === null
            || purchaseModel.seatReservationAuthorization === null
            || purchaseModel.seatReservationAuthorization.result === undefined
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
        log('ムビチケ券', mvtkTickets);
        // ムビチケ使用
        if (purchaseModel.mvtk !== null && mvtkTickets.length > 0) {
            await reserveMvtk(purchaseModel);
            log('ムビチケ決済');
        }

        const order = await sasaki.service.transaction.placeOrder(options).confirm({
            transactionId: purchaseModel.transaction.id
        });
        log('注文確定', order);

        //購入情報をセッションへ
        req.session.complete = {
            individualScreeningEvent: purchaseModel.individualScreeningEvent,
            profile: purchaseModel.profile,
            seatReservationAuthorization: purchaseModel.seatReservationAuthorization,
            reserveTickets: purchaseModel.reserveTickets
        };
        if (process.env.VIEW_TYPE !== UtilModule.VIEW.Fixed) {
            try {
                const theater = await sasaki.service.place(options).findMovieTheater({
                    branchCode: purchaseModel.individualScreeningEvent.coaInfo.theaterCode
                });
                log('劇場', theater.telephone);
                const content = await UtilModule.getEmailTemplate(
                    res,
                    `email/complete/${req.__('lang')}`,
                    {
                        purchaseModel: purchaseModel,
                        theater: theater,
                        domain: req.headers.host,
                        layout: false
                    }
                );
                log('メールテンプレート取得');
                const sender = 'noreply@ticket-cinemasunshine.com';
                await sasaki.service.transaction.placeOrder(options).sendEmailNotification({
                    transactionId: purchaseModel.transaction.id,
                    emailMessageAttributes: {
                        sender: {
                            name: purchaseModel.transaction.seller.name,
                            email: sender
                        },
                        toRecipient: {
                            name: `${purchaseModel.profile.emailConfirm} ${purchaseModel.profile.givenName}`,
                            email: purchaseModel.profile.email
                        },
                        about: `${purchaseModel.individualScreeningEvent.superEvent.location.name.ja} 購入完了`,
                        text: content
                    }
                });
                log('メール通知');
            } catch (err) {
                log('メール登録失敗', err);
            }
        }
        // Cognitoへ登録
        const awsCognitoIdentityId = req.session.awsCognitoIdentityId;
        if (awsCognitoIdentityId !== undefined) {
            const cognitoCredentials = AwsCognitoService.authenticateWithTerminal(awsCognitoIdentityId);
            try {
                const reservationRecord = await AwsCognitoService.getRecords({
                    datasetName: 'reservation',
                    credentials: cognitoCredentials
                });
                if (reservationRecord.orders === undefined) {
                    reservationRecord.orders = [];
                }
                reservationRecord.orders.push(order);
                await AwsCognitoService.updateRecords({
                    datasetName: 'reservation',
                    value: reservationRecord,
                    credentials: cognitoCredentials
                });
            } catch (err) {
                log('AwsCognitoService.updateRecords', err);
            }
        }
        // 購入セッション削除
        delete req.session.purchase;
        // 購入完了情報を返す
        res.json({ err: null, result: req.session.complete });
    } catch (err) {
        log('ERROR', err);
        const msg: string = (err.errorType === ErrorType.Expire) ? req.__('common.error.expire')
            : (err.code === HTTPStatus.BAD_REQUEST) ? req.__('common.error.badRequest')
                : err.message;
        res.json({ err: msg, result: null });
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
        res.json({ err: null, result: req.session.complete });
    } catch (err) {
        const msg: string = (err.errorType === ErrorType.Expire) ? req.__('common.error.expire')
            : (err.code === HTTPStatus.BAD_REQUEST) ? req.__('common.error.badRequest')
                : err.message;
        res.json({ err: msg, result: null });
    }
}
