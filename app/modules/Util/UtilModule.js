/**
 * 共通
 * @namespace Util.UtilModule
 */
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const moment = require("moment");
/**
 * テンプレート変数へ渡す
 * @memberOf Util.UtilModule
 * @function setLocals
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunctiont} next
 * @returns {void}
 */
// tslint:disable-next-line:variable-name
function setLocals(_req, res, next) {
    res.locals.escapeHtml = escapeHtml;
    res.locals.formatPrice = formatPrice;
    res.locals.moment = moment;
    res.locals.timeFormat = timeFormat;
    res.locals.portalSite = getPortalUrl();
    next();
    return;
}
exports.setLocals = setLocals;
/**
 * 時間フォーマット
 * @memberOf Util.UtilModule
 * @function timeFormat
 * @param {string} str
 * @returns {string}
 */
function timeFormat(str) {
    if (typeof str !== 'string') {
        return '';
    }
    const start = 2;
    const end = 4;
    return `${str.slice(0, start)}:${str.slice(start, end)}`;
}
exports.timeFormat = timeFormat;
/**
 * HTMLエスケープ
 * @memberOf Util.UtilModule
 * @function escapeHtml
 * @param {string} str
 * @returns {string}
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
exports.escapeHtml = escapeHtml;
/**
 * カンマ区切りへ変換
 * @memberOf Util.UtilModule
 * @function formatPrice
 * @param {number} price
 * @returns {string}
 */
function formatPrice(price) {
    return String(price).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
}
exports.formatPrice = formatPrice;
/**
 * パフォーマンスID取得
 * @memberOf Util.UtilModule
 * @function getPerformanceId
 * @param {Object} args
 * @param {string} args.theaterCode
 * @param {string} args.day
 * @param {string} args.titleCode
 * @param {string} args.titleBranchNum
 * @param {string} args.screenCode
 * @param {string} args.timeBegin
 * @returns {string}
 */
function getPerformanceId(args) {
    return `${args.theaterCode}${args.day}${args.titleCode}${args.titleBranchNum}${args.screenCode}${args.timeBegin}`;
}
exports.getPerformanceId = getPerformanceId;
/**
 * ベース64エンコード
 * @memberOf Util.UtilModule
 * @function bace64Encode
 * @param {string} str
 * @returns {string}
 */
function bace64Encode(str) {
    return new Buffer(str).toString('base64');
}
exports.bace64Encode = bace64Encode;
/**
 * ベース64デコード
 * @memberOf Util.UtilModule
 * @function base64Decode
 * @param {string} str
 * @returns {string}
 */
function base64Decode(str) {
    return new Buffer(str, 'base64').toString();
}
exports.base64Decode = base64Decode;
/**
 * ポータルURL取得
 * @memberOf Util.UtilModule
 * @function getPortalUrl
 * @returns {string}
 */
function getPortalUrl() {
    let result;
    if (process.env.NODE_ENV === 'prod') {
        // tslint:disable-next-line:no-http-string
        result = 'http://www.cinemasunshine.co.jp';
    }
    else if (process.env.NODE_ENV === 'test') {
        // tslint:disable-next-line:no-http-string
        result = 'http://devssktsportal.azurewebsites.net';
    }
    else {
        // tslint:disable-next-line:no-http-string
        result = '/';
    }
    return result;
}
exports.getPortalUrl = getPortalUrl;
/**
 * メール内容取得
 * @memberOf Util.UtilModule
 * @function getMailTemplate
 * @param {Response} res
 * @param {string} file
 * @param {{}} locals
 * @returns {Promise<string>}
 */
function getEmailTemplate(res, file, locals) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            res.render(file, locals, (err, html) => {
                if (err !== null) {
                    reject(err);
                    return;
                }
                resolve(html);
                return;
            });
        });
    });
}
exports.getEmailTemplate = getEmailTemplate;
/**
 * json取得
 * @memberOf Util.UtilModule
 * @function readJSONAsync
 * @param {string} file
 * @returns {Promise<{}>}
 */
function readJSONAsync(file) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            fs.readJSON(file, (err, jsonObject) => {
                if (err !== null) {
                    reject(err);
                    return;
                }
                resolve(jsonObject);
                return;
            });
        });
    });
}
exports.readJSONAsync = readJSONAsync;
/**
 * 2桁
 * @memberOf Util.UtilModule
 * @const DIGITS_02
 * @type number
 */
exports.DIGITS_02 = -2;
/**
 * 3桁
 * @memberOf Util.UtilModule
 * @const DIGITS_03
 * @type number
 */
exports.DIGITS_03 = -3;
/**
 * 8桁
 * @memberOf Util.UtilModule
 * @const DIGITS_08
 * @type number
 */
exports.DIGITS_08 = -8;
