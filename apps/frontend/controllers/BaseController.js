"use strict";
const log4js = require('log4js');
const moment = require('moment');
const locales_1 = require('../middlewares/locales');
const config = require('config');
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
    getPerformance(performancesId, cb) {
        let endpoint = config.get('mp_api_endpoint');
        let method = 'performance';
        console.log(performancesId, endpoint, method);
        cb({
            "__v": 0,
            "_id": "001201701018513021010",
            "canceled": false,
            "created_at": "2017-01-01T08:57:31.643Z",
            "day": "20170101",
            "film": {
                "_id": "00185130",
                "coa_title_branch_num": "0",
                "coa_title_code": "8513",
                "minutes": 107,
                "name": {
                    "en": "",
                    "ja": "君の名は。"
                }
            },
            "theater": {
                "_id": "001",
                "name": {
                    "en": "CoaCimema",
                    "ja": "コア・シネマ"
                }
            },
            "screen": {
                "_id": "0012",
                "coa_screen_code": "2",
                "name": {
                    "en": "Cinema2",
                    "ja": "シネマ２"
                }
            },
            "time_end": "1205",
            "time_start": "1010",
            "updated_at": "2017-01-15T07:27:57.170Z" });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BaseController;
