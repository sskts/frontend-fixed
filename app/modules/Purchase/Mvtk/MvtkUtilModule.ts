/**
 * ムビチケ共通
 * @namespace Purchase.Mvtk.MvtkUtilModule
 */
import { PurchaseModel } from '../../../models/Purchase/PurchaseModel';
import * as UtilModule from '../../Util/UtilModule';
/**
 * 興行会社コード
 * @memberof Purchase.Mvtk.MvtkUtilModule
 * @const COMPANY_CODE
 */
export const COMPANY_CODE = 'SSK000';

/**
 * 作品コード取得
 * @memberof Purchase.Mvtk.MvtkUtilModule
 * @function getfilmCode
 * @param {string} titleCode COA作品コード
 * @param {string} titleBranchNum COA作品枝番
 * @returns {string}
 */
export function getfilmCode(titleCode: string, titleBranchNum: string): string {
    const branch = `00${titleBranchNum}`.slice(UtilModule.DIGITS['02']);

    return `${titleCode}${branch}`;
}

/**
 * ムビチケ情報生成
 * @memberof Purchase.Mvtk.MvtkUtilModule
 * @function cancelMvtk
 * @param {PurchaseModel} purchaseModel
 * @returns {{ tickets: MP.services.transaction.IMvtkPurchaseNoInfo[], seats: MP.IMvtkSeat[] }}
 */
export function createMvtkInfo(purchaseModel: PurchaseModel): IMvtkInfo | null {
    const result: IMvtkInfo = {
        purchaseNoInfo: [],
        seat: []
    };
    for (const reserveTicket of purchaseModel.reserveTickets) {
        const mvtk = purchaseModel.mvtk.find((value) => {
            return (value.code === reserveTicket.mvtkNum && value.ticket.ticketCode === reserveTicket.ticketCode);
        });
        if (mvtk === undefined) continue;
        const mvtkTicket = result.purchaseNoInfo.find((value) => (value.KNYKNR_NO === mvtk.code));
        if (mvtkTicket !== undefined) {
            // 券種追加
            const tcket = mvtkTicket.KNSH_INFO.find((value) => (value.KNSH_TYP === mvtk.ykknInfo.ykknshTyp));
            if (tcket !== undefined) {
                // 枚数追加
                tcket.MI_NUM = String(Number(tcket.MI_NUM) + 1);
            } else {
                // 新規券種作成
                mvtkTicket.KNSH_INFO.push({
                    KNSH_TYP: mvtk.ykknInfo.ykknshTyp, //券種区分
                    MI_NUM: '1' //枚数
                });
            }
        } else {
            // 新規購入番号作成
            result.purchaseNoInfo.push({
                KNYKNR_NO: mvtk.code, //購入管理番号（ムビチケ購入番号）
                PIN_CD: UtilModule.base64Decode(mvtk.password), //PINコード（ムビチケ暗証番号）
                KNSH_INFO: [
                    {
                        KNSH_TYP: mvtk.ykknInfo.ykknshTyp, //券種区分
                        MI_NUM: '1' //枚数
                    }
                ]
            });
        }
        result.seat.push({ ZSK_CD: reserveTicket.seatCode });
    }
    if (result.purchaseNoInfo.length === 0 || result.seat.length === 0) {
        return null;
    }

    return result;
}

/**
 * ムビチケ情報
 */
export interface IMvtkInfo {
    /**
     * ムビチケ購入情報
     */
    purchaseNoInfo: {
        /**
         * 購入管理番号（ムビチケ購入番号）
         */
        KNYKNR_NO: string;
        /**
         * PINコード（ムビチケ暗証番号）
         */
        PIN_CD: string;

        KNSH_INFO: {
            /**
             * 券種区分
             */
            KNSH_TYP: string;
            /**
             * 枚数
             */
            MI_NUM: string;
        }[];
    }[];
    /**
     * ムビチケ座席
     */
    seat: {
        ZSK_CD: string;
    }[];
}
