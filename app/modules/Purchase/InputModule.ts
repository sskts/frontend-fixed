/**
 * 購入情報入力
 * @namespace Purchase.InputModule
 */

import * as GMO from '@motionpicture/gmo-service';
import * as sasaki from '@motionpicture/sskts-api-nodejs-client';
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
 * @function render
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
export async function render(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (req.session === undefined) throw ErrorUtilModule.ErrorType.Property;
        if (req.session.purchase === undefined) throw ErrorUtilModule.ErrorType.Expire;
        const purchaseModel = new PurchaseModel(req.session.purchase);
        const authModel = new AuthModel(req.session.auth);

        if (purchaseModel.isExpired()) throw ErrorUtilModule.ErrorType.Expire;
        if (!purchaseModel.accessAuth(PurchaseModel.INPUT_STATE)) {
            throw ErrorUtilModule.ErrorType.Expire;
        }
        if (purchaseModel.transaction === null) throw ErrorUtilModule.ErrorType.Property;

        //購入者情報入力表示
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
        purchaseModel.save(req.session);

        res.locals.error = null;
        res.locals.gmoError = null;
        res.locals.GMO_ENDPOINT = process.env.GMO_ENDPOINT;
        res.locals.purchaseModel = purchaseModel;
        res.locals.step = PurchaseModel.INPUT_STATE;
        if (authModel.isMember()) {
            res.render('purchase/member/input', { layout: 'layouts/purchase/layout' });
        } else {
            res.render('purchase/input', { layout: 'layouts/purchase/layout' });
        }
    } catch (err) {
        const error = (err instanceof Error) ? err : new ErrorUtilModule.AppError(err, undefined);
        next(error);
    }
}

/**
 * 購入者情報入力完了
 * @memberof Purchase.InputModule
 * @function purchaserInformationRegistration
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
export async function purchaserInformationRegistration(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (req.session === undefined) {
        next(new ErrorUtilModule.AppError(ErrorUtilModule.ErrorType.Property, undefined));

        return;
    }
    const authModel = new AuthModel(req.session.auth);
    const options = {
        endpoint: (<string>process.env.SSKTS_API_ENDPOINT),
        auth: authModel.create()
    };
    const purchaseModel = new PurchaseModel(req.session.purchase);
    try {
        if (req.session.purchase === undefined) throw ErrorUtilModule.ErrorType.Expire;
        if (purchaseModel.isExpired()) throw ErrorUtilModule.ErrorType.Expire;
        if (purchaseModel.transaction === null) throw ErrorUtilModule.ErrorType.Property;
        if (purchaseModel.reserveTickets === null) throw ErrorUtilModule.ErrorType.Property;
        //取引id確認
        if (req.body.transactionId !== purchaseModel.transaction.id) {
            throw ErrorUtilModule.ErrorType.Access;
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
        // クレジットカード処理
        await creditCardProsess(req, purchaseModel);

        await sasaki.service.transaction.placeOrder(options).setCustomerContact({
            transactionId: purchaseModel.transaction.id,
            contact: {
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
        if (err === ErrorUtilModule.ErrorType.Validation) {
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
        const error = (err instanceof Error) ? err : new ErrorUtilModule.AppError(err, undefined);
        next(error);
    }
}

/**
 * 購入者情報入力完了(会員)
 * @memberof Purchase.InputModule
 * @function purchaserInformationRegistrationOfMember
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
export async function purchaserInformationRegistrationOfMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (req.session === undefined) {
        next(new ErrorUtilModule.AppError(ErrorUtilModule.ErrorType.Property, undefined));

        return;
    }
    const authModel = new AuthModel(req.session.auth);
    const options = {
        endpoint: (<string>process.env.SSKTS_API_ENDPOINT),
        auth: authModel.create()
    };
    const purchaseModel = new PurchaseModel(req.session.purchase);

    try {
        if (!authModel.isMember()) throw ErrorUtilModule.ErrorType.Access;
        if (req.session.purchase === undefined) throw ErrorUtilModule.ErrorType.Expire;
        if (purchaseModel.isExpired()) throw ErrorUtilModule.ErrorType.Expire;
        if (purchaseModel.transaction === null) throw ErrorUtilModule.ErrorType.Property;
        if (purchaseModel.reserveTickets === null) throw ErrorUtilModule.ErrorType.Property;
        if (purchaseModel.profile === null) throw ErrorUtilModule.ErrorType.Property;
        //取引id確認
        if (req.body.transactionId !== purchaseModel.transaction.id) {
            throw ErrorUtilModule.ErrorType.Access;
        }
        //バリデーション
        InputForm(req);
        const validationResult = await req.getValidationResult();
        if (!validationResult.isEmpty()) {
            res.locals.error = validationResult.mapped();
            res.locals.gmoError = null;
            res.locals.GMO_ENDPOINT = process.env.GMO_ENDPOINT;
            res.locals.purchaseModel = purchaseModel;
            res.locals.step = PurchaseModel.INPUT_STATE;
            res.render('purchase/member/input', { layout: 'layouts/purchase/layout' });

            return;
        }
        const creditCardRegistration = (<boolean | undefined>req.body.creditCardRegistration);
        if (creditCardRegistration !== undefined && creditCardRegistration) {
            if (purchaseModel.creditCards.length > 0) {
                // クレジットカード削除
                await sasaki.service.person(options).deleteCreditCard({
                    personId: 'me',
                    cardSeq: purchaseModel.creditCards[0].cardSeq
                });
            }
            purchaseModel.gmo = JSON.parse(req.body.gmoTokenObject);
            // クレジットカード登録
            const card = await sasaki.service.person(options).addCreditCard({
                personId: 'me',
                creditCard: {
                    token: (<IGMO>purchaseModel.gmo).token
                }
            });
            purchaseModel.creditCards.push(card);
            log('クレジットカード登録');
        }

        // クレジットカード処理
        await creditCardProsess(req, purchaseModel);

        await sasaki.service.transaction.placeOrder(options).setCustomerContact({
            transactionId: purchaseModel.transaction.id,
            contact: {
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
        if (err === ErrorUtilModule.ErrorType.Validation) {
            res.locals.error = { gmo: { parm: 'gmo', msg: req.__('common.error.gmo'), value: '' } };
            res.locals.GMO_ENDPOINT = process.env.GMO_ENDPOINT;
            res.locals.purchaseModel = purchaseModel;
            res.locals.step = PurchaseModel.INPUT_STATE;
            res.render('purchase/member/input', { layout: 'layouts/purchase/layout' });

            return;
        }
        const error = (err instanceof Error) ? err : new ErrorUtilModule.AppError(err, undefined);
        next(error);
    }
}

/**
 * クレジットカード処理
 * @function creditCardProsess
 * @param {Request} req
 * @param {PurchaseModel} purchaseModel
 */
