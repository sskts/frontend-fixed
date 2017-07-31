/**
 * Google Sign-In OAuthクライアント
 */

import * as createDebug from 'debug';
import * as httpStatus from 'http-status';
import * as request from 'request-promise-native';

import Credentials from './credentials';
import OAuth2client from './oAuth2client';

const debug = createDebug('sskts-api:auth:oAuth2client');
const API_ENDPOINT = <string>process.env.TEST_API_ENDPOINT;

export default class GoogleTokenClient extends OAuth2client {
    /**
     * The base endpoint for token retrieval.
     */
    protected static readonly SSKTS_OAUTH2_TOKEN_URL: string = `${API_ENDPOINT}/oauth/token/signInWithGoogle`;

    public idToken: string;

    /**
     * Handles OAuth2 flow.
     * @constructor
     */
    constructor(idToken: string, state: string, scopes: string[]) {
        super('', '', state, scopes);

        this.idToken = idToken;
    }

    /**
     * Refreshes the access token.
     */
    protected async refreshToken(): Promise<Credentials> {
        // request for new token
        debug('requesting access token...');

        return await request.post({
            url: GoogleTokenClient.SSKTS_OAUTH2_TOKEN_URL,
            body: {
                idToken: this.idToken,
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

            return tokens;
        });
    }
}
