/**
 * 照会
 * @namespace Inplace.InplaceModule
 */

import * as debug from 'debug';
import { Request, Response } from 'express';
const log = debug('SSKTS:Inplace.InplaceModule');

/**
 * 券売機TOPページ表示
 * @memberOf InplaceModule
 * @function index
 * @param {Response} res
 * @returns {void}
 */
export function index(_: Request, res: Response): void {
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
