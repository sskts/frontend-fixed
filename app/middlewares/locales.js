/**
 * 多言語
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const i18n = require("i18n");
i18n.configure({
    // 利用するlocalesを設定。これが辞書ファイルとひも付きます
    locales: ['ja'],
    defaultLocale: 'ja',
    // 辞書ファイルのありかを指定
    directory: `${__dirname}/../locales`,
    // オブジェクトを利用したい場合はtrue
    objectNotation: true
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
