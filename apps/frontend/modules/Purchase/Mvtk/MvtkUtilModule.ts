/**
 * ムビチケ共通
 * @namespace Purchase.Mvtk.MvtkUtilModule
 */
import * as UtilModule from '../../Util/UtilModule'
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
    const branch = `00${titleBranchNum}`.slice(UtilModule.DIGITS_02);
    return `${titleCode}${branch}`;
}

/**
 * サイトコード取得
 * @memberOf Purchase.Mvtk.MvtkUtilModule
 * @function getSiteCode
 * @param {string} id 劇場コード
 * @returns {string}
 */
export function getSiteCode(id: string): string {
    return (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test')
        ? '18'
        : String(Number(id));
}
