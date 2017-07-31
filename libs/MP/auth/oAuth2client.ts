/**
 * OAuthクライアント
 */

import * as createDebug from 'debug';
import * as httpStatus from 'http-status';
import * as request from 'request-promise-native';

import ICredentials from './credentials';

const debug = createDebug('sskts-api:auth:oAuth2client');
const API_ENDPOINT = <string>process.env.TEST_API_ENDPOINT;

export default class OAuth2Client {
    /**
     * The base endpoint for token retrieval.
     */
    protected static readonly SSKTS_OAUTH2_TOKEN_URL: string = `${API_ENDPOINT}/oauth/token`;

    public credentials: ICredentials;
    public clientId: string;
    public clientSecret: string;
    protected state: string;
    protected scopes: string[];

    constructor(clientId: string, clientSecret?: string, state?: string, scopes?: string[]) {
        this.clientId = clientId;
        this.clientSecret = (clientSecret !== undefined) ? clientSecret : '';
        this.scopes = (scopes !== undefined) ? scopes : [];
        this.state = (state !== undefined) ? state : '';
        this.credentials = {};
    }

    public setCredentials(credentials: ICredentials) {
        this.credentials = credentials;
    }

    public async refreshAccessToken(): Promise<ICredentials> {
        return await this.refreshToken()
            .then((tokens) => {
                this.credentials = tokens;

                return this.credentials;
            });
    }

    /**
     * Get a non-expired access token, after refreshing if necessary
     */
    public async getAccessToken(): Promise<string> {
        const expiryDate = this.credentials.expiry_date;

        // if no expiry time, assume it's not expired
        const isTokenExpired = (expiryDate !== undefined) ? (expiryDate <= (new Date()).getTime()) : false;

        const shouldRefresh = (this.credentials.access_token === undefined) || isTokenExpired;
        if (shouldRefresh) {
            const tokens = await this.refreshAccessToken();

            return <string>tokens.access_token;
        } else {
            return <string>this.credentials.access_token;
        }
    }

    public async signInWithGoogle(idToken: string): Promise<ICredentials> {
        // request for new token
        debug('requesting access token...');

        return await request.post({
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
                    const message = (<any[]>response.body.errors).map((error) => {
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
    }

    public async signInWithLINE(idToken: string): Promise<ICredentials> {
        // request for new token
        debug('requesting access token...');

        return await request.post({
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
                    const message = (<any[]>response.body.errors).map((error) => {
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
    }

    /**
     * Refreshes the access token.
     */
    protected async refreshToken(): Promise<ICredentials> {
        // request for new token
        debug('requesting access token...');

        return await request.post({
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
                    const message = (<any[]>response.body.errors).map((error) => {
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
    }
}
