/**
 * 照会
 * @namespace Inplace.InplaceModule
 */

import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';
const log = debug('SSKTS:Inplace.InplaceModule');

/**
 * 券売機TOPページ表示
 * @memberOf InplaceModule
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
export function index(req: Request, res: Response, next: NextFunction): void {
    if (req.session === undefined) {
        next(new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_PROPERTY, undefined));
        return;
    }
    delete req.session.purchase;
    delete req.session.mvtk;
    delete req.session.complete;
    res.render('index/index');
    log('券売機TOPページ表示');
}

/**
 * 券売機設定ページ表示
 * @memberOf InplaceModule
 * @function setting
 * @param {Response} res
 * @returns {void}
 */
export function setting(_: Request, res: Response): void {
    res.render('setting/index');
}

/**
 * 利用停止ページ表示
 * @memberOf InplaceModule
 * @function stop
 * @param {Response} res
 * @returns {void}
 */
export function stop(_: Request, res: Response): void {
    res.render('stop/index');
}
