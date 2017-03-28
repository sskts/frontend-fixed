import * as COA from '@motionpicture/coa-service';
import * as MP from '../../../../libs/MP';

/**
 * ログイン情報
 * @interface ILogin
 */
export interface ILogin {
    /**
     * 劇場コード
     */
    theater_code: string;
    /**
     * 購入番号
     */
    reserve_num: string;
    /**
     * 電話番号
     */
    tel_num: string;
}

/**
 * 照会セッション
 * @class InquiryModel
 */
export class InquiryModel {
    /**
     * 取引MPId
     */
    public transactionId: string | null;
    /**
     * パフォーマンス
     */
    public performance: MP.Performance | null;
    /**
     * COA照会情報
     */
    public stateReserve: COA.ReserveService.IStateReserveResult | null;
    /**
     * 予約チケット
     */
    public login: ILogin | null;

    /**
     * @constructor
     * @param {any} session
     */
    constructor(session: object | undefined) {
        if (session === undefined) {
            session = {};
        }
        this.transactionId = (session.hasOwnProperty('transactionId')) ? (<any>session).transactionId : null;
        this.performance = (session.hasOwnProperty('performance')) ? (<any>session).performance : null;
        this.stateReserve = (session.hasOwnProperty('stateReserve')) ? (<any>session).stateReserve : null;
        this.login = (session.hasOwnProperty('login')) ? (<any>session).login : null;
    }

    /**
     * セッションObjectへ変換
     * @memberOf InquiryModel
     * @method toSession
     * @returns {Object}
     */
    public toSession(): {
        transactionId: string | null,
        performance: MP.Performance | null,
        stateReserve: COA.ReserveService.IStateReserveResult | null,
        login: ILogin | null
    } {
        return {
            transactionId: (this.transactionId !== null) ? this.transactionId : null,
            performance: (this.performance !== null) ? this.performance : null,
            stateReserve: (this.stateReserve !== null) ? this.stateReserve : null,
            login: (this.login !== null) ? this.login : null
        };
    }
}
