/**
 * 照会
 * @namespace Fixed.FixedModule
 */

import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as MP from '../../../libs/MP';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';
const log = debug('SSKTS:Fixed.FixedModule');

/**
 * 券売機TOPページ表示
 * @memberof FixedModule
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
 * @memberof FixedModule
 * @function setting
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function setting(_: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        res.locals.theaters = await MP.getTheaters();
        res.render('setting/index');
    } catch (err) {
        next(new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message));
    }
}

/**
 * 利用停止ページ表示
 * @memberof FixedModule
 * @function stop
 * @param {Response} res
 * @returns {void}
 */
export function stop(_: Request, res: Response): void {
    res.render('stop/index');
}
