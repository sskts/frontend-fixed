/**
 * 座席テスト
 * @namespace Screen.ScreenModule
 */

import { Request, Response } from 'express';
import * as fs from 'fs-extra';
import * as UtilModule from '../Util/UtilModule';

/**
 * 座席選択
 * @memberOf Screen.ScreenModule
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function index(_: Request, res: Response): Promise<void> {
    res.render('screens/test');
}

/**
 * スクリーン状態取得
 * @memberOf Screen.ScreenModule
 * @function getScreenStateReserve
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<Response>}
 */
export async function getScreenStateReserve(req: Request, res: Response): Promise<Response> {
    try {
        const theaterCode = `00${req.body.theater_code}`.slice(UtilModule.DIGITS_02);
        const screenCode = `000${req.body.screen_code}`.slice(UtilModule.DIGITS_03);
        const screen = await fs.readJSON(`./app/theaters/${theaterCode}/${screenCode}.json`);
        const setting = await fs.readJSON('./app/theaters/setting.json');
        return res.json({
            err: null,
            result: {
                screen: screen,
                setting: setting
            }
        });
    } catch (err) {
        return res.json({ err: err, result: null });
    }
}
