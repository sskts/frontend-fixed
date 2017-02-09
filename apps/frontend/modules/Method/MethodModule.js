"use strict";
var Module;
(function (Module) {
    function ticketing(_req, res, _next) {
        return res.render('method/ticketing');
    }
    Module.ticketing = ticketing;
    function entry(_req, res, _next) {
        return res.render('method/entry');
    }
    Module.entry = entry;
    function bookmark(_req, res, _next) {
        return res.render('method/bookmark');
    }
    Module.bookmark = bookmark;
})(Module = exports.Module || (exports.Module = {}));
