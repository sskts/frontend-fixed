import COA = require('@motionpicture/coa-service');
import MP = require('../../../../libs/MP');
/**
 * ログイン情報
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
 * @class
 */
export declare class InquiryModel {
    /**
     * 取引MPId
     */
    transactionId: string | null;
    /**
     * パフォーマンス
     */
    performance: MP.Performance | null;
    /**
     * COA照会情報
     */
    stateReserve: COA.stateReserveInterface.Result | null;
    /**
     * 予約チケット
     */
    login: Login | null;
    /**
     * @constructor
     */
    constructor(session: any);
    /**
     * セッションObjectへ変換
     * @method
     */
    formatToSession(): {
        transactionId: string | null;
        performance: MP.Performance | null;
        stateReserve: COA.stateReserveInterface.Result | null;
        login: Login | null;
    };
}
