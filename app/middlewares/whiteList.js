"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * アクセス許可
 */
const debug = require("debug");
const url_1 = require("url");
const log = debug('SSKTS:middlewares:whiteList');
/**
 * アクセス許可ミドルウェア
 *
 * @module whiteList
 */
exports.default = (req, res, next) => {
    if (process.env.WHITELIST !== undefined) {
        const whiteList = process.env.WHITELIST.replace(/\s+/g, '').split(',');
        const requestUrl = (req.xhr) ? req.get('Origin')
            : (req.xhr) ? req.get('Origin')
                : (req.get('referer') !== undefined) ? new url_1.URL(req.get('referer')).origin
                    : '';
        const allowOrigin = whiteList.find((value) => (value === requestUrl));
        if (allowOrigin !== undefined) {
            res.setHeader('Access-Control-Allow-Origin', allowOrigin);
            res.setHeader('X-Frame-Options', `ALLOW-FROM ${allowOrigin}`);
            res.setHeader('Content-Security-Policy', `frame-ancestors ${allowOrigin}`);
            log('whiteList', allowOrigin);
        }
    }
    next();
};
