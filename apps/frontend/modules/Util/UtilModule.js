"use strict";
const moment = require("moment");
/**
 * 共通
 */
var UtilModule;
(function (UtilModule) {
    /**
     * テンプレート変数へ渡す
     * @function
     */
    // tslint:disable-next-line:variable-name
    function setLocals(_req, res, next) {
        res.locals.escapeHtml = escapeHtml;
        res.locals.formatPrice = formatPrice;
        res.locals.moment = moment;
        return next();
    }
    UtilModule.setLocals = setLocals;
    /**
     * HTMLエスケープ
     * @function
     */
    function escapeHtml(str) {
        if (typeof str !== 'string') {
            return str;
        }
        const change = (match) => {
            const changeList = {
                '&': '&amp;',
                '\'': '&#x27;',
                '`': '&#x60;',
                '"': '&quot;',
                '<': '&lt;',
                '>': '&gt;'
            };
            return changeList[match];
        };
        return str.replace(/[&'`"<>]/g, change);
    }
    UtilModule.escapeHtml = escapeHtml;
    /**
     * カンマ区切りへ変換
     * @function
     */
    function formatPrice(price) {
        return String(price).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
    }
    UtilModule.formatPrice = formatPrice;
    /**
     * パフォーマンスID取得
     * @function
     */
    function getPerformanceId(args) {
        return `${args.theaterCode}${args.day}${args.titleCode}${args.titleBranchNum}${args.screenCode}${args.timeBegin}`;
    }
    UtilModule.getPerformanceId = getPerformanceId;
})(UtilModule || (UtilModule = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = UtilModule;
