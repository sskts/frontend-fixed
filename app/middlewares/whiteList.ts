/**
 * アクセス許可
 */
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import { URL } from 'url';

const log = debug('SSKTS:middlewares:whiteList');

/**
 * アクセス許可ミドルウェア
 *
 * @module whiteList
 */
export default (req: Request, res: Response, next: NextFunction) => {
    if (process.env.WHITELIST !== undefined) {
        const whiteList = (<string>process.env.WHITELIST).replace(/\s+/g, '').split(',');
        const requestUrl = (req.xhr) ? req.get('Origin')
            : (req.xhr) ? req.get('Origin')
                : (req.get('referer') !== undefined) ? new URL(<string>req.get('referer')).origin
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
