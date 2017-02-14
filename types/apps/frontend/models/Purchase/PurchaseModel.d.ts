import COA = require('@motionpicture/coa-service');
import MP = require('../../../../libs/MP');
import GMO = require('@motionpicture/gmo-service');
export interface Args {
    id: string;
}
export interface ReserveTicket {
    /**
     * 座席セクション
     */
    section: string;
    /**
     * 座席番号
     */
    seat_code: string;
    /**
     * チケットコード
     */
    ticket_code: string;
    /**
     * チケット名
     */
    ticket_name_ja: string;
    /**
     * チケット名（英）
     */
    ticket_name_en: string;
    /**
     * チケット名（カナ）
     */
    ticket_name_kana: string;
    /**
     * 標準単価
     */
    std_price: number;
    /**
     * 加算単価(３Ｄ，ＩＭＡＸ、４ＤＸ等の加算料金)
     */
    add_price: number;
    /**
     * TODO
     */
    dis_price: number;
    /**
     * 販売単価(標準単価＋加算単価)
     */
    sale_price: number;
}
export interface Input {
    /**
     * せい
     */
    last_name_hira: string;
    /**
     * めい
     */
    first_name_hira: string;
    /**
     * メールアドレス
     */
    mail_addr: string;
    /**
     * メールアドレス確認
     */
    mail_confirm: string;
    /**
     * 電話番号
     */
    tel_num: string;
    /**
     * 利用規約
     */
    agree: string;
}
export interface GMO {
    /**
     * トークン
     */
    token: string;
}
/**
 * 購入セッション
 * @class
 */
export declare class PurchaseModel {
    static SEAT_STATE: number;
    static TICKET_STATE: number;
    static INPUT_STATE: number;
    static CONFIRM_STATE: number;
    static COMPLETE_STATE: number;
    /**
     * パフォーマンス
     */
    performance: MP.Performance | null;
    /**
     * COA仮予約
     */
    reserveSeats: COA.reserveSeatsTemporarilyInterface.Result | null;
    /**
     * 予約チケット
     */
    reserveTickets: ReserveTicket[] | null;
    /**
     * 入力情報
     */
    input: Input | null;
    /**
     * GMO TOKEN情報
     */
    gmo: GMO | null;
    /**
     * COA本予約
     */
    updateReserve: COA.updateReserveInterface.Result | null;
    /**
     * 取引MP
     */
    transactionMP: MP.transactionStart.Result | null;
    /**
     * 取引GMO
     */
    transactionGMO: GMO.CreditService.entryTranInterface.Result | null;
    /**
     * COAオーソリ
     */
    authorizationCOA: MP.addCOAAuthorization.Result | null;
    /**
     * GMOオーソリ
     */
    authorizationGMO: MP.addGMOAuthorization.Result | null;
    /**
     * オーダーID
     */
    orderId: string | null;
    /**
     * 有効期限
     */
    expired: number | null;
    /**
     * @constructor
     */
    constructor(session: any);
    /**
     * セッションObjectへ変換
     * @method
     */
    formatToSession(): {
        performance: MP.Performance | null;
        reserveSeats: COA.reserveSeatsTemporarilyInterface.Result | null;
        reserveTickets: ReserveTicket[] | null;
        input: Input | null;
        gmo: GMO | null;
        updateReserve: COA.updateReserveInterface.Result | null;
        transactionMP: MP.transactionStart.Result | null;
        transactionGMO: GMO.CreditService.entryTranInterface.Result | null;
        authorizationCOA: MP.addCOAAuthorization.Result | null;
        authorizationGMO: MP.addGMOAuthorization.Result | null;
        orderId: string | null;
        expired: number | null;
    };
    /**
     * ステータス確認
     * @method
     */
    accessAuth(value: number): boolean;
    /**
     * 合計金額取得
     * @method
     */
    getReserveAmount(): number;
    /**
     * チケットリスト返却
     * @method
     */
    getTicketList(): Array<{
        /**
         * チケット番号
         */
        ticket_code: string;
        /**
         * 標準単価
         */
        std_price: number;
        /**
         * 加算単価
         */
        add_price: number;
        /**
         * 割引額
         */
        dis_price: number;
        /**
         * 金額
         */
        sale_price: number;
        /**
         * 枚数
         */
        ticket_count: number;
        /**
         * 座席番号
         */
        seat_num: string;
    }>;
}
