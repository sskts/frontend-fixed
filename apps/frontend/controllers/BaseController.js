"use strict";
const log4js = require('log4js');
const moment = require('moment');
const locales_1 = require('../middlewares/locales');
class BaseController {
    constructor(req, res, next) {
        this.req = req;
        this.res = res;
        this.next = next;
        this.router = this.req.app.namedRoutes;
        this.logger = log4js.getLogger('system');
        if (this.req.session && this.req.session['locale']) {
            locales_1.default.setLocale(this.req, this.req.session['locale']);
        }
        this.setLocals();
    }
    setLocals() {
        this.res.locals.req = this.req;
        this.res.locals.escapeHtml = this.escapeHtml;
        this.res.locals.formatPrice = this.formatPrice;
        this.res.locals.moment = moment;
    }
    escapeHtml(string) {
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
    formatPrice(price) {
        return String(price).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
    }
    getPerformanceId(theaterCode, day, titleCode, titleBranchNum, screenCode, timeBegin) {
        return `${theaterCode}${day}${titleCode}${titleBranchNum}${screenCode}${timeBegin}`;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BaseController;
