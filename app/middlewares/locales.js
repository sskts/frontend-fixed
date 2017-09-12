/**
 * 多言語
 */
"use strict";
const i18n = require("i18n");
const UtilModule = require("../modules/Util/UtilModule");
let directory = `${__dirname}/../locales/default`;
if (process.env.VIEW_TYPE === UtilModule.VIEW.Fixed) {
    directory = `${__dirname}/../locales/fixed`;
}
i18n.configure({
    locales: ['ja'],
    defaultLocale: 'ja',
    directory: directory,
    objectNotation: true,
    updateFiles: false // ページのビューで自動的に言語ファイルを更新しない
});
/**
 * 言語セット
 * @function setLocale
 * @param {Request} req
 * @param {res} res
 * @param {NextFunction} next
 */
function setLocale(req, res, next) {
    i18n.init(req, res, next);
    if (req.session !== undefined && req.session.locale !== undefined) {
        i18n.setLocale(req, req.session.locale);
    }
    else {
        i18n.setLocale(req, 'ja');
    }
}
exports.setLocale = setLocale;
