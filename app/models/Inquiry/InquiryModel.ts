import * as COA from '@motionpicture/coa-service';
import * as MP from '../../../libs/MP';

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
    public performance: MP.services.performance.IPerformance | null;
    /**
     * COA照会情報
     */
    public stateReserve: COA.services.reserve.IStateReserveResult | null;
    /**
     * 予約チケット
     */
    public login: ILogin | null;

    /**
     * @constructor
     * @param {any} session
     */
    constructor(session: any) {
        if (session === undefined) {
            session = {};
        }
        this.transactionId = (session.transactionId !== undefined) ? session.transactionId : null;
        this.performance = (session.performance !== undefined) ? session.performance : null;
        this.stateReserve = (session.stateReserve !== undefined) ? session.stateReserve : null;
        this.login = (session.login !== undefined) ? session.login : null;
    }

    /**
     * セッションObjectへ変換
     * @memberof InquiryModel
     * @method toSession
     * @returns {Object}
     */
    public toSession(): {
        transactionId: string | null,
        performance: MP.services.performance.IPerformance | null,
        stateReserve: COA.services.reserve.IStateReserveResult | null,
        login: ILogin | null
    } {
        return {
            transactionId: this.transactionId,
            performance: this.performance,
            stateReserve: this.stateReserve,
            login: this.login
        };
    }
}
