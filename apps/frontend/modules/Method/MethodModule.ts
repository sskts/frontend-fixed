/**
 * 方法
 * @namespace MethodModule
 */

import * as express from 'express';

/**
 * 発券方法ページ表示
 * @memberOf MethodModule
 * @function ticketing
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
// tslint:disable-next-line:variable-name
export function ticketing(_req: express.Request, res: express.Response, _next: express.NextFunction): void {
    return res.render('method/ticketing');
}

/**
 * 入場方法説明ページ表示
 * @memberOf MethodModule
 * @function entry
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
// tslint:disable-next-line:variable-name
export function entry(_req: express.Request, res: express.Response, _next: express.NextFunction): void {
    return res.render('method/entry');
}

/**
 * ブックマーク方法説明ページ表示
 * @memberOf MethodModule
 * @function bookmark
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
// tslint:disable-next-line:variable-name
export function bookmark(_req: express.Request, res: express.Response, _next: express.NextFunction): void {
    return res.render('method/bookmark');
}
