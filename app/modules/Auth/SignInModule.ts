/**
 * 認証
 * @namespace SignInModule
 */
import * as sasaki from '@motionpicture/sasaki-api-nodejs';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as uuid from 'uuid';
import { AuthModel, MemberType } from '../../models/Auth/AuthModel';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';
const log = debug('SSKTS:SignInModule');

/**
 * 認証ページ表示
 * @memberof SignInModule
 * @function login
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
export async function index(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (req.query.code === undefined && req.query.state === undefined) {
            // サインイン
            const scopes = [
                'phone', 'openid', 'email', 'aws.cognito.signin.user.admin', 'profile',
                'https://sskts-api-development.azurewebsites.net/transactions',
                'https://sskts-api-development.azurewebsites.net/events.read-only',
                'https://sskts-api-development.azurewebsites.net/organizations.read-only',
                'https://sskts-api-development.azurewebsites.net/people.contacts',
                'https://sskts-api-development.azurewebsites.net/people.creditCards',
                'https://sskts-api-development.azurewebsites.net/people.ownershipInfos.read-only'
            ];

            const authModel = new AuthModel({
                domain: process.env.AUTH_DOMAIN,
                clientId: process.env.TEST_CLIENT_ID_OAUTH2,
                clientSecret: process.env.TEST_CLIENT_SECRET_OAUTH2,
                scopes: scopes,
                state: `${req.query.id}-${uuid.v1().replace(/\-/g, '')}`,
                codeVerifier: uuid.v4().replace(/\-/g, ''),
                memberType: MemberType.Member
            });
            const auth = authModel.create();
            const authUrl = auth.generateAuthUrl({
                scopes: authModel.scopes,
                state: authModel.state,
                codeVerifier: (<string>authModel.codeVerifier)
            });
            log('authUrl', authUrl);

            authModel.save(req.session);

            res.redirect(authUrl);
        } else {
            // 購入ページへ
            if (req.session === undefined) throw ErrorUtilModule.ERROR_PROPERTY;
            const authModel = new AuthModel(req.session.auth);
            if (req.query.state !== authModel.state) throw ErrorUtilModule.ERROR_ACCESS;
            const auth: sasaki.auth.OAuth2 = authModel.create();
            authModel.credentials = await auth.getToken(req.query.code, (<string>authModel.codeVerifier));
            authModel.save(req.session);

            res.redirect(`/purchase/app.html?id=${authModel.state.split('-')[0]}`);
        }
    } catch (err) {
        const error = (err instanceof Error)
            ? new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message)
            : new ErrorUtilModule.CustomError(err, undefined);
        next(error);

        return;
    }
}
