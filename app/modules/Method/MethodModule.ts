/**
 * 方法
 * @namespace MethodModule
 */

import { NextFunction, Request, Response } from 'express';

/**
 * 発券方法ページ表示
 * @memberof MethodModule
 * @function ticketing
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
// tslint:disable-next-line:variable-name
export function ticketing(_req: Request, res: Response, _next: NextFunction): void {
    res.render('method/ticketing');

    return;
}

/**
 * 入場方法説明ページ表示
 * @memberof MethodModule
 * @function entry
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
// tslint:disable-next-line:variable-name
export function entry(_req: Request, res: Response, _next: NextFunction): void {
    res.render('method/entry');

    return;
}

/**
 * ブックマーク方法説明ページ表示
 * @memberof MethodModule
 * @function bookmark
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
// tslint:disable-next-line:variable-name
export function bookmark(_req: Request, res: Response, _next: NextFunction): void {
    res.render('method/bookmark');

    return;
}
