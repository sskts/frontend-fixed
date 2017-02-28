import * as COA from '@motionpicture/coa-service';
import * as MP from '../../../../libs/MP';

/**
 * ログイン情報
 * @interface Login
 */
export interface Login {
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
    public stateReserve: COA.ReserveService.StateReserveResult | null;
    /**
     * 予約チケット
     */
    public login: Login | null;

    /**
     * @constructor
     * @param {any} session
     */
    constructor(session: any) {
        if (!session) {
            session = {};
        }
        this.transactionId = (session.transactionId) ? session.transactionId : null;
        this.performance = (session.performance) ? session.performance : null;
        this.stateReserve = (session.stateReserve) ? session.stateReserve : null;
        this.login = (session.login) ? session.login : null;
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
        stateReserve: COA.ReserveService.StateReserveResult | null,
        login: Login | null
    } {

        return {
            transactionId: (this.transactionId) ? this.transactionId : null,
            performance: (this.performance) ? this.performance : null,
            stateReserve: (this.stateReserve) ? this.stateReserve : null,
            login: (this.login) ? this.login : null
        };
    }
}
