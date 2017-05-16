"use strict";
/**
 * 座席テスト
 * @namespace Screen.ScreenModule
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
const fs = require("fs-extra");
const UtilModule = require("../Util/UtilModule");
/**
 * 座席選択
 * @memberOf Screen.ScreenModule
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
function index(_, res) {
    return __awaiter(this, void 0, void 0, function* () {
        res.render('screens/test');
    });
}
exports.index = index;
/**
 * スクリーン状態取得
 * @memberOf Screen.ScreenModule
 * @function getScreenStateReserve
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<Response>}
 */
function getScreenStateReserve(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const theaterCode = `00${req.body.theater_code}`.slice(UtilModule.DIGITS_02);
            const screenCode = `000${req.body.screen_code}`.slice(UtilModule.DIGITS_03);
            const screen = yield fs.readJSON(`./app/theaters/${theaterCode}/${screenCode}.json`);
            const setting = yield fs.readJSON('./app/theaters/setting.json');
            return res.json({
                err: null,
                result: {
                    screen: screen,
                    setting: setting
                }
            });
        }
        catch (err) {
            return res.json({ err: err, result: null });
        }
    });
}
exports.getScreenStateReserve = getScreenStateReserve;
