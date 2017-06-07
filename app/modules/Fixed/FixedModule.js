"use strict";
/**
 * 照会
 * @namespace Fixed.FixedModule
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug");
const MP = require("../../../libs/MP");
const ErrorUtilModule = require("../Util/ErrorUtilModule");
const log = debug('SSKTS:Fixed.FixedModule');
/**
 * 券売機TOPページ表示
 * @memberof FixedModule
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
 * @memberof FixedModule
 * @function setting
 * @param {Response} res
 * @returns {Promise<void>}
 */
function setting(_, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            res.locals.theaters = yield MP.getTheaters();
            res.render('setting/index');
        }
        catch (err) {
            next(new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message));
        }
    });
}
exports.setting = setting;
/**
 * 利用停止ページ表示
 * @memberof FixedModule
 * @function stop
 * @param {Response} res
 * @returns {void}
 */
function stop(_, res) {
    res.render('stop/index');
}
exports.stop = stop;
