"use strict";
/**
 * 方法
 * @namespace
 */
var MethodModule;
(function (MethodModule) {
    /**
     * 発券方法ページ表示
     * @function
     */
    // tslint:disable-next-line:variable-name
    function ticketing(_req, res, _next) {
        return res.render('method/ticketing');
    }
    MethodModule.ticketing = ticketing;
    /**
     * 入場方法説明ページ表示
     * @function
     */
    // tslint:disable-next-line:variable-name
    function entry(_req, res, _next) {
        return res.render('method/entry');
    }
    MethodModule.entry = entry;
    /**
     * ブックマーク方法説明ページ表示
     * @function
     */
    // tslint:disable-next-line:variable-name
    function bookmark(_req, res, _next) {
        return res.render('method/bookmark');
    }
    MethodModule.bookmark = bookmark;
})(MethodModule || (MethodModule = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MethodModule;
