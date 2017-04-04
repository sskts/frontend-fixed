"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * ムビチケ共通
 * @namespace Purchase.Mvtk.MvtkUtilModule
 */
const UtilModule = require("../../Util/UtilModule");
/**
 * 興行会社コード
 * @memberOf Purchase.Mvtk.MvtkUtilModule
 * @const COMPANY_CODE
 */
exports.COMPANY_CODE = 'SSK000';
/**
 * 作品コード取得
 * @memberOf Purchase.Mvtk.MvtkUtilModule
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
 * @memberOf Purchase.Mvtk.MvtkUtilModule
 * @function getSiteCode
 * @param {string} id 劇場コード
 * @returns {string}
 */
function getSiteCode(id) {
    return (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test')
        ? '18'
        : String(Number(id));
}
exports.getSiteCode = getSiteCode;
