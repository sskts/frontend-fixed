import * as cinerinoService from '@cinerino/api-nodejs-client';
import * as uuid from 'uuid';

/**
 * 認証セッション
 * @interface IAuthSession
 */
export interface IAuthSession {
    /**
     * 状態
     */
    state: string;
    /**
     * スコープ
     */
    scopes: string[];
    /**
     * 会員タイプ
     */
    memberType: number;
    /**
     * 資格情報
     */
    credentials: any;
    /**
     * コード検証
     */
    codeVerifier?: string;
}

/**
 * 認証モデル
 * @class AuthModel
 */
export class AuthModel {
    /**
     * 状態
     */
    public state: string;
    /**
     * スコープ
     */
    public scopes: string[];
    /**
     * 会員タイプ
     */
    public memberType: number;
    /**
     * 資格情報
     */
    public credentials?: any;
    /**
     * コード検証
     */
    public codeVerifier?: string;

    /**
     * @constructor
     * @param {any} session
     */
    constructor(session: any = {}) {

        this.state = (session.state !== undefined) ? session.state : uuid.v1();
        // this.scopes = (session.scopes !== undefined) ? session.scopes : [
        //     `${(<string>process.env.RESOURCE_SERVER_URL)}/transactions`,
        //     `${(<string>process.env.RESOURCE_SERVER_URL)}/events.read-only`,
        //     `${(<string>process.env.RESOURCE_SERVER_URL)}/organizations.read-only`,
        //     `${(<string>process.env.RESOURCE_SERVER_URL)}/orders.read-only`,
        //     `${(<string>process.env.RESOURCE_SERVER_URL)}/places.read-only`
        // ];
        this.scopes = [];
        this.memberType = (session.memberType !== undefined) ? session.memberType : MemberType.NonMember;
        this.credentials = session.credentials;
        this.codeVerifier = session.codeVerifier;
    }

    /**
     * 認証クラス作成
     * @memberof AuthModel
     * @method create
     * @returns {cinerinoService.auth.ClientCredentials}
     */
    public create(): cinerinoService.auth.ClientCredentials {
        return new cinerinoService.auth.ClientCredentials({
            domain: (<string>process.env.AUTHORIZE_SERVER_DOMAIN),
            clientId: (<string>process.env.CLIENT_ID),
            clientSecret: (<string>process.env.CLIENT_SECRET),
            state: this.state,
            scopes: this.scopes
        });
    }

    /**
     * セッションへ保存
     * @memberof AuthModel
     * @method save
     * @returns {Object}
     */
    public save(session: any): void {
        const authSession: IAuthSession = {
            state: this.state,
            scopes: this.scopes,
            memberType: this.memberType,
            credentials: this.credentials,
            codeVerifier: this.codeVerifier
        };
        session.auth = authSession;
    }

    /**
     * 会員判定
     * @memberof AuthModel
     * @returns {boolean}
     */
    public isMember(): boolean {
        return (this.memberType === MemberType.Member);
    }
}

/**
 * 会員種類
 * @enum MemberType
 */
export enum MemberType {
    /**
     * 非会員
     */
    NonMember = 0,
    /**
     * 会員
     */
    Member = 1
}
