/**
 * パフォーマンス一覧
 * @namespace PerformancesModule
 */
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const MP = require("../../../../libs/MP");
const ErrorUtilModule = require("../Util/ErrorUtilModule");
/**
 * パフォーマンス一覧表示
 * @memberOf PerformancesModule
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
function index(req, res, next) {
    if (req.session === undefined) {
        next(ErrorUtilModule.getError(req, ErrorUtilModule.ERROR_PROPERTY));
        return;
    }
    res.render('performance');
    return;
}
exports.index = index;
/**
 * パフォーマンスリスト取得
 * @memberOf PerformancesModule
 * @function getPerformances
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
function getPerformances(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield MP.getPerformances(req.body.theater, req.body.day);
            return res.json({ error: null, result: result });
        }
        catch (err) {
            return res.json({ error: err, result: null });
        }
    });
}
exports.getPerformances = getPerformances;