async function creditCardProsess(req: Request, purchaseModel: PurchaseModel): Promise<void> {
    if (req.session === undefined) throw ErrorUtilModule.ErrorType.Property;
    const authModel = new AuthModel(req.session.auth);
    const options = {
        endpoint: (<string>process.env.SSKTS_API_ENDPOINT),
        auth: authModel.create()
    };
    if (purchaseModel.transaction === null) throw ErrorUtilModule.ErrorType.Property;
    if (purchaseModel.creditCardAuthorization !== null) {
        const cancelCreditCardAuthorizationArgs = {
            transactionId: purchaseModel.transaction.id,
            authorizationId: purchaseModel.creditCardAuthorization.id
        };
        try {
            await sasaki.service.transaction.placeOrder(options).cancelCreditCardAuthorization(cancelCreditCardAuthorizationArgs);
        } catch (err) {
            logger.error(
                'SSKTS-APP:InputModule.submit cancelCreditCardAuthorization',
                `in: ${cancelCreditCardAuthorizationArgs}`,
                `err: ${err}`
            );
            throw ErrorUtilModule.ErrorType.Validation;
        }
        log('GMOオーソリ削除');
    }
    if (purchaseModel.getReserveAmount() > 0) {
        // クレジット決済
        purchaseModel.createOrderId();
        purchaseModel.save(req.session);
        let creditCard: sasaki.factory.paymentMethod.paymentCard.creditCard.IUncheckedCardTokenized
            | sasaki.factory.paymentMethod.paymentCard.creditCard.IUnauthorizedCardOfMember;
        if (purchaseModel.creditCards.length > 0) {
            // 登録されたクレジットカード
            creditCard = {
                memberId: 'me',
                cardSeq: Number(purchaseModel.creditCards[0].cardSeq)
            };
        } else {
            // 入力されたクレジットカード
            purchaseModel.gmo = JSON.parse(req.body.gmoTokenObject);
            creditCard = {
                token: (<IGMO>purchaseModel.gmo).token
            };
        }
        const createCreditCardAuthorizationArgs = {
            transactionId: purchaseModel.transaction.id,
            orderId: (<string>purchaseModel.orderId),
            amount: purchaseModel.getReserveAmount(),
            method: GMO.utils.util.Method.Lump,
            creditCard: creditCard
        };
        try {
            purchaseModel.creditCardAuthorization = await sasaki.service.transaction.placeOrder(options)
                .createCreditCardAuthorization(createCreditCardAuthorizationArgs);
        } catch (err) {
            log(createCreditCardAuthorizationArgs);
            logger.error(
                'SSKTS-APP:InputModule.submit createCreditCardAuthorization',
                `in: ${createCreditCardAuthorizationArgs}`,
                `err: ${err}`
            );
            throw ErrorUtilModule.ErrorType.Validation;
        }
        log('GMOオーソリ追加');
    }
}
