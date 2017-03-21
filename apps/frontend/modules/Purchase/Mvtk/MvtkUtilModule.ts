/**
 * ムビチケ共通
 * @namespace Purchase.Mvtk.MvtkUtilModule
 */

/**
 * 興行会社コード
 * @memberOf Purchase.Mvtk.MvtkUtilModule
 * @const COMPANY_CODE
 */
export const COMPANY_CODE = 'SSK000';

/**
 * 作品コード取得
 * @memberOf Purchase.Mvtk.MvtkUtilModule
 * @function getfilmCode
 * @param {string} titleCode COA作品コード
 * @param {string} titleBranchNum COA作品枝番
 * @returns {string}
 */
export function getfilmCode(titleCode: string, titleBranchNum: string): string {
    const num = 10;
    return (Number(titleBranchNum) < num)
        ? `${titleCode}0${titleBranchNum}`
        : `${titleCode}${titleBranchNum}`;
}

/**
 * サイトコード取得
 * @memberOf Purchase.Mvtk.MvtkUtilModule
 * @function getSiteCode
 * @param {string} id 劇場コード
 * @returns {string}
 */
export function getSiteCode(id: string): string {
    return (process.env.NODE_ENV === 'development')
        ? '15'
        : String(Number(id));
}