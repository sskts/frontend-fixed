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
                // 'https://sskts-api-development.azurewebsites.net/transactions',
                // 'https://sskts-api-development.azurewebsites.net/events.read-only',
                // 'https://sskts-api-development.azurewebsites.net/organizations.read-only',
                // 'https://sskts-api-development.azurewebsites.net/people.contacts',
                // 'https://sskts-api-development.azurewebsites.net/people.creditCards',
                // 'https://sskts-api-development.azurewebsites.net/people.ownershipInfos.read-only',
                // 'https://sskts-api-development.azurewebsites.net/places.read-only'
                `${(<string>process.env.SSKTS_API_ENDPOINT)}/transactions`,
                `${(<string>process.env.SSKTS_API_ENDPOINT)}/events.read-only`,
                `${(<string>process.env.SSKTS_API_ENDPOINT)}/organizations.read-only`,
                `${(<string>process.env.SSKTS_API_ENDPOINT)}/people.contacts`,
                `${(<string>process.env.SSKTS_API_ENDPOINT)}/people.creditCards`,
                `${(<string>process.env.SSKTS_API_ENDPOINT)}/people.ownershipInfos.read-only`,
                `${(<string>process.env.SSKTS_API_ENDPOINT)}/places.read-only`
            ];

            const authModel = new AuthModel({
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
            log('authUrl');

            authModel.save(req.session);

            res.redirect(authUrl);
        } else {
            // 購入ページへ
            if (req.session === undefined) throw ErrorUtilModule.ErrorType.Property;
            const authModel = new AuthModel(req.session.auth);
            if (req.query.state !== authModel.state) throw ErrorUtilModule.ErrorType.Access;
            const auth: sasaki.auth.OAuth2 = authModel.create();
            authModel.credentials = await auth.getToken(req.query.code, (<string>authModel.codeVerifier));
            authModel.save(req.session);

            res.redirect(`/purchase/app.html?id=${authModel.state.split('-')[0]}`);
        }
    } catch (err) {
        console.log(err);
        const error = (err instanceof Error)
            ? new ErrorUtilModule.CustomError(ErrorUtilModule.ErrorType.ExternalModule, err.message)
            : new ErrorUtilModule.CustomError(err, undefined);
        next(error);

        return;
    }
}
