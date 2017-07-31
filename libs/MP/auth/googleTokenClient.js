"use strict";
/**
 * Google Sign-In OAuthクライアント
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
const oAuth2client_1 = require("./oAuth2client");
const debug = createDebug('sskts-api:auth:oAuth2client');
const API_ENDPOINT = process.env.TEST_API_ENDPOINT;
class GoogleTokenClient extends oAuth2client_1.default {
    /**
     * Handles OAuth2 flow.
     * @constructor
     */
    constructor(idToken, state, scopes) {
        super('', '', state, scopes);
        this.idToken = idToken;
    }
    /**
     * Refreshes the access token.
     */
    refreshToken() {
        return __awaiter(this, void 0, void 0, function* () {
            // request for new token
            debug('requesting access token...');
            return yield request.post({
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
GoogleTokenClient.SSKTS_OAUTH2_TOKEN_URL = `${API_ENDPOINT}/oauth/token/signInWithGoogle`;
exports.default = GoogleTokenClient;
