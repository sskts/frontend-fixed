"use strict";
/**
 * 多言語
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setLocale = void 0;
const i18n = require("i18n");
const directory = `${__dirname}/../../../public/locales`;
i18n.configure({
    locales: ['ja'],
    defaultLocale: 'ja',
    directory: directory,
    objectNotation: true,
    updateFiles: false, // ページのビューで自動的に言語ファイルを更新しない
});
/**
 * 言語セット
 * @function setLocale
 */
function setLocale(req, res, next) {
    i18n.init(req, res, next);
    if (req.session !== undefined && req.session.locale !== undefined) {
        i18n.setLocale(req.session.locale);
    }
    else {
        i18n.setLocale('ja');
    }
}
exports.setLocale = setLocale;
