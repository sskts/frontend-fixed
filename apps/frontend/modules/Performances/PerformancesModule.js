"use strict";
const request = require("request");
const config = require("config");
var PerformancesModule;
(function (PerformancesModule) {
    function index(req, res, next) {
        if (!req.session)
            return next(req.__('common.error.property'));
        return res.render('performance');
    }
    PerformancesModule.index = index;
    function getPerformances(req, res) {
        const endpoint = config.get('mp_api_endpoint');
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
