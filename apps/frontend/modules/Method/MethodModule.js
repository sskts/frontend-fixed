/**
 * 方法
 * @namespace MethodModule
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 発券方法ページ表示
 * @memberOf MethodModule
 * @function ticketing
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
// tslint:disable-next-line:variable-name
function ticketing(_req, res, _next) {
    return res.render('method/ticketing');
}
exports.ticketing = ticketing;
/**
 * 入場方法説明ページ表示
 * @memberOf MethodModule
 * @function entry
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
// tslint:disable-next-line:variable-name
function entry(_req, res, _next) {
    return res.render('method/entry');
}
exports.entry = entry;
/**
 * ブックマーク方法説明ページ表示
 * @memberOf MethodModule
 * @function bookmark
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
// tslint:disable-next-line:variable-name
function bookmark(_req, res, _next) {
    return res.render('method/bookmark');
}
exports.bookmark = bookmark;
