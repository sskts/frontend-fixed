"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberType = exports.AuthModel = void 0;
const cinerinoService = require("@cinerino/sdk");
const uuid = require("uuid");
/**
 * 認証モデル
 * @class AuthModel
 */
class AuthModel {
    /**
     * @constructor
     * @param {any} session
     */
    constructor(session = {}) {
        this.state = session.state !== undefined ? session.state : uuid.v1();
        // this.scopes = (session.scopes !== undefined) ? session.scopes : [
        //     `${(<string>process.env.RESOURCE_SERVER_URL)}/transactions`,
        //     `${(<string>process.env.RESOURCE_SERVER_URL)}/events.read-only`,
        //     `${(<string>process.env.RESOURCE_SERVER_URL)}/organizations.read-only`,
        //     `${(<string>process.env.RESOURCE_SERVER_URL)}/orders.read-only`,
        //     `${(<string>process.env.RESOURCE_SERVER_URL)}/places.read-only`
        // ];
        this.scopes = [];
        this.memberType =
            session.memberType !== undefined
                ? session.memberType
                : MemberType.NonMember;
        this.credentials = session.credentials;
        this.codeVerifier = session.codeVerifier;
    }
    /**
     * 認証クラス作成
     */
    create() {
        return __awaiter(this, void 0, void 0, function* () {
            return cinerinoService.auth.ClientCredentials.createInstance({
                domain: process.env.AUTHORIZE_SERVER_DOMAIN || '',
                clientId: process.env.CLIENT_ID || '',
                clientSecret: process.env.CLIENT_SECRET || '',
                state: this.state,
                scopes: this.scopes,
            });
        });
    }
    /**
     * セッションへ保存
     * @memberof AuthModel
     * @method save
     * @returns {Object}
     */
    save(session) {
        const authSession = {
            state: this.state,
            scopes: this.scopes,
            memberType: this.memberType,
            credentials: this.credentials,
            codeVerifier: this.codeVerifier,
        };
        session.auth = authSession;
    }
    /**
     * 会員判定
     * @memberof AuthModel
     * @returns {boolean}
     */
    isMember() {
        return this.memberType === MemberType.Member;
    }
}
exports.AuthModel = AuthModel;
/**
 * 会員種類
 * @enum MemberType
 */
var MemberType;
(function (MemberType) {
    /**
     * 非会員
     */
    MemberType[MemberType["NonMember"] = 0] = "NonMember";
    /**
     * 会員
     */
    MemberType[MemberType["Member"] = 1] = "Member";
})(MemberType = exports.MemberType || (exports.MemberType = {}));
