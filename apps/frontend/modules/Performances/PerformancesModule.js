/**
 * パフォーマンス一覧
 * @namespace PerformancesModule
 */
"use strict";
const request = require("request");
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
    const endpoint = process.env.MP_API_ENDPOINT;
    const method = 'performances';
    const options = {
        url: `${endpoint}/${method}/?day=${req.body.day}`,
        method: 'GET',
        json: true
    };
    request.get(options, (error, response, body) => {
        res.json({
            error: error,
            response: response,
            result: body
        });
    });
}
exports.getPerformances = getPerformances;
