"use strict";
/**
 * 照会
 * @namespace Inplace.InplaceModule
 */
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug");
const log = debug('SSKTS:Inplace.InplaceModule');
/**
 * 券売機TOPページ表示
 * @memberOf InplaceModule
 * @function index
 * @param {Response} res
 * @returns {void}
 */
function index(_, res) {
    res.render('index/index');
}
exports.index = index;
/**
 * 券売機設定ページ表示
 * @memberOf InplaceModule
 * @function setting
 * @param {Response} res
 * @returns {void}
 */
function setting(_, res) {
    res.render('setting/index');
}
exports.setting = setting;
/**
 * 利用停止ページ表示
 * @memberOf InplaceModule
 * @function stop
 * @param {Response} res
 * @returns {void}
 */
function stop(_, res) {
    res.render('stop/index');
}
exports.stop = stop;
