"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug");
const uuid = require("uuid");
const AuthModel_1 = require("../../models/Auth/AuthModel");
const ErrorUtilModule = require("../Util/ErrorUtilModule");
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
function index(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
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
                    'https://sskts-api-development.azurewebsites.net/people.ownershipInfos.read-only',
                    'https://sskts-api-development.azurewebsites.net/places.read-only'
                    // `${(<string>process.env.SSKTS_API_ENDPOINT)}/transactions`,
                    // `${(<string>process.env.SSKTS_API_ENDPOINT)}/events.read-only`,
                    // `${(<string>process.env.SSKTS_API_ENDPOINT)}/organizations.read-only`,
                    // `${(<string>process.env.SSKTS_API_ENDPOINT)}/people.contacts`,
                    // `${(<string>process.env.SSKTS_API_ENDPOINT)}/people.creditCards`,
                    // `${(<string>process.env.SSKTS_API_ENDPOINT)}/people.ownershipInfos.read-only`,
                    // `${(<string>process.env.SSKTS_API_ENDPOINT)}/places.read-only`
                ];
                const authModel = new AuthModel_1.AuthModel({
                    scopes: scopes,
                    state: `${req.query.id}-${uuid.v1().replace(/\-/g, '')}`,
                    codeVerifier: uuid.v4().replace(/\-/g, ''),
                    memberType: AuthModel_1.MemberType.Member
                });
                const auth = authModel.create();
                const authUrl = auth.generateAuthUrl({
                    scopes: authModel.scopes,
                    state: authModel.state,
                    codeVerifier: authModel.codeVerifier
                });
                log('authUrl');
                authModel.save(req.session);
                res.redirect(authUrl);
            }
            else {
                // 購入ページへ
                if (req.session === undefined)
                    throw ErrorUtilModule.ErrorType.Property;
                const authModel = new AuthModel_1.AuthModel(req.session.auth);
                if (req.query.state !== authModel.state)
                    throw ErrorUtilModule.ErrorType.Access;
                const auth = authModel.create();
                authModel.credentials = yield auth.getToken(req.query.code, authModel.codeVerifier);
                authModel.save(req.session);
                res.redirect(`/purchase/app.html?id=${authModel.state.split('-')[0]}`);
            }
        }
        catch (err) {
            console.log(err);
            const error = (err instanceof Error)
                ? new ErrorUtilModule.CustomError(ErrorUtilModule.ErrorType.ExternalModule, err.message)
                : new ErrorUtilModule.CustomError(err, undefined);
            next(error);
            return;
        }
    });
}
exports.index = index;
