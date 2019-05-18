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
export function purchaseSeatSelectForm(req: Request): void {
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
 * @function purchaseScreenStateReserveForm
 * @param {Request} req
 * @returns {void}
 */
export function purchaseScreenStateReserveForm(req: Request): void {
    req.checkBody('theaterCode').notEmpty();
    req.checkBody('dateJouei').notEmpty();
    req.checkBody('titleCode').notEmpty();
    req.checkBody('titleBranchNum').notEmpty();
    req.checkBody('timeBegin').notEmpty();
    req.checkBody('screenCode').notEmpty();
}

/**
 * 券種保存
 * @memberof salesTickets
 * @param {Request} req
 * @returns {void}
 */
export function purchaseSalesTicketsForm (req: Request): void {
    req.checkBody('theaterCode').notEmpty();
    req.checkBody('dateJouei').notEmpty();
    req.checkBody('titleCode').notEmpty();
    req.checkBody('titleBranchNum').notEmpty();
    req.checkBody('timeBegin').notEmpty();
    req.checkBody('screenCode').notEmpty();
}
