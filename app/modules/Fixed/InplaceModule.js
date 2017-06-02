"use strict";
/**
 * 照会
 * @namespace Inplace.InplaceModule
 */
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug");
const ErrorUtilModule = require("../Util/ErrorUtilModule");
const log = debug('SSKTS:Inplace.InplaceModule');
/**
 * 券売機TOPページ表示
 * @memberOf InplaceModule
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
function index(req, res, next) {
    if (req.session === undefined) {
        next(new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_PROPERTY, undefined));
        return;
    }
    delete req.session.purchase;
    delete req.session.mvtk;
    delete req.session.complete;
    res.render('index/index');
    log('券売機TOPページ表示');
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
