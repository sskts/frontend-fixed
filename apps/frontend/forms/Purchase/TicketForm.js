"use strict";
const form = require("express-form");
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 購入券種選択
 */
exports.default = (req) => {
    return form(form.field('reserve_tickets', req.__('common.ticket')).trim().required().custom((value) => {
        try {
            const tickets = JSON.parse(value);
            for (const ticket of tickets) {
                if (!ticket.seat_code
                    || !ticket.section
                    || !ticket.ticket_code) {
                    throw new Error();
                }
            }
        }
        catch (err) {
            throw new Error(`%s${req.__('common.validation.is_json')}`);
        }
    }), form.field('mvtk').trim());
};
