/**
 * 多言語
 */

import { NextFunction } from 'express';
import * as i18n from 'i18n';

const directory = `${__dirname}/../../../public/locales`;

i18n.configure({
    locales: ['ja'],
    defaultLocale: 'ja',
    directory: directory, // 辞書ファイルのありかを指定
    objectNotation: true, // オブジェクトを利用したい場合はtrue
    updateFiles: false, // ページのビューで自動的に言語ファイルを更新しない
});

/**
 * 言語セット
 * @function setLocale
 */
export function setLocale(req: any, res: any, next: NextFunction) {
    i18n.init(req, res, next);
    if (req.session !== undefined && req.session.locale !== undefined) {
        i18n.setLocale(req.session.locale);
    } else {
        i18n.setLocale('ja');
    }
}
