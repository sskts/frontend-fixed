"use strict";
/**
 * パフォーマンス一覧
 * @namespace Purchase.PerformancesModule
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
const MP = require("../../../libs/MP");
const PurchaseSession = require("../../models/Purchase/PurchaseModel");
const ErrorUtilModule = require("../Util/ErrorUtilModule");
/**
 * パフォーマンス一覧表示
 * @memberof Purchase.PerformancesModule
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
function index(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.session === undefined) {
            next(new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_PROPERTY, undefined));
            return;
        }
        if (process.env.VIEW_TYPE === undefined) {
            res.locals.theaters = yield MP.getTheaters();
        }
        res.locals.step = PurchaseSession.PurchaseModel.PERFORMANCE_STATE;
        res.render('purchase/performances', { layout: 'layouts/purchase/layout' });
        return;
    });
}
exports.index = index;
/**
 * パフォーマンスリスト取得
 * @memberof Purchase.PerformancesModule
 * @function getPerformances
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
function getPerformances(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield MP.getPerformances(req.body.theater, req.body.day);
            res.json({ error: null, result: result });
        }
        catch (err) {
            res.json({ error: err, result: null });
        }
    });
}
exports.getPerformances = getPerformances;