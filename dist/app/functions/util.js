"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTelephone = exports.sleep = exports.Env = exports.View = exports.Digits = exports.getEmailTemplate = exports.formatPrice = exports.escapeHtml = exports.timeFormat = exports.getApiOption = void 0;
const libphonenumber = require("google-libphonenumber");
const moment = require("moment");
const models_1 = require("../models");
/**
 * API設定取得
 */
function getApiOption(req) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.session === undefined) {
            throw new models_1.AppError(httpStatus.BAD_REQUEST, models_1.ErrorType.Property);
        }
        const authModel = new models_1.AuthModel(req.session.auth);
        return {
            endpoint: process.env.SSKTS_API_ENDPOINT,
            auth: yield authModel.create(),
            project: {
                id: process.env.PROJECT_ID,
            },
        };
    });
}
exports.getApiOption = getApiOption;
/**
 * 時間フォーマット
 */
function timeFormat(screeningTime, referenceDate) {
    const HOUR = 60;
    const diff = moment(screeningTime).diff(moment(referenceDate), 'minutes');
    const hour = `00${Math.floor(diff / HOUR)}`.slice(Digits['02']);
    const minutes = moment(screeningTime).format('mm');
    return `${hour}:${minutes}`;
}
exports.timeFormat = timeFormat;
/**
 * HTMLエスケープ
 */
function escapeHtml(str) {
    const change = (match) => {
        const changeList = {
            '&': '&amp;',
            // tslint:disable-next-line:quotemark
            "'": '&#x27;',
            '`': '&#x60;',
            '"': '&quot;',
            '<': '&lt;',
            '>': '&gt;',
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
var Digits;
(function (Digits) {
    Digits[Digits["02"] = -2] = "02";
    Digits[Digits["03"] = -3] = "03";
    Digits[Digits["08"] = -8] = "08";
})(Digits = exports.Digits || (exports.Digits = {}));
/**
 * 表示
 * @memberof Util.UtilModule
 * @enum VIEW
 */
var View;
(function (View) {
    /**
     * Default
     */
    View["Default"] = "default";
    /**
     * 券売機
     */
    View["Fixed"] = "fixed";
})(View = exports.View || (exports.View = {}));
/**
 * 環境
 * @memberof Util.UtilModule
 * @enum ENV
 * @type string
 */
var Env;
(function (Env) {
    /**
     * 開発
     */
    Env["Development"] = "development";
    /**
     * テスト
     */
    Env["Test"] = "test";
    /**
     * 本番
     */
    Env["Production"] = "production";
})(Env = exports.Env || (exports.Env = {}));
/**
 * ミリ秒待つ
 * デフォルト値3000ms
 */
function sleep(time = 3000) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, time);
        });
    });
}
exports.sleep = sleep;
/**
 * 電話番号変換
 */
function formatTelephone(telephone, format) {
    if (telephone === undefined) {
        return '';
    }
    const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
    const phoneNumber = phoneUtil.parseAndKeepRawInput(telephone, 'JP');
    const phoneFormat = format === undefined
        ? libphonenumber.PhoneNumberFormat.INTERNATIONAL
        : format;
    return phoneUtil.format(phoneNumber, phoneFormat).replace(/\s/g, '');
}
exports.formatTelephone = formatTelephone;
