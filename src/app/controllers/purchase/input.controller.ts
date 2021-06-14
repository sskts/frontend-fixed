/**
 * 購入情報入力
 * @namespace Purchase.InputModule
 */

import * as cinerinoService from '@cinerino/sdk';
import * as GMO from '@motionpicture/gmo-service';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import { PhoneNumberUtil } from 'google-libphonenumber';
import * as HTTPStatus from 'http-status';
import { formatTelephone, getApiOption } from '../../functions';
import { purchaseInputForm } from '../../functions/forms';
import { AppError, ErrorType, IGMO, PurchaseModel } from '../../models';
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

        if (purchaseModel.isExpired()) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Expire);
        if (!purchaseModel.accessAuth(PurchaseModel.INPUT_STATE)) {
            throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Access);
        }

        //購入者情報入力表示
        if (purchaseModel.profile !== undefined) {
            res.locals.input = purchaseModel.profile;
        } else {
            const defaultProfile = {
                familyName: '',
                givenName: '',
                email: '',
                emailConfirm: '',
                telephone: ''
            };
            purchaseModel.profile = defaultProfile;
        }
        purchaseModel.save(req.session);
        if (purchaseModel.seller === undefined
            || purchaseModel.seller.paymentAccepted === undefined) {
            throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        }
        const findPaymentAcceptedResult = purchaseModel.seller.paymentAccepted.find((paymentAccepted) => {
            return (paymentAccepted.paymentMethodType === cinerinoService.factory.paymentMethodType.CreditCard);
        });
        if (findPaymentAcceptedResult === undefined
            || (<any>findPaymentAcceptedResult).gmoInfo === undefined
            || (<any>findPaymentAcceptedResult).gmoInfo.shopId === undefined) {
            throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        }

        res.locals.error = undefined;
        res.locals.gmoError = undefined;
        res.locals.GMO_ENDPOINT = process.env.GMO_ENDPOINT;
        res.locals.purchaseModel = purchaseModel;
        res.locals.shopId = (<any>findPaymentAcceptedResult).gmoInfo.shopId;
        res.locals.step = PurchaseModel.INPUT_STATE;
        res.render('purchase/input', { layout: 'layouts/purchase/layout' });
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
    const options = getApiOption(req);
    const purchaseModel = new PurchaseModel(req.session.purchase);
    try {
        if (purchaseModel.isExpired()) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Expire);
        if (purchaseModel.transaction === undefined
            || purchaseModel.seller === undefined
            || purchaseModel.seller.paymentAccepted === undefined
            || purchaseModel.reserveTickets === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        //取引id確認
        if (req.body.transactionId !== purchaseModel.transaction.id) {
            throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        }
        const findPaymentAcceptedResult = purchaseModel.seller.paymentAccepted.find((paymentAccepted) => {
            return (paymentAccepted.paymentMethodType === cinerinoService.factory.paymentMethodType.CreditCard);
        });
        if (findPaymentAcceptedResult === undefined
            || (<any>findPaymentAcceptedResult).gmoInfo === undefined
            || (<any>findPaymentAcceptedResult).gmoInfo.shopId === undefined) {
            throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
        }
        // バリデーション
        purchaseInputForm(req);
        const validationResult = await req.getValidationResult();
        if (!validationResult.isEmpty()) {
            purchaseModel.profile = req.body;
            res.locals.error = validationResult.mapped();
            res.locals.gmoError = undefined;
            res.locals.GMO_ENDPOINT = process.env.GMO_ENDPOINT;
            res.locals.shopId = (<any>findPaymentAcceptedResult).gmoInfo.shopId;
            res.locals.purchaseModel = purchaseModel;
            res.locals.step = PurchaseModel.INPUT_STATE;
            res.render('purchase/input', { layout: 'layouts/purchase/layout' });
            log('入力バリデーション');

            return;
        }
        const phoneUtil = PhoneNumberUtil.getInstance();
        const phoneNumber = phoneUtil.parse(req.body.telephone, 'JP'); // 日本以外は非対応
        if (!phoneUtil.isValidNumber(phoneNumber)) {
            purchaseModel.profile = req.body;
            res.locals.error = {
                telephone: { parm: 'telephone', msg: `${req.__('common.tel_num')}${req.__('common.validation.is_tel')}`, value: '' }
            };
            res.locals.gmoError = undefined;
            res.locals.GMO_ENDPOINT = process.env.GMO_ENDPOINT;
            res.locals.shopId = (<any>findPaymentAcceptedResult).gmoInfo.shopId;
            res.locals.purchaseModel = purchaseModel;
            res.locals.step = PurchaseModel.INPUT_STATE;
            res.render('purchase/input', { layout: 'layouts/purchase/layout' });
            log('電話番号バリデーション');

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
            await creditCardProsess(req, purchaseModel);
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
            res.locals.shopId = (<any>findPaymentAcceptedResult).gmoInfo.shopId;
            res.locals.purchaseModel = purchaseModel;
            res.locals.step = PurchaseModel.INPUT_STATE;
            res.locals.gmoError = err.message;
            res.render('purchase/input', { layout: 'layouts/purchase/layout' });
            log('クレジットカード処理失敗', err);

            return;
        }

        await new cinerinoService.service.transaction.PlaceOrder4sskts(options).setProfile({
            id: purchaseModel.transaction.id,
            agent: {
                familyName: purchaseModel.profile.familyName,
                givenName: purchaseModel.profile.givenName,
                email: purchaseModel.profile.email,
                telephone: formatTelephone(purchaseModel.profile.telephone)
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
    purchaseModel: PurchaseModel
): Promise<void> {
    const options = getApiOption(req);
    if (purchaseModel.transaction === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
    if (purchaseModel.creditCardAuthorization !== undefined) {
        await new cinerinoService.service.Payment(options).voidTransaction({
            id: purchaseModel.creditCardAuthorization.id,
            object: {
                typeOf: cinerinoService.factory.paymentMethodType.CreditCard
            },
            purpose: {
                id: purchaseModel.transaction.id,
                typeOf: purchaseModel.transaction.typeOf
            }
        });
        purchaseModel.creditCardAuthorization = undefined;
        purchaseModel.gmo = undefined;
        purchaseModel.save(req.session);
        log('GMOオーソリ削除');
    }
    if (purchaseModel.getReserveAmount() > 0) {
        // クレジット決済
        purchaseModel.save(req.session);
        purchaseModel.gmo = JSON.parse(req.body.gmoTokenObject);
        const creditCard = {
            token: (<IGMO>purchaseModel.gmo).token
        };
        purchaseModel.creditCardAuthorization = await new cinerinoService.service.Payment(options).authorizeCreditCard({
            object: {
                typeOf: cinerinoService.factory.action.authorize.paymentMethod.any.ResultType.Payment,
                amount: purchaseModel.getReserveAmount(),
                method: GMO.utils.util.Method.Lump,
                creditCard,
                paymentMethod: cinerinoService.factory.chevre.paymentMethodType.CreditCard
            },
            purpose: {
                id: purchaseModel.transaction.id,
                typeOf: purchaseModel.transaction.typeOf
            }
        });
        log('GMOオーソリ追加');
    }
}
