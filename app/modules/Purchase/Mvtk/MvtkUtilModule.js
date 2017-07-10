"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UtilModule = require("../../Util/UtilModule");
/**
 * 興行会社コード
 * @memberof Purchase.Mvtk.MvtkUtilModule
 * @const COMPANY_CODE
 */
exports.COMPANY_CODE = 'SSK000';
/**
 * 作品コード取得
 * @memberof Purchase.Mvtk.MvtkUtilModule
 * @function getfilmCode
 * @param {string} titleCode COA作品コード
 * @param {string} titleBranchNum COA作品枝番
 * @returns {string}
 */
function getfilmCode(titleCode, titleBranchNum) {
    const branch = `00${titleBranchNum}`.slice(UtilModule.DIGITS_02);
    return `${titleCode}${branch}`;
}
exports.getfilmCode = getfilmCode;
/**
 * サイトコード取得
 * @memberof Purchase.Mvtk.MvtkUtilModule
 * @function getSiteCode
 * @param {string} id 劇場コード
 * @returns {string}
 */
function getSiteCode(id) {
    return `00${id}`.slice(UtilModule.DIGITS_02);
}
exports.getSiteCode = getSiteCode;
/**
 * ムビチケ情報生成
 * @memberof Purchase.Mvtk.MvtkUtilModule
 * @function cancelMvtk
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {{ tickets: MP.services.transaction.IMvtkPurchaseNoInfo[], seats: MP.IMvtkSeat[] }}
 */
function createMvtkInfo(reserveTickets, mvtkInfo) {
    const seats = [];
    const tickets = [];
    for (const reserveTicket of reserveTickets) {
        const mvtk = mvtkInfo.find((value) => {
            return (value.code === reserveTicket.mvtk_num && value.ticket.ticket_code === reserveTicket.ticket_code);
        });
        if (mvtk === undefined)
            continue;
        const mvtkTicket = tickets.find((value) => (value.KNYKNR_NO === mvtk.code));
        if (mvtkTicket !== undefined) {
            // 券種追加
            const tcket = mvtkTicket.KNSH_INFO.find((value) => (value.KNSH_TYP === mvtk.ykknInfo.ykknshTyp));
            if (tcket !== undefined) {
                // 枚数追加
                tcket.MI_NUM = String(Number(tcket.MI_NUM) + 1);
            }
            else {
                // 新規券種作成
                mvtkTicket.KNSH_INFO.push({
                    KNSH_TYP: mvtk.ykknInfo.ykknshTyp,
                    MI_NUM: '1' //枚数
                });
            }
        }
        else {
            // 新規購入番号作成
            tickets.push({
                KNYKNR_NO: mvtk.code,
                PIN_CD: UtilModule.base64Decode(mvtk.password),
                KNSH_INFO: [
                    {
                        KNSH_TYP: mvtk.ykknInfo.ykknshTyp,
                        MI_NUM: '1' //枚数
                    }
                ]
            });
        }
        seats.push({ ZSK_CD: reserveTicket.seat_code });
    }
    return {
        tickets: tickets,
        seats: seats
    };
}
exports.createMvtkInfo = createMvtkInfo;
