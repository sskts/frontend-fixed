"use strict";
const request = require("request");
const config = require("config");
var Module;
(function (Module) {
    function index(req, res, next) {
        if (!req.session)
            return next(req.__('common.error.property'));
        return res.render('performance');
    }
    Module.index = index;
    function getPerformances(req, res) {
        let endpoint = config.get('mp_api_endpoint');
        let method = 'performances';
        let options = {
            url: `${endpoint}/${method}/?day=${req.body.day}`,
            method: 'GET',
            json: true,
        };
        request.get(options, (error, response, body) => {
            res.json({
                error: error,
                response: response,
                result: body
            });
        });
    }
    Module.getPerformances = getPerformances;
})(Module = exports.Module || (exports.Module = {}));
