"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const moment = require("moment");
/**
 * テンプレート変数へ渡す
 * @memberof Util.UtilModule
 * @function setLocals
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunctiont} next
 * @returns {void}
 */
function setLocals(req, res, next) {
    res.locals.escapeHtml = escapeHtml;
    res.locals.formatPrice = formatPrice;
    res.locals.moment = moment;
    res.locals.timeFormat = timeFormat;
    res.locals.portalSite = process.env.PORTAL_SITE_URL;
    res.locals.env = process.env.NODE_ENV;
    res.locals.webhookApiEndPoint = process.env.SSKTS_WEBHOOK_ENDPOINT;
    res.locals.appSiteUrl = process.env.APP_SITE_URL;
    // クッキーからアプリ判定
    res.locals.viewType = (req.cookies.applicationData !== undefined) ? JSON.parse(req.cookies.applicationData).viewType : null;
    next();
}
exports.setLocals = setLocals;
/**
 * アプリ判定
 * @memberof Util.UtilModule
 * @function isApp
 * @param {Request} req
 * @returns {boolean}
 */
function isApp(req) {
    const viewType = (req.cookies.applicationData !== undefined) ? JSON.parse(req.cookies.applicationData).viewType : null;
    return (viewType === 'app');
}
exports.isApp = isApp;
/**
 * 時間フォーマット
 * @memberof Util.UtilModule
 * @function timeFormat
 * @param {string} referenceDate 基準日
 * @param {Date} screeningTime 時間
 * @returns {string}
 */
function timeFormat(screeningTime, referenceDate) {
    const HOUR = 60;
    const diff = moment(screeningTime).diff(moment(referenceDate), 'minutes');
    const hour = (`00${Math.floor(diff / HOUR)}`).slice(DIGITS['02']);
    const minutes = moment(screeningTime).format('mm');
    return `${hour}:${minutes}`;
}
exports.timeFormat = timeFormat;
/**
 * HTMLエスケープ
 * @memberof Util.UtilModule
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
 * @memberof Util.UtilModule
 * @function formatPrice
 * @param {number} price
 * @returns {string}
 */
function formatPrice(price) {
    return String(price).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
}
exports.formatPrice = formatPrice;
/**
 * ベース64エンコード
 * @memberof Util.UtilModule
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
 * @memberof Util.UtilModule
 * @function base64Decode
 * @param {string} str
 * @returns {string}
 */
function base64Decode(str) {
    return new Buffer(str, 'base64').toString();
}
exports.base64Decode = base64Decode;
/**
 * メール内容取得
 * @memberof Util.UtilModule
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
            });
        });
    });
}
exports.getEmailTemplate = getEmailTemplate;
/**
 * @memberof Util.UtilModule
 * @enum DIGITS
 * @type number
 */
var DIGITS;
(function (DIGITS) {
    DIGITS[DIGITS["02"] = -2] = "02";
    DIGITS[DIGITS["03"] = -3] = "03";
    DIGITS[DIGITS["08"] = -8] = "08";
})(DIGITS = exports.DIGITS || (exports.DIGITS = {}));
/**
 * 表示
 * @memberof Util.UtilModule
 * @enum VIEW
 */
var VIEW;
(function (VIEW) {
    /**
     * Default
     */
    VIEW[VIEW["Default"] = 'default'] = "Default";
    /**
     * 券売機
     */
    VIEW[VIEW["Fixed"] = 'fixed'] = "Fixed";
})(VIEW = exports.VIEW || (exports.VIEW = {}));
/**
 * 環境
 * @memberof Util.UtilModule
 * @enum ENV
 * @type string
 */
var ENV;
(function (ENV) {
    /**
     * 開発
     */
    ENV[ENV["Development"] = 'development'] = "Development";
    /**
     * テスト
     */
    ENV[ENV["Test"] = 'test'] = "Test";
    /**
     * 本番
     */
    ENV[ENV["Production"] = 'production'] = "Production";
})(ENV = exports.ENV || (exports.ENV = {}));
