"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ssktsApi = require("@motionpicture/sasaki-api-nodejs");
/**
 * 認証モデル
 * @class AuthModel
 */
class AuthModel {
    /**
     * @constructor
     * @param {any} session
     */
    constructor(session) {
        if (session === undefined) {
            session = {};
        }
        this.clientId = (session.clientId !== undefined) ? session.clientId : process.env.TEST_CLIENT_ID;
        this.clientSecret = (session.clientSecret !== undefined) ? session.clientSecret : process.env.TEST_CLIENT_SECRET,
            this.state = (session.state !== undefined) ? session.state : 'teststate',
            this.scopes = (session.scopes !== undefined) ? session.scopes : [
                'https://sskts-api-development.azurewebsites.net/transactions',
                'https://sskts-api-development.azurewebsites.net/events.read-only',
                'https://sskts-api-development.azurewebsites.net/organizations.read-only',
                'https://sskts-api-development.azurewebsites.net/orders.read-only'
            ];
    }
    /**
     * 認証クラス作成
     * @memberof AuthModel
     * @method create
     * @returns {ssktsApi.auth.ClientCredentials}
     */
    create() {
        return new ssktsApi.auth.ClientCredentials(this.clientId, this.clientSecret, this.state, this.scopes);
    }
    /**
     * セッションへ保存
     * @memberof AuthModel
     * @method save
     * @returns {Object}
     */
    save(session) {
        const authSession = {
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            state: this.state,
            scopes: this.scopes
        };
        session.auth = authSession;
    }
}
exports.AuthModel = AuthModel;
