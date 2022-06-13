"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseTicketForm = void 0;
/**
 * 券種選択
 */
function purchaseTicketForm(req) {
    req.checkBody('reserveTickets', `${req.__('common.reserve_tickets')}${req.__('common.validation.required')}`).notEmpty();
    req.checkBody('reserveTickets', `${req.__('common.reserve_tickets')}${req.__('common.validation.is_json')}`).isJSON();
}
exports.purchaseTicketForm = purchaseTicketForm;
