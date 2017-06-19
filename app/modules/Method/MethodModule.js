"use strict";
/**
 * 方法
 * @namespace MethodModule
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 発券方法ページ表示
 * @memberof MethodModule
 * @function ticketing
 * @param {Request} req
 * @param {Response} res
 * @returns {void}
 */
function ticketing(_, res) {
    res.render('method/ticketing');
    return;
}
exports.ticketing = ticketing;
/**
 * 入場方法説明ページ表示
 * @memberof MethodModule
 * @function entry
 * @param {Request} req
 * @param {Response} res
 * @returns {void}
 */
function entry(_, res) {
    res.render('method/entry');
    return;
}
exports.entry = entry;
/**
 * ブックマーク方法説明ページ表示
 * @memberof MethodModule
 * @function bookmark
 * @param {Request} req
 * @param {Response} res
 * @returns {void}
 */
function bookmark(_, res) {
    res.render('method/bookmark');
    return;
}
exports.bookmark = bookmark;
