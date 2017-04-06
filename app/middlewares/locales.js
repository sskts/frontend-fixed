/**
 * 多言語
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const i18n = require("i18n");
i18n.configure({
    // 利用するlocalesを設定。これが辞書ファイルとひも付きます
    locales: ['ja', 'en'],
    defaultLocale: 'ja',
    // 辞書ファイルのありかを指定
    directory: `${__dirname}/../locales`,
    // オブジェクトを利用したい場合はtrue
    objectNotation: true
});
exports.default = i18n;
