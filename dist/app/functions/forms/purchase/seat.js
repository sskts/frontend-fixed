"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseSalesTicketsForm = exports.purchaseScreenStateReserveForm = exports.purchaseSeatSelectForm = void 0;
/**
 * 座席選択
 * @memberof SeatForm
 * @function seatSelect
 * @param {Request} req
 * @returns {void}
 */
function purchaseSeatSelectForm(req) {
    req.checkBody('seats', `${req.__('common.seat')}${req.__('common.validation.required')}`).notEmpty();
    req.checkBody('seats', `${req.__('common.seat')}${req.__('common.validation.is_json')}`).isJSON();
    req.checkBody('agree', `${req.__('common.agreement')}${req.__('common.validation.agree')}`).notEmpty();
}
exports.purchaseSeatSelectForm = purchaseSeatSelectForm;
/**
 * スクリーン状態取得
 * @memberof SeatForm
 * @function purchaseScreenStateReserveForm
 * @param {Request} req
 * @returns {void}
 */
function purchaseScreenStateReserveForm(req) {
    req.checkBody('theaterCode').notEmpty();
    req.checkBody('dateJouei').notEmpty();
    req.checkBody('titleCode').notEmpty();
    req.checkBody('titleBranchNum').notEmpty();
    req.checkBody('timeBegin').notEmpty();
    req.checkBody('screenCode').notEmpty();
}
exports.purchaseScreenStateReserveForm = purchaseScreenStateReserveForm;
/**
 * 券種保存
 * @memberof salesTickets
 * @param {Request} req
 * @returns {void}
 */
function purchaseSalesTicketsForm(req) {
    req.checkBody('theaterCode').notEmpty();
    req.checkBody('dateJouei').notEmpty();
    req.checkBody('titleCode').notEmpty();
    req.checkBody('titleBranchNum').notEmpty();
    req.checkBody('timeBegin').notEmpty();
    req.checkBody('screenCode').notEmpty();
}
exports.purchaseSalesTicketsForm = purchaseSalesTicketsForm;
