/**
 * パフォーマンス一覧
 * @namespace PerformancesModule
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MP = require("../../../../libs/MP");
/**
 * パフォーマンス一覧表示
 * @memberOf PerformancesModule
 * @function index
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
function index(req, res, next) {
    if (!req.session)
        return next(req.__('common.error.property'));
    return res.render('performance');
}
exports.index = index;
/**
 * パフォーマンスリスト取得
 * @memberOf PerformancesModule
 * @function getPerformances
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {void}
 */
function getPerformances(req, res) {
    MP.getPerformances(req.body.day).then((result) => {
        res.json({
            error: null,
            result: result
        });
    }).catch((err) => {
        res.json({
            error: err,
            result: null
        });
    });
}
exports.getPerformances = getPerformances;
