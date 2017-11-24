/**
 * 購入情報入力
 * @namespace Purchase.InputModule
 */

import * as GMO from '@motionpicture/gmo-service';
import * as sasaki from '@motionpicture/sskts-api-nodejs-client';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import { PhoneNumberUtil } from 'google-libphonenumber';
import * as HTTPStatus from 'http-status';
import InputForm from '../../forms/Purchase/InputForm';
import { AuthModel } from '../../models/Auth/AuthModel';
import { IGMO, PurchaseModel } from '../../models/Purchase/PurchaseModel';
import * as AwsCognitoService from '../../service/AwsCognitoService';
import { AppError, ErrorType } from '../Util/ErrorUtilModule';
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
        if (req.session === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        const purchaseModel = new PurchaseModel(req.session.purchase);
        const authModel = new AuthModel(req.session.auth);

        if (purchaseModel.isExpired()) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Expire);
        if (!purchaseModel.accessAuth(PurchaseModel.INPUT_STATE)) {
            throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Access);
        }

        //購入者情報入力表示
        if (purchaseModel.profile !== null) {
            res.locals.input = purchaseModel.profile;
        } else {
            const defaultProfile = {
                familyName: '',
                givenName: '',
                email: '',
                emailConfirm: '',
                telephone: ''
            };
            // Cognitoから参照
            const awsCognitoIdentityId = req.session.awsCognitoIdentityId;
            if (awsCognitoIdentityId !== undefined) {
                const cognitoCredentials = AwsCognitoService.authenticateWithTerminal(awsCognitoIdentityId);
                try {
                    const profileRecord = await AwsCognitoService.getRecords({
                        datasetName: 'profile',
                        credentials: cognitoCredentials
                    });
                    purchaseModel.profile = {
                        familyName: (profileRecord.familyName !== undefined) ? profileRecord.familyName : '',
                        givenName: (profileRecord.givenName !== undefined) ? profileRecord.givenName : '',
                        email: (profileRecord.email !== undefined) ? profileRecord.email : '',
                        emailConfirm: (profileRecord.email !== undefined) ? profileRecord.email : '',
                        telephone: (profileRecord.telephone !== undefined) ? profileRecord.telephone : ''
                    };
                } catch (err) {
                    purchaseModel.profile = defaultProfile;
                    log('AwsCognitoService.getRecords', err);
                }
            } else {
                purchaseModel.profile = defaultProfile;
            }
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
        next(err);
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
// tslint:disable-next-line:max-func-body-length
export async function purchaserInformationRegistration(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (req.session === undefined) {
        next(new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property));

        return;
    }
    const authModel = new AuthModel(req.session.auth);
    const options = {
        endpoint: (<string>process.env.SSKTS_API_ENDPOINT),
        auth: authModel.create()
    };
    const purchaseModel = new PurchaseModel(req.session.purchase);
    try {
        if (purchaseModel.isExpired()) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Expire);
        if (purchaseModel.transaction === null
            || purchaseModel.reserveTickets === null) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        //取引id確認
        if (req.body.transactionId !== purchaseModel.transaction.id) {
            throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
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
        const phoneUtil = PhoneNumberUtil.getInstance();
        const phoneNumber = phoneUtil.parse(req.body.telephone, 'JP'); // 日本以外は非対応
        if (!phoneUtil.isValidNumber(phoneNumber)) {
            purchaseModel.profile = req.body;
            res.locals.error = {
                telephone: { parm: 'telephone', msg: `${req.__('common.tel_num')}${req.__('common.validation.is_tel')}`, value: '' }
            };
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
        try {
            await creditCardProsess(req, purchaseModel, authModel);
            log('クレジットカード処理終了');
        } catch (err) {
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
            res.locals.gmoError = err.message;
            res.render('purchase/input', { layout: 'layouts/purchase/layout' });
            log('クレジットカード処理失敗', err);

            return;
        }

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
        // Cognitoへ登録
        const awsCognitoIdentityId = req.session.awsCognitoIdentityId;
        if (awsCognitoIdentityId !== undefined) {
            const cognitoCredentials = AwsCognitoService.authenticateWithTerminal(awsCognitoIdentityId);
            try {
                await AwsCognitoService.updateRecords({
                    datasetName: 'profile',
                    value: {
                        familyName: purchaseModel.profile.familyName,
                        givenName: purchaseModel.profile.givenName,
                        email: purchaseModel.profile.email,
                        telephone: purchaseModel.profile.telephone
                    },
                    credentials: cognitoCredentials
                });
            } catch (err) {
                log('AwsCognitoService.updateRecords', err);
            }
        }

        // 購入者内容確認へ
        res.redirect('/purchase/confirm');
    } catch (err) {
        next(err);
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
// tslint:disable-next-line:max-func-body-length
export async function purchaserInformationRegistrationOfMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (req.session === undefined) {
        next(new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property));

        return;
    }
    const authModel = new AuthModel(req.session.auth);
    const options = {
        endpoint: (<string>process.env.SSKTS_API_ENDPOINT),
        auth: authModel.create()
    };
    const purchaseModel = new PurchaseModel(req.session.purchase);

    try {
        if (!authModel.isMember()) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        if (purchaseModel.isExpired()) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Expire);
        if (purchaseModel.transaction === null
            || purchaseModel.reserveTickets === null
            || purchaseModel.profile === null) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        //取引id確認
        if (req.body.transactionId !== purchaseModel.transaction.id) {
            throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
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
        const phoneUtil = PhoneNumberUtil.getInstance();
        const phoneNumber = phoneUtil.parse(req.body.telephone, 'JP'); // 日本以外は非対応
        if (!phoneUtil.isValidNumber(phoneNumber)) {
            purchaseModel.profile = req.body;
            res.locals.error = {
                telephone: { parm: 'telephone', msg: `${req.__('common.tel_num')}${req.__('common.validation.is_tel')}`, value: '' }
            };
            res.locals.gmoError = null;
            res.locals.GMO_ENDPOINT = process.env.GMO_ENDPOINT;
            res.locals.purchaseModel = purchaseModel;
            res.locals.step = PurchaseModel.INPUT_STATE;
            res.render('purchase/input', { layout: 'layouts/purchase/layout' });

            return;
        }
        const creditCardRegistration = (<boolean | undefined>req.body.creditCardRegistration);
        if (creditCardRegistration !== undefined && creditCardRegistration) {
            if (purchaseModel.creditCards.length > 0) {
                await sasaki.service.person(options).deleteCreditCard({
                    personId: 'me',
                    cardSeq: purchaseModel.creditCards[0].cardSeq
                });
                log('クレジットカード削除');
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
            log('クレジットカード登録', purchaseModel.creditCards);
        }

        // クレジットカード処理
        try {
            await creditCardProsess(req, purchaseModel, authModel);
            log('クレジットカード処理終了');
        } catch (err) {
            res.locals.error = { gmo: { parm: 'gmo', msg: req.__('common.error.gmo'), value: '' } };
            res.locals.GMO_ENDPOINT = process.env.GMO_ENDPOINT;
            res.locals.purchaseModel = purchaseModel;
            res.locals.step = PurchaseModel.INPUT_STATE;
            res.locals.gmoError = err.message;
            res.render('purchase/member/input', { layout: 'layouts/purchase/layout' });
            log('クレジットカード処理失敗', err);

            return;
        }

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
        next(err);
    }
}

/**
 * クレジットカード処理
 * @function creditCardProsess
 * @param {Request} req
 * @param {Response} res
 * @param {PurchaseModel} purchaseModel
 */
async function creditCardProsess(
    req: Request,
    purchaseModel: PurchaseModel,
    authModel: AuthModel
): Promise<void> {
    const options = {
        endpoint: (<string>process.env.SSKTS_API_ENDPOINT),
        auth: authModel.create()
    };
    if (purchaseModel.transaction === null) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
    if (purchaseModel.creditCardAuthorization !== null) {
        const cancelCreditCardAuthorizationArgs = {
            transactionId: purchaseModel.transaction.id,
            actionId: purchaseModel.creditCardAuthorization.id
        };
        purchaseModel.creditCardAuthorization = null;
        purchaseModel.gmo = null;
        purchaseModel.save(req.session);
        await sasaki.service.transaction.placeOrder(options).cancelCreditCardAuthorization(cancelCreditCardAuthorizationArgs);
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
        purchaseModel.creditCardAuthorization = await sasaki.service.transaction.placeOrder(options)
            .createCreditCardAuthorization(createCreditCardAuthorizationArgs);
        log('GMOオーソリ追加');
    }
}
