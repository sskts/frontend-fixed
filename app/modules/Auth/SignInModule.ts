/**
 * 認証
 * @namespace SignInModule
 */
import * as sasaki from '@motionpicture/sskts-api-nodejs-client';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as HTTPStatus from 'http-status';
import * as uuid from 'uuid';
import { AuthModel, MemberType } from '../../models/Auth/AuthModel';
import { AppError, ErrorType } from '../Util/ErrorUtilModule';
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
                `${(<string>process.env.RESOURCE_SERVER_DOMAIN)}/transactions`,
                `${(<string>process.env.RESOURCE_SERVER_DOMAIN)}/events.read-only`,
                `${(<string>process.env.RESOURCE_SERVER_DOMAIN)}/organizations.read-only`,
                `${(<string>process.env.RESOURCE_SERVER_DOMAIN)}/people.contacts`,
                `${(<string>process.env.RESOURCE_SERVER_DOMAIN)}/people.creditCards`,
                `${(<string>process.env.RESOURCE_SERVER_DOMAIN)}/people.ownershipInfos.read-only`,
                `${(<string>process.env.RESOURCE_SERVER_DOMAIN)}/places.read-only`
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
            if (req.session === undefined) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
            const authModel = new AuthModel(req.session.auth);
            if (req.query.state !== authModel.state) throw new AppError(HTTPStatus.BAD_REQUEST, ErrorType.Property);
            const auth: sasaki.auth.OAuth2 = authModel.create();
            authModel.credentials = await auth.getToken(req.query.code, (<string>authModel.codeVerifier));
            authModel.save(req.session);

            res.redirect(`/purchase/app.html?id=${authModel.state.split('-')[0]}`);
        }
    } catch (err) {
        next(err);

        return;
    }
}
