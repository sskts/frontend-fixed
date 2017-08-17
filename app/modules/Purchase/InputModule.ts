/**
 * 購入情報入力
 * @namespace Purchase.InputModule
 */

import * as GMO from '@motionpicture/gmo-service';
import * as ssktsApi from '@motionpicture/sskts-api';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import InputForm from '../../forms/Purchase/InputForm';
import logger from '../../middlewares/logger';
import { AuthModel } from '../../models/Auth/AuthModel';
import { IGMO, PurchaseModel } from '../../models/Purchase/PurchaseModel';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';
const log = debug('SSKTS:Purchase.InputModule');

/**
 * 購入者情報入力
 * @memberof Purchase.InputModule
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
export async function index(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (req.session === undefined) throw ErrorUtilModule.ERROR_PROPERTY;
        if (req.session.purchase === undefined) throw ErrorUtilModule.ERROR_EXPIRE;
        const purchaseModel = new PurchaseModel(req.session.purchase);
        if (purchaseModel.isExpired()) throw ErrorUtilModule.ERROR_EXPIRE;
        if (!purchaseModel.accessAuth(PurchaseModel.INPUT_STATE)) {
            throw ErrorUtilModule.ERROR_EXPIRE;
        }
        if (purchaseModel.transaction === null) throw ErrorUtilModule.ERROR_PROPERTY;

        //購入者情報入力表示
        if (purchaseModel.isMember()) {
            log('会員情報取得');
            purchaseModel.profile = {
                familyName: '',
                givenName: '',
                email: '',
                emailConfirm: '',
                telephone: ''
            };
        }
        if (purchaseModel.profile !== null) {
            res.locals.input = purchaseModel.profile;
        } else {
            purchaseModel.profile = {
                familyName: '',
                givenName: '',
                email: '',
                emailConfirm: '',
                telephone: ''
            };
        }
        res.locals.error = null;
        res.locals.gmoError = null;
        res.locals.GMO_ENDPOINT = process.env.GMO_ENDPOINT;
        res.locals.purchaseModel = purchaseModel;
        res.locals.step = PurchaseModel.INPUT_STATE;
        res.render('purchase/input', { layout: 'layouts/purchase/layout' });

        return;

    } catch (err) {
        const error = (err instanceof Error)
            ? new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message)
            : new ErrorUtilModule.CustomError(err, undefined);
        next(error);

        return;
    }
}

/**
 * 購入者情報入力完了
 * @memberof Purchase.InputModule
 * @function submit
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
// tslint:disable-next-line:max-func-body-length
// tslint:disable-next-line:cyclomatic-complexity
export async function submit(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (req.session === undefined) {
        next(new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_PROPERTY, undefined));

        return;
    }
    try {
        if (req.session.purchase === undefined) throw ErrorUtilModule.ERROR_EXPIRE;
        const purchaseModel = new PurchaseModel(req.session.purchase);
        if (purchaseModel.isExpired()) throw ErrorUtilModule.ERROR_EXPIRE;
        if (purchaseModel.transaction === null) throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.reserveTickets === null) throw ErrorUtilModule.ERROR_PROPERTY;
        //取引id確認
        if (req.body.transactionId !== purchaseModel.transaction.id) {
            throw ErrorUtilModule.ERROR_ACCESS;
        }
        //バリデーション
        InputForm(req);
        const validationResult = await req.getValidationResult();
        if (!validationResult.isEmpty()) {
            purchaseModel.profile = req.body;
            res.locals.error = validationResult.mapped();
            res.locals.gmoError = null;
            res.locals.GMO_ENDPOINT = process.env.GMO_ENDPOINT;
            res.locals.purchaseModel = purchaseModel;
            res.locals.step = PurchaseModel.INPUT_STATE;
            res.render('purchase/input', { layout: 'layouts/purchase/layout' });

            return;
        }
        // 入力情報をセッションへ
        purchaseModel.profile = {
            familyName: req.body.familyName,
            givenName: req.body.givenName,
            email: req.body.email,
            emailConfirm: req.body.emailConfirm,
            telephone: req.body.telephone
        };
        if (purchaseModel.creditCardAuthorization !== null) {
            const cancelCreditCardAuthorizationArgs = {
                auth: new AuthModel(req.session.auth).create(),
                transactionId: purchaseModel.transaction.id,
                authorizationId: purchaseModel.creditCardAuthorization.id
            };
            try {
                await ssktsApi.service.transaction.placeOrder.cancelCreditCardAuthorization(cancelCreditCardAuthorizationArgs);
            } catch (err) {
                logger.error(
                    'SSKTS-APP:InputModule.submit cancelCreditCardAuthorization',
                    `in: ${cancelCreditCardAuthorizationArgs}`,
                    `err: ${err}`
                );
                throw ErrorUtilModule.ERROR_VALIDATION;
            }
            log('GMOオーソリ削除');
        }
        if (purchaseModel.getReserveAmount() > 0) {
            // クレジット決済
            res.locals.gmoError = null;
            purchaseModel.gmo = JSON.parse(req.body.gmoTokenObject);
            purchaseModel.createOrderId();
            purchaseModel.save(req.session);
            const createCreditCardAuthorizationArgs = {
                auth: new AuthModel(req.session.auth).create(),
                transactionId: purchaseModel.transaction.id,
                orderId: (<string>purchaseModel.orderId),
                amount: purchaseModel.getReserveAmount(),
                method: GMO.utils.util.Method.Lump,
                creditCard: {
                    token: (<IGMO>purchaseModel.gmo).token
                }
            };
            try {
                await ssktsApi.service.transaction.placeOrder.createCreditCardAuthorization(createCreditCardAuthorizationArgs);
            } catch (err) {
                log (createCreditCardAuthorizationArgs);
                logger.error(
                    'SSKTS-APP:InputModule.submit createCreditCardAuthorization',
                    `in: ${createCreditCardAuthorizationArgs}`,
                    `err: ${err}`
                );
                throw ErrorUtilModule.ERROR_VALIDATION;
            }
            log('CMOオーソリ追加');
        }

        await ssktsApi.service.transaction.placeOrder.setAgentProfile({
            auth: new AuthModel(req.session.auth).create(),
            transactionId: purchaseModel.transaction.id,
            profile: {
                familyName: purchaseModel.profile.familyName,
                givenName: purchaseModel.profile.givenName,
                email: purchaseModel.profile.email,
                telephone: purchaseModel.profile.telephone
            }
        });
        log('SSKTS購入者情報登録');

        // セッション更新
        purchaseModel.save(req.session);
        // 購入者内容確認へ
        res.redirect('/purchase/confirm');
    } catch (err) {
        if (err === ErrorUtilModule.ERROR_VALIDATION) {
            const purchaseModel = new PurchaseModel(req.session.purchase);
            purchaseModel.profile = {
                familyName: req.body.familyName,
                givenName: req.body.givenName,
                email: req.body.email,
                emailConfirm: req.body.emailConfirm,
                telephone: req.body.telephone
            };
            res.locals.error = { gmo: { parm: 'gmo', msg: req.__('common.error.gmo'), value: '' } };
            res.locals.GMO_ENDPOINT = process.env.GMO_ENDPOINT;
            res.locals.purchaseModel = purchaseModel;
            res.locals.step = PurchaseModel.INPUT_STATE;
            res.render('purchase/input', { layout: 'layouts/purchase/layout' });

            return;
        }
        const error = (err instanceof Error)
            ? new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message)
            : new ErrorUtilModule.CustomError(err, undefined);
        next(error);
    }
}
