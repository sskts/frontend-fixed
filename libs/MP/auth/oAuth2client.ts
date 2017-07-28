/**
 * OAuthクライアント
 */

import * as createDebug from 'debug';
import * as httpStatus from 'http-status';
import * as request from 'request-promise-native';

import Credentials from './credentials';

const debug = createDebug('sskts-api:auth:oAuth2client');
const API_ENDPOINT = <string>process.env.TEST_API_ENDPOINT;

export default class OAuth2Client {
    /**
     * The base endpoint for token retrieval.
     */
    private static readonly SSKTS_OAUTH2_TOKEN_URL: string = `${API_ENDPOINT}/oauth/token`;

    public credentials: Credentials;
    public clientId: string;
    public clientSecret: string;
    protected state: string;
    protected scopes: string[];

    /**
     * Handles OAuth2 flow.
     * @constructor
     */
    constructor(clientId: string, clientSecret: string, state: string, scopes: string[]) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.scopes = scopes;
        this.state = state;
        this.credentials = {};
    }

    /**
     * Retrieves the access token using refresh token
     */
    public async refreshAccessToken(): Promise<Credentials> {
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

    /**
     * Refreshes the access token.
     */
    protected async refreshToken(): Promise<Credentials> {
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
                throw new Error(response.body.message);
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
