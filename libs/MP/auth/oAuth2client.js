"use strict";
/**
 * OAuthクライアント
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const createDebug = require("debug");
const httpStatus = require("http-status");
const request = require("request-promise-native");
const debug = createDebug('sskts-api:auth:oAuth2client');
const API_ENDPOINT = process.env.TEST_API_ENDPOINT;
class OAuth2Client {
    constructor(clientId, clientSecret, state, scopes) {
        this.clientId = clientId;
        this.clientSecret = (clientSecret !== undefined) ? clientSecret : '';
        this.scopes = (scopes !== undefined) ? scopes : [];
        this.state = (state !== undefined) ? state : '';
        this.credentials = {};
    }
    /**
     * クライアント認証でアクセストークンを取得します。
     */
    getToken() {
        return __awaiter(this, void 0, void 0, function* () {
            // request for new token
            debug('requesting access token...');
            return yield request.post({
                url: OAuth2Client.SSKTS_OAUTH2_TOKEN_URL,
                body: {
                    scopes: this.scopes,
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    state: this.state,
                    grant_type: 'client_credentials'
                },
                json: true,
                simple: false,
                resolveWithFullResponse: true,
                useQuerystring: true
            }).then((response) => {
                if (response.statusCode !== httpStatus.OK) {
                    if (typeof response.body === 'string') {
                        throw new Error(response.body);
                    }
                    if (typeof response.body === 'object' && response.body.errors !== undefined) {
                        const message = response.body.errors.map((error) => {
                            return `${error.title}:${error.detail}`;
                        }).join(', ');
                        throw new Error(message);
                    }
                    throw new Error('An unexpected error occurred');
                }
                const tokens = response.body;
                if (tokens && tokens.expires_in) {
                    // tslint:disable-next-line:no-magic-numbers
                    tokens.expiry_date = ((new Date()).getTime() + (tokens.expires_in * 1000));
                    delete tokens.expires_in;
                }
                return tokens;
            });
        });
    }
    /**
     * OAuthクライアントに認証情報をセットします。
     */
    setCredentials(credentials) {
        this.credentials = credentials;
    }
    refreshAccessToken() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.credentials.refresh_token === undefined) {
                throw new Error('No refresh token is set.');
            }
            return yield this.refreshToken(this.credentials.refresh_token)
                .then((tokens) => {
                this.credentials = tokens;
                return this.credentials;
            });
        });
    }
    /**
     * 期限の切れていないアクセストークンを取得します。
     * 必要であれば更新してから取得します。
     */
    getAccessToken() {
        return __awaiter(this, void 0, void 0, function* () {
            const expiryDate = this.credentials.expiry_date;
            // if no expiry time, assume it's not expired
            const isTokenExpired = (expiryDate !== undefined) ? (expiryDate <= (new Date()).getTime()) : false;
            if (this.credentials.access_token === undefined && this.credentials.refresh_token === undefined) {
                throw new Error('No access or refresh token is set.');
            }
            const shouldRefresh = (this.credentials.access_token === undefined) || isTokenExpired;
            if (shouldRefresh && this.credentials.refresh_token) {
                const tokens = yield this.refreshAccessToken();
                return tokens.access_token;
            }
            else {
                return this.credentials.access_token;
            }
        });
    }
    signInWithGoogle(idToken) {
        return __awaiter(this, void 0, void 0, function* () {
            // request for new token
            debug('requesting access token...');
            return yield request.post({
                url: `${API_ENDPOINT}/oauth/token/signInWithGoogle`,
                body: {
                    idToken: idToken,
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    scopes: this.scopes,
                    state: this.state
                },
                json: true,
                simple: false,
                resolveWithFullResponse: true,
                useQuerystring: true
            }).then((response) => {
                if (response.statusCode !== httpStatus.OK) {
                    if (typeof response.body === 'string') {
                        throw new Error(response.body);
                    }
                    if (typeof response.body === 'object' && response.body.errors !== undefined) {
                        const message = response.body.errors.map((error) => {
                            return `[${error.title}]${error.detail}`;
                        }).join(', ');
                        throw new Error(message);
                    }
                    throw new Error('An unexpected error occurred');
                }
                const tokens = response.body;
                if (tokens && tokens.expires_in) {
                    // tslint:disable-next-line:no-magic-numbers
                    tokens.expiry_date = ((new Date()).getTime() + (tokens.expires_in * 1000));
                    delete tokens.expires_in;
                }
                this.credentials = tokens;
                return tokens;
            });
        });
    }
    signInWithLINE(idToken) {
        return __awaiter(this, void 0, void 0, function* () {
            // request for new token
            debug('requesting access token...');
            return yield request.post({
                url: `${API_ENDPOINT}/oauth/token/signInWithGoogle`,
                body: {
                    idToken: idToken,
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    scopes: this.scopes,
                    state: this.state
                },
                json: true,
                simple: false,
                resolveWithFullResponse: true,
                useQuerystring: true
            }).then((response) => {
                if (response.statusCode !== httpStatus.OK) {
                    if (typeof response.body === 'string') {
                        throw new Error(response.body);
                    }
                    if (typeof response.body === 'object' && response.body.errors !== undefined) {
                        const message = response.body.errors.map((error) => {
                            return `[${error.title}]${error.detail}`;
                        }).join(', ');
                        throw new Error(message);
                    }
                    throw new Error('An unexpected error occurred');
                }
                const tokens = response.body;
                if (tokens && tokens.expires_in) {
                    // tslint:disable-next-line:no-magic-numbers
                    tokens.expiry_date = ((new Date()).getTime() + (tokens.expires_in * 1000));
                    delete tokens.expires_in;
                }
                this.credentials = tokens;
                return tokens;
            });
        });
    }
    /**
     * Refreshes the access token.
     */
    refreshToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            // request for new token
            debug('refreshing access token...');
            return yield request.post({
                url: OAuth2Client.SSKTS_OAUTH2_TOKEN_URL,
                body: {
                    refresh_token: refreshToken,
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    grant_type: 'refresh_token'
                },
                json: true,
                simple: false,
                resolveWithFullResponse: true,
                useQuerystring: true
            }).then((response) => {
                if (response.statusCode !== httpStatus.OK) {
                    if (typeof response.body === 'string') {
                        throw new Error(response.body);
                    }
                    if (typeof response.body === 'object' && response.body.errors !== undefined) {
                        const message = response.body.errors.map((error) => {
                            return `[${error.title}]${error.detail}`;
                        }).join(', ');
                        throw new Error(message);
                    }
                    throw new Error('An unexpected error occurred');
                }
                const tokens = response.body;
                if (tokens && tokens.expires_in) {
                    // tslint:disable-next-line:no-magic-numbers
                    tokens.expiry_date = ((new Date()).getTime() + (tokens.expires_in * 1000));
                    delete tokens.expires_in;
                }
                return tokens;
            });
        });
    }
}
/**
 * The base endpoint for token retrieval.
 */
OAuth2Client.SSKTS_OAUTH2_TOKEN_URL = `${API_ENDPOINT}/oauth/token`;
exports.default = OAuth2Client;
