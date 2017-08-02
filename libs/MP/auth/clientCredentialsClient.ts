/**
 * クライアント認証OAuthクライアント
 */

import * as createDebug from 'debug';
import * as httpStatus from 'http-status';
import * as request from 'request-promise-native';

import ICredentials from './credentials';
import OAuth2client from './oAuth2client';

const debug = createDebug('sskts-api:auth:oAuth2client');

export default class ClientCredentialsClient extends OAuth2client {
    constructor(clientId: string, clientSecret: string, state: string, scopes: string[]) {
        super(clientId, clientSecret, state, scopes);

        this.credentials = { refresh_token: 'ignored' };
    }

    /**
     * クライアント認証でアクセストークンを取得します。
     */
    public async getToken() {
        debug('requesting an access token...');

        return await request.post({
            url: OAuth2client.SSKTS_OAUTH2_TOKEN_URL,
            form: {
                scope: this.scopes.join(' '),
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

            tokens.refresh_token = 'ignored';

            return <ICredentials>tokens;
        });
    }

    /**
     * Refreshes the access token.
     */
    protected async refreshToken(__: string): Promise<ICredentials> {
        debug('refreshing an access token...');

        return this.getToken();
    }
}
