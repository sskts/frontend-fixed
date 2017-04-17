"use strict";
/**
 * 方法
 * @namespace MethodModule
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 発券方法ページ表示
 * @memberOf MethodModule
 * @function ticketing
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
// tslint:disable-next-line:variable-name
function ticketing(_req, res, _next) {
    res.render('method/ticketing');
    return;
}
exports.ticketing = ticketing;
/**
 * 入場方法説明ページ表示
 * @memberOf MethodModule
 * @function entry
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
// tslint:disable-next-line:variable-name
function entry(_req, res, _next) {
    res.render('method/entry');
    return;
}
exports.entry = entry;
/**
 * ブックマーク方法説明ページ表示
 * @memberOf MethodModule
 * @function bookmark
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
// tslint:disable-next-line:variable-name
function bookmark(_req, res, _next) {
    res.render('method/bookmark');
    return;
}
exports.bookmark = bookmark;
