/**
 * ムビチケ共通
 * @namespace Purchase.Mvtk.MvtkUtilModule
 */
import * as MP from '../../../../libs/MP';
import * as PurchaseSession from '../../../models/Purchase/PurchaseModel';
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
    const branch = `00${titleBranchNum}`.slice(UtilModule.DIGITS_02);

    return `${titleCode}${branch}`;
}

/**
 * サイトコード取得
 * @memberof Purchase.Mvtk.MvtkUtilModule
 * @function getSiteCode
 * @param {string} id 劇場コード
 * @returns {string}
 */
export function getSiteCode(id: string): string {
    return `00${id}`.slice(UtilModule.DIGITS_02);
}

/**
 * ムビチケ情報生成
 * @memberof Purchase.Mvtk.MvtkUtilModule
 * @function cancelMvtk
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {{ tickets: MP.services.transaction.IMvtkPurchaseNoInfo[], seats: MP.IMvtkSeat[] }}
 */
export function createMvtkInfo(
    reserveTickets: MP.services.transaction.IReserveTicket[],
    mvtkInfo: PurchaseSession.IMvtk[]
): { tickets: MP.services.transaction.IMvtkPurchaseNoInfo[], seats: MP.services.transaction.IMvtkSeat[] } {
    const seats: MP.services.transaction.IMvtkSeat[] = [];
    const tickets: MP.services.transaction.IMvtkPurchaseNoInfo[] = [];
    for (const reserveTicket of reserveTickets) {
        const mvtk = mvtkInfo.find((value) => {
            return (value.code === reserveTicket.mvtkNum && value.ticket.ticketCode === reserveTicket.ticketCode);
        });
        if (mvtk === undefined) continue;
        const mvtkTicket = tickets.find((value) => (value.KNYKNR_NO === mvtk.code));
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
            tickets.push({
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
        seats.push({ ZSK_CD: reserveTicket.seatCode });
    }

    return {
        tickets: tickets,
        seats: seats
    };
}
