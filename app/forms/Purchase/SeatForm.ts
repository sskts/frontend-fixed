/**
 * 座席選択フォーム
 * @namespace SeatForm
 */
import { Request } from 'express';

/**
 * 座席選択
 * @memberof SeatForm
 * @function seatSelect
 * @param {Request} req
 * @returns {void}
 */
export function seatSelect(req: Request): void {
    req.checkBody(
        'seats',
        `${req.__('common.seat')}${req.__('common.validation.required')}`
    ).notEmpty();
    req.checkBody(
        'seats',
        `${req.__('common.seat')}${req.__('common.validation.is_json')}`
    ).isJSON();

    req.checkBody(
        'agree',
        `${req.__('common.agreement')}${req.__('common.validation.agree')}`
    ).notEmpty();
}

/**
 * スクリーン状態取得
 * @memberof SeatForm
 * @function screenStateReserve
 * @param {Request} req
 * @returns {void}
 */
export function screenStateReserve(req: Request): void {
    req.checkBody('theater_code').notEmpty();
    req.checkBody('date_jouei').notEmpty();
    req.checkBody('title_code').notEmpty();
    req.checkBody('title_branch_num').notEmpty();
    req.checkBody('time_begin').notEmpty();
    req.checkBody('screen_code').notEmpty();
}

/**
 * 券種保存
 * @memberof salesTickets
 * @param {Request} req
 * @returns {void}
 */
export function salesTickets(req: Request): void {
    req.checkBody('theater_code').notEmpty();
    req.checkBody('date_jouei').notEmpty();
    req.checkBody('title_code').notEmpty();
    req.checkBody('title_branch_num').notEmpty();
    req.checkBody('time_begin').notEmpty();
    req.checkBody('screen_code').notEmpty();
}
