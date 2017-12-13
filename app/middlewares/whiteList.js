"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * アクセス許可
 */
const debug = require("debug");
const log = debug('SSKTS:middlewares:whiteList');
/**
 * アクセス許可ミドルウェア
 *
 * @module whiteList
 */
exports.default = (req, res, next) => {
    if (process.env.WHITELIST !== undefined) {
        const whiteList = process.env.WHITELIST.replace(/\s+/g, '').split(',');
        const allowOrigin = whiteList.find((value) => (value === req.get('Origin')));
        if (allowOrigin !== undefined) {
            res.setHeader('Access-Control-Allow-Origin', allowOrigin);
            res.setHeader('X-Frame-Options', `ALLOW-FROM ${allowOrigin}`);
            log('whiteList', allowOrigin);
        }
    }
    next();
};
