"use strict";
const moment = require("moment");
var Module;
(function (Module) {
    function setLocals(req, res) {
        res.locals.req = req;
        res.locals.route = req.route;
        res.locals.escapeHtml = escapeHtml;
        res.locals.formatPrice = formatPrice;
        res.locals.moment = moment;
    }
    Module.setLocals = setLocals;
    function escapeHtml(string) {
        if (typeof string !== 'string') {
            return string;
        }
        let change = (match) => {
            let changeList = {
                '&': '&amp;',
                "'": '&#x27;',
                '`': '&#x60;',
                '"': '&quot;',
                '<': '&lt;',
                '>': '&gt;',
            };
            return changeList[match];
        };
        return string.replace(/[&'`"<>]/g, change);
    }
    Module.escapeHtml = escapeHtml;
    function formatPrice(price) {
        return String(price).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
    }
    Module.formatPrice = formatPrice;
    function getPerformanceId(args) {
        return `${args.theaterCode}${args.day}${args.titleCode}${args.titleBranchNum}${args.screenCode}${args.timeBegin}`;
    }
    Module.getPerformanceId = getPerformanceId;
})(Module = exports.Module || (exports.Module = {}));
