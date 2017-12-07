/**
 * 購入確認
 * @namespace Purchase.ConfirmModule
 */
import * as mvtkReserve from '@motionpicture/mvtk-reserve-service';
import * as sasaki from '@motionpicture/sskts-api-nodejs-client';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as HTTPStatus from 'http-status';
import * as moment from 'moment';
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
 * @returns {Promise<mvtkReserve.services.seat.seatInfoSync.ISeatInfoSyncResult>}
 */
async function reserveMvtk(purchaseModel: PurchaseModel): Promise<mvtkReserve.services.seat.seatInfoSync.ISeatInfoSyncResult> {
    // 購入管理番号情報
    const seatInfoSyncIn = purchaseModel.getMvtkSeatInfoSync();
    if (seatInfoSyncIn === null) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
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
        if (seatInfoSyncIn === null) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);

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
    mvtk: null | mvtkReserve.services.seat.seatInfoSync.ISeatInfoSyncResult;
    order: null | sasaki.factory.order.IOrder;
    mail: null | any;
    cognito: null | any;
    complete: null | any;
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
        mvtk: null,
        order: null,
        mail: null,
        cognito: null,
        complete: null
    };
    try {
        if (req.session === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        const authModel = new AuthModel(req.session.auth);
        const options = {
            endpoint: (<string>process.env.SSKTS_API_ENDPOINT),
            auth: authModel.create()
        };
        const purchaseModel = new PurchaseModel(req.session.purchase);
        if (purchaseModel.transaction === null
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
        if (purchaseModel.mvtk !== null && mvtkTickets.length > 0) {
            purchaseResult.mvtk = await reserveMvtk(purchaseModel);
            log('Mvtk payment');
        }

        purchaseResult.order = await sasaki.service.transaction.placeOrder(options).confirm({
            transactionId: purchaseModel.transaction.id
        });
        log('Order confirmation');

        //購入情報をセッションへ
        const complete = {
            transaction: purchaseModel.transaction,
            individualScreeningEvent: purchaseModel.individualScreeningEvent,
            profile: purchaseModel.profile,
            seatReservationAuthorization: purchaseModel.seatReservationAuthorization,
            reserveTickets: purchaseModel.reserveTickets
        };
        req.session.complete = complete;
        purchaseResult.complete = complete;
        if (process.env.VIEW_TYPE !== UtilModule.VIEW.Fixed) {
            try {
                purchaseResult.mail = await sendMail(req, res, purchaseModel, authModel);
                log('Mail notification');
            } catch (err) {
                log('Mail registration failure', err);
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
                reservationRecord.orders.push(purchaseResult.order);
                log('before reservationRecord order', reservationRecord.orders.length);
                (<sasaki.factory.order.IOrder[]>reservationRecord.orders).forEach((order, index) => {
                    const endDate = moment(order.acceptedOffers[0].itemOffered.reservationFor.endDate).unix();
                    const limitDate = moment().subtract(1, 'month').unix();
                    if (endDate < limitDate) reservationRecord.orders.splice(index, 1);
                });
                log('after reservationRecord order', reservationRecord.orders.length);
                purchaseResult.cognito = await AwsCognitoService.updateRecords({
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
 * メール送信
 * @function sendMail
 * @param {Request} req
 * @param {Response} res
 * @param {PurchaseModel} purchaseModel
 * @param {AuthModel} authModel
 */
async function sendMail(
    req: Request,
    res: Response,
    purchaseModel: PurchaseModel,
    authModel: AuthModel
): Promise<sasaki.factory.order.IOrder> {
    if (purchaseModel.transaction === null
        || purchaseModel.individualScreeningEvent === null
        || purchaseModel.profile === null
        || purchaseModel.seatReservationAuthorization === null
        || purchaseModel.seatReservationAuthorization.result === undefined) {
        throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
    }
    const options = {
        endpoint: (<string>process.env.SSKTS_API_ENDPOINT),
        auth: authModel.create()
    };
    const theater = await sasaki.service.place(options).findMovieTheater({
        branchCode: purchaseModel.individualScreeningEvent.coaInfo.theaterCode
    });
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
    log('Retrieve mail template');
    const sender = 'noreply@ticket-cinemasunshine.com';
    // tslint:disable-next-line:no-unnecessary-local-variable
    const sendEmailNotification = await sasaki.service.transaction.placeOrder(options).sendEmailNotification({
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

    return sendEmailNotification;
}

/**
 * メール再送信
 * @memberof Purchase.resendMail
 * @function resendMail
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function resendMail(req: Request, res: Response): Promise<void> {
    try {
        if (req.session === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        if (req.session.complete === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Expire);
        const authModel = new AuthModel(req.session.auth);
        const purchaseModel = new PurchaseModel(req.session.complete);
        await sendMail(req, res, purchaseModel, authModel);
        res.json();
    } catch (err) {
        log('resendMail error', err);
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
