"use strict";
var MethodModule;
(function (MethodModule) {
    function ticketing(_req, res, _next) {
        return res.render('method/ticketing');
    }
    MethodModule.ticketing = ticketing;
    function entry(_req, res, _next) {
        return res.render('method/entry');
    }
    MethodModule.entry = entry;
    function bookmark(_req, res, _next) {
        return res.render('method/bookmark');
    }
    MethodModule.bookmark = bookmark;
})(MethodModule || (MethodModule = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MethodModule;
