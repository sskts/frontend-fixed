"use strict";
const moment = require("moment");
var UtilModule;
(function (UtilModule) {
    function setLocals(_req, res, next) {
        res.locals.escapeHtml = escapeHtml;
        res.locals.formatPrice = formatPrice;
        res.locals.moment = moment;
        return next();
    }
    UtilModule.setLocals = setLocals;
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
    UtilModule.escapeHtml = escapeHtml;
    function formatPrice(price) {
        return String(price).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
    }
    UtilModule.formatPrice = formatPrice;
    function getPerformanceId(args) {
        return `${args.theaterCode}${args.day}${args.titleCode}${args.titleBranchNum}${args.screenCode}${args.timeBegin}`;
    }
    UtilModule.getPerformanceId = getPerformanceId;
})(UtilModule || (UtilModule = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = UtilModule;
