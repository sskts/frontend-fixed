/**
 * 方法
 * @namespace MethodModule
 */

import { Request, Response } from 'express';

/**
 * 発券方法ページ表示
 * @memberof MethodModule
 * @function ticketing
 * @param {Request} req
 * @param {Response} res
 * @returns {void}
 */
export function ticketing(_: Request, res: Response): void {
    res.render('method/ticketing');

    return;
}

/**
 * 入場方法説明ページ表示
 * @memberof MethodModule
 * @function entry
 * @param {Request} req
 * @param {Response} res
 * @returns {void}
 */
export function entry(_: Request, res: Response): void {
    res.render('method/entry');

    return;
}

/**
 * ブックマーク方法説明ページ表示
 * @memberof MethodModule
 * @function bookmark
 * @param {Request} req
 * @param {Response} res
 * @returns {void}
 */
export function bookmark(_: Request, res: Response): void {
    res.render('method/bookmark');

    return;
}
