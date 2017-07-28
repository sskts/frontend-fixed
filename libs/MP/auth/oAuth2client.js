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
    /**
     * Handles OAuth2 flow.
     * @constructor
     */
    constructor(clientId, clientSecret, state, scopes) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.scopes = scopes;
        this.state = state;
        this.credentials = {};
    }
    /**
     * Retrieves the access token using refresh token
     */
    refreshAccessToken() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.refreshToken()
                .then((tokens) => {
                this.credentials = tokens;
                return this.credentials;
            });
        });
    }
    /**
     * Get a non-expired access token, after refreshing if necessary
     */
    getAccessToken() {
        return __awaiter(this, void 0, void 0, function* () {
            const expiryDate = this.credentials.expiry_date;
            // if no expiry time, assume it's not expired
            const isTokenExpired = (expiryDate !== undefined) ? (expiryDate <= (new Date()).getTime()) : false;
            const shouldRefresh = (this.credentials.access_token === undefined) || isTokenExpired;
            if (shouldRefresh) {
                const tokens = yield this.refreshAccessToken();
                return tokens.access_token;
            }
            else {
                return this.credentials.access_token;
            }
        });
    }
    /**
     * Refreshes the access token.
     */
    refreshToken() {
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
        });
    }
}
/**
 * The base endpoint for token retrieval.
 */
OAuth2Client.SSKTS_OAUTH2_TOKEN_URL = `${API_ENDPOINT}/oauth/token`;
exports.default = OAuth2Client;
