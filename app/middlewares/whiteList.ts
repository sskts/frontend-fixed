/**
 * アクセス許可
 */
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';

const log = debug('SSKTS:middlewares:whiteList');

/**
 * アクセス許可ミドルウェア
 *
 * @module whiteList
 */
export default (req: Request, res: Response, next: NextFunction) => {
    if (process.env.WHITELIST !== undefined) {
        const whiteList = (<string>process.env.WHITELIST).replace(/\s+/g, '').split(',');
        const allowOrigin = whiteList.find((value) => (value === req.get('Origin')));
        if (allowOrigin !== undefined) {
            res.setHeader('Access-Control-Allow-Origin', allowOrigin);
            res.setHeader('X-Frame-Options', `ALLOW-FROM ${allowOrigin}`);
            log('whiteList', allowOrigin);
        }
    }
    next();
};