"use strict";
const request = require("request");
/**
 * パフォーマンス一覧
 */
var PerformancesModule;
(function (PerformancesModule) {
    /**
     * パフォーマンス一覧表示
     * @function
     */
    function index(req, res, next) {
        if (!req.session)
            return next(req.__('common.error.property'));
        return res.render('performance');
    }
    PerformancesModule.index = index;
    /**
     * パフォーマンスリスト取得
     * @function
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
    PerformancesModule.getPerformances = getPerformances;
})(PerformancesModule || (PerformancesModule = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PerformancesModule;
